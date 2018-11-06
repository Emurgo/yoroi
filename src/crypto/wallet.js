// @flow

import _ from 'lodash'
import {BigNumber} from 'bignumber.js'

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

type WalletHistoryState = {
  generatedAddressCount: number,
}

export class WalletManager {
  _encryptedMasterKey: any
  _internalChain: AddressChain
  _externalChain: AddressChain

  _state: WalletHistoryState

  _isInitialized: boolean
  _doFullSyncMutex: Mutex
  _restoreMutex: Mutex
  _subscriptions: Array<() => any>
  _transactionCache: TransactionCache

  constructor() {
    this._encryptedMasterKey = null
    // $FlowFixMe
    this._internalChain = null
    // $FlowFixMe
    this._externalChain = null
    this._state = {
      transactions: {},
      perAddressSyncMetadata: {},
      generatedAddressCount: 0,
    }

    this._isInitialized = false
    this._doFullSyncMutex = {name: 'doFullSyncMutex', lock: null}
    this._restoreMutex = {name: 'restoreMutex', lock: null}
    this._transactionCache = new TransactionCache()
    this._transactionCache.subscribe(() => this.updateState({}))
    this._subscriptions = []
  }

  /* global $Shape */
  updateState(update: $Shape<WalletHistoryState>) {
    Logger.debug('WalletManager update state')
    Logger.debug('Update', update)

    this._state = {
      ...this._state,
      ...update,
    }

    this._subscriptions.forEach((handler) => handler())
  }

  subscribe(handler: () => any) {
    this._subscriptions.push(handler)
  }

  get transactions() {
    return this._transactionCache.transactions
  }

  get confirmationCounts() {
    return this._transactionCache.confirmationCounts
  }

  restoreWallet(mnemonic: string, newPassword: string) {
    return synchronize(this._restoreMutex, () =>
      this._restoreWallet(mnemonic, newPassword),
    )
  }

  async _restoreWallet(mnemonic: string, newPassword: string) {
    Logger.info('restore wallet')
    assert.assert(!this._isInitialized, 'restoreWallet: !isInitialized')
    const masterKey = await util.getMasterKeyFromMnemonic(mnemonic)
    const account = await util.getAccountFromMasterKey(masterKey)
    this._encryptedMasterKey = await util.encryptMasterKey(
      newPassword,
      masterKey,
    )

    // initialize address chains
    this._internalChain = new AddressChain(
      new AddressGenerator(account, 'Internal'),
    )
    this._externalChain = new AddressChain(
      new AddressGenerator(account, 'External'),
    )

    // We want to monitor all new addresses
    this._internalChain.addSubscriberToNewAddresses(
      this.onDiscoveredAddresses.bind(this),
    )
    this._externalChain.addSubscriberToNewAddresses(
      this.onDiscoveredAddresses.bind(this),
    )

    // Create at least one address in each block
    await this._internalChain.initialize()
    await this._externalChain.initialize()

    // We should start with 1 generated address
    this.updateState({
      generatedAddressCount: 1,
    })

    this._isInitialized = true
  }

  onDiscoveredAddresses(addresses: Array<string>) {
    // broadcast change
    this.updateState({})
  }

  // TODO(ppershing): remove this once we can "open"
  // saved wallet from device store
  async __initTestWalletIfNeeded() {
    if (this._isInitialized) return
    const mnemonic = [
      'dry balcony arctic what garbage sort',
      'cart shine egg lamp manual bottom',
      'slide assault bus',
    ].join(' ')
    await this.restoreWallet(mnemonic, '')
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
    await this.__initTestWalletIfNeeded()
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
    if (this._isInitialized) {
      return [
        ...this._internalChain.addresses,
        ...this._externalChain.addresses,
      ]
    }

    return []
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
    Logger.info(inputs)
    Logger.info(outputs)
    Logger.info(changeAddress)

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
      password,
      this._encryptedMasterKey,
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
}

export default new WalletManager()
