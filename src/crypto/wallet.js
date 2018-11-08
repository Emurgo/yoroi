// @flow

import _ from 'lodash'
import {BigNumber} from 'bignumber.js'
import {defaultMemoize} from 'reselect'

import storage from '../utils/storage'
import {AddressChain, AddressGenerator} from './chain'
import * as util from './util'
import api from '../api'
import {CONFIG} from '../config'
import assert from '../utils/assert'
import {Logger} from '../utils/logging'
import {
  synchronize,
  nonblockingSynchronize,
  IsLockedError,
} from '../utils/promise'
import {TransactionCache} from './transactionCache'

import type {
  RawUtxo,
  TransactionInput,
  PreparedTransactionData,
} from '../types/HistoryTransaction'
import type {Mutex} from '../utils/promise'

type WalletState = {|
  generatedAddressCount: number,
|}

const ownAddressesSelector = (
  internal: Array<string>,
  external: Array<string>,
) => [...internal, ...external]

export class Wallet {
  _encryptedMasterKey: any = null
  // $FlowFixMe null
  _internalChain: AddressChain = null
  // $FlowFixMe null
  _externalChain: AddressChain = null

  _state: WalletState = {
    generatedAddressCount: 0,
  }

  _isInitialized: boolean = false
  _doFullSyncMutex: Mutex = {name: 'doFullSyncMutex', lock: null}
  _subscriptions: Array<(Wallet) => any> = []
  // $FlowFixMe null
  _transactionCache: TransactionCache = null
  _ownAddressesSelector = defaultMemoize(ownAddressesSelector)

  /* global $Shape */
  updateState(update: $Shape<WalletState>) {
    Logger.debug('WalletManager update state')
    Logger.debug('Update', update)

    this._state = {
      ...this._state,
      ...update,
    }

    this.notify()
  }

  // needs to be bound
  notify = () => {
    this._subscriptions.forEach((handler) => handler(this))
  }

  subscribe(handler: (Wallet) => any) {
    this._subscriptions.push(handler)
  }

  get transactions() {
    return this._transactionCache.transactions
  }

  get confirmationCounts() {
    return this._transactionCache.confirmationCounts
  }

  _setupSubscriptions() {
    this._transactionCache.subscribe(this.notify)
    this._internalChain.addSubscriberToNewAddresses(this.notify)
    this._externalChain.addSubscriberToNewAddresses(this.notify)
  }

  async _create(mnemonic: string, newPassword: string) {
    Logger.info('create wallet')
    assert.assert(!this._isInitialized, 'createWallet: !isInitialized')
    const masterKey = await util.getMasterKeyFromMnemonic(mnemonic)
    const account = await util.getAccountFromMasterKey(masterKey)
    this._encryptedMasterKey = await util.encryptMasterKey(
      masterKey,
      newPassword,
    )

    this._transactionCache = new TransactionCache()

    // initialize address chains
    this._internalChain = new AddressChain(
      new AddressGenerator(account, 'Internal'),
    )
    this._externalChain = new AddressChain(
      new AddressGenerator(account, 'External'),
    )

    // Create at least one address in each block
    await this._internalChain.initialize()
    await this._externalChain.initialize()

    // We should start with 1 generated address
    this._state = {
      generatedAddressCount: 1,
    }

    this._setupSubscriptions()
    this.notify()

    this._isInitialized = true
  }

  _restore(data) {
    Logger.info('restore wallet')
    assert.assert(!this._isInitialized, 'restoreWallet: !isInitialized')
    this._state = {
      generatedAddressCount: data.generatedAddressCount,
    }
    this._internalChain = AddressChain.fromJSON(data.internalChain)
    this._externalChain = AddressChain.fromJSON(data.externalChain)
    this._transactionCache = TransactionCache.fromJSON(data.transactionCache)
    this._encryptedMasterKey = data.encryptedMasterKey

    // subscriptions
    this._setupSubscriptions()

    this._isInitialized = true
  }

  async doFullSync() {
    return await synchronize(this._doFullSyncMutex, () => this._doFullSync())
  }

  async tryDoFullSync() {
    try {
      return await nonblockingSynchronize(this._doFullSyncMutex, () =>
        this._doFullSync(),
      )
    } catch (e) {
      if (e instanceof IsLockedError) {
        return null
      } else {
        throw e
      }
    }
  }

  async _doFullSync() {
    Logger.info('Do full sync')
    assert.assert(this._isInitialized, 'doFullSync: isInitialized')
    await Promise.all([
      this._internalChain.sync(api.filterUsedAddresses),
      this._externalChain.sync(api.filterUsedAddresses),
    ])
    Logger.info('Discovery done, now syncing transactions')
    let keepGoing = true
    while (keepGoing) {
      keepGoing = await this._transactionCache.doSyncStep([
        ...this._internalChain.getBlocks(),
        ...this._externalChain.getBlocks(),
      ])
    }

    return this._transactionCache.transactions
  }

  // TODO(ppershing): memoize
  getOwnAddresses() {
    if (!this._isInitialized) return []

    return this._ownAddressesSelector(
      this._internalChain.addresses,
      this._externalChain.addresses,
    )
  }

  getUiReceiveAddresses() {
    if (!this._isInitialized) return []

    assert.assert(
      this._state.generatedAddressCount <= this._externalChain.size(),
      'getUiReceiveAddresses:: count',
    )
    const addresses = this._externalChain.addresses.slice(
      0,
      this._state.generatedAddressCount,
    )
    return addresses.map((address) => ({
      address,
      isUsed: this.isUsedAddress(address),
    }))
  }

  isUsedAddress(address: string) {
    return (
      !!this._transactionCache.perAddressTxs[address] &&
      this._transactionCache.perAddressTxs[address].length > 0
    )
  }

  generateNewUiReceiveAddress(): boolean {
    // TODO(ppershing): use "assuredly used" instead of "seen"
    const usedCount = this._externalChain.addresses
      .slice(0, this._state.generatedAddressCount)
      .filter((address) => this.isUsedAddress(address)).length

    if (
      usedCount + CONFIG.WALLET.MAX_GENERATED_UNUSED <=
      this._state.generatedAddressCount
    ) {
      return false
    }
    this.updateState({
      generatedAddressCount: this._state.generatedAddressCount + 1,
    })

    return true
  }

  transformUtxoToInput(utxo: RawUtxo): TransactionInput {
    const chains = [
      [util.ADDRESS_TYPE_INDEX.INTERNAL, this._internalChain],
      [util.ADDRESS_TYPE_INDEX.EXTERNAL, this._externalChain],
    ]

    let addressInfo = null
    chains.forEach(([type, chain]) => {
      if (chain.isMyAddress(utxo.receiver)) {
        addressInfo = {type, index: chain.getIndexOfAddress(utxo.receiver)}
      }
    })

    /* :: if (!addressInfo) throw 'assert' */
    assert.assert(addressInfo, `Address not found for utxo: ${utxo.receiver}`)

    return {
      ptr: {
        id: utxo.tx_hash,
        index: utxo.tx_index,
      },
      value: {
        address: utxo.receiver,
        value: utxo.amount,
      },
      addressing: {
        account: CONFIG.WALLET.ACCOUNT_INDEX,
        change: addressInfo.type,
        index: addressInfo.index,
      },
    }
  }

  getChangeAddress() {
    const candidateAddresses = this._internalChain.addresses
    const unseen = candidateAddresses.filter(
      (addr) => !this.isUsedAddress(addr),
    )
    assert.assert(unseen.length > 0, 'Cannot find change address')
    return _.first(unseen)
  }

  async prepareTransaction(
    utxos: Array<RawUtxo>,
    receiverAddress: string,
    amount: BigNumber,
  ): Promise<PreparedTransactionData> {
    const inputs = utxos.map((utxo) => this.transformUtxoToInput(utxo))

    const outputs = [{address: receiverAddress, value: amount.toString()}]
    const changeAddress = this.getChangeAddress()
    const fakeWallet = await util.generateFakeWallet()
    const fakeTx = await util.signTransaction(
      fakeWallet,
      inputs,
      outputs,
      changeAddress,
    )
    Logger.debug(inputs)
    Logger.debug(outputs)
    Logger.debug(changeAddress)

    return {
      inputs,
      outputs,
      changeAddress,
      fee: fakeTx.fee,
    }
  }

  async submitTransaction(
    transaction: PreparedTransactionData,
    password: string,
  ) {
    const {inputs, outputs, changeAddress, fee} = transaction

    const decryptedMasterKey = await util.decryptMasterKey(
      this._encryptedMasterKey,
      password,
    )
    const signedTxData = await util.signTransaction(
      await util.getWalletFromMasterKey(decryptedMasterKey),
      inputs,
      outputs,
      changeAddress,
    )

    assert.assert(fee.eq(signedTxData.fee), 'Transaction fee does not match')

    const signedTx = Buffer.from(signedTxData.cbor_encoded_tx, 'hex').toString(
      'base64',
    )
    const response = await api.submitTransaction(signedTx)
    Logger.info(response)
    return response
  }

  toJSON() {
    return {
      generatedAddressCount: this._state.generatedAddressCount,
      internalChain: this._internalChain.toJSON(),
      externalChain: this._externalChain.toJSON(),
      transactionCache: this._transactionCache.toJSON(),
      // TODO(ppershing): move this to keystore
      encryptedMasterKey: this._encryptedMasterKey,
    }
  }
}

class WalletManager {
  _wallet: ?Wallet = null
  _id: string = ''
  _subscribers: Array<() => any> = []

  // Note(ppershing): needs 'this' to be bound
  notify = () => {
    // TODO(ppershing): do this in next tick?
    this._subscribers.forEach((handler) => handler())
  }

  subscribe(handler: () => any) {
    this._subscribers.push(handler)
  }

  get isInitialized() {
    return this._wallet
  }

  get transactions() {
    if (!this._wallet) return {}
    return this._wallet.transactions
  }

  get ownAddresses() {
    if (!this._wallet) return []
    return this._wallet.getOwnAddresses()
  }

  get confirmationCounts() {
    if (!this._wallet) return {}
    return this._wallet.confirmationCounts
  }

  get receiveAddresses() {
    if (!this._wallet) return []
    return this._wallet.getUiReceiveAddresses()
  }

  generateNewUiReceiveAddress() {
    if (!this._wallet) return
    this._wallet.generateNewUiReceiveAddress()
    // TODO(ppershing): saveState
  }

  async doFullSync() {
    // TODO(ppershing): this should "quit" early if we change wallet
    if (!this._wallet) return
    await this._wallet.doFullSync()
    // TODO(ppershing): should we make save a runaway promise?
    await this.saveState()
    return
  }

  async tryDoFullSync() {
    if (!this._wallet) return
    await this._wallet.tryDoFullSync()
    // TODO(ppershing): should we make save a runaway promise?
    await this.saveState()
    return
  }

  async prepareTransaction(
    utxos: Array<RawUtxo>,
    address: string,
    amount: BigNumber,
  ) {
    if (!this._wallet) throw new Error()
    return await this._wallet.prepareTransaction(utxos, address, amount)
  }

  async submitTransaction(
    transactionData: PreparedTransactionData,
    password: string,
  ) {
    if (!this._wallet) throw new Error()
    return await this._wallet.submitTransaction(transactionData, password)
  }

  async createWallet(
    id: string,
    name: string,
    mnemonic: string,
    password: string,
  ): Promise<Wallet> {
    // Ignore id & name for now
    const wallet = new Wallet()
    await wallet._create(mnemonic, password)

    // TODO(ppershing): potential inconsistency between id and _wallet
    this._id = id
    await this.saveState()
    this._wallet = wallet
    wallet.subscribe(this.notify)
    this.notify()
    return wallet
  }

  async openOrCreateWallet(
    id: string,
    name: string,
    mnemonic: string,
    password: string,
  ): Promise<Wallet> {
    assert.preconditionCheck(!!id, 'openWallet:: !!id')
    const wallet = new Wallet()
    const data = await storage.read(`/wallet/${id}`)
    // TODO(ppershing): for now do auto-bypass
    if (!data) return this.createWallet(id, name, mnemonic, password)
    wallet._restore(data)
    this._wallet = wallet
    this._id = id
    wallet.subscribe(this.notify)
    this.notify()
    return wallet
  }

  async saveState() {
    if (!this._wallet) return
    assert.assert(this._id, 'saveState:: id')
    /* :: if (!this._wallet) throw 'assert' */
    const data = this._wallet.toJSON()
    await storage.write(`/wallet/${this._id}`, data)
  }
}

export default new WalletManager()
