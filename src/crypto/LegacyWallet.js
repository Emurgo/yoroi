// @flow

/** ================ Legacy wallet implementation ===============
 * this contains the wallet functions that were used during the Byron-Jormungandr
 * era. Some are just kept as an archive and are not used anymore anywhere in
 * the app. The important implementations here are those related to the
 * Jormungandr wallet (delegation).
 * TODO: consider removing this class and create a new one for Jormungandr.
 */

import _ from 'lodash'
import {BigNumber} from 'bignumber.js'
import uuid from 'uuid'
import DeviceInfo from 'react-native-device-info'

import Wallet from './Wallet'
import {WalletInterface} from './WalletInterface'
import {AddressChain, AddressGenerator} from './chain'
import * as util from './byron/util'
import {ADDRESS_TYPE_TO_CHANGE} from './commonUtils'
import * as api from '../api/byron/api'
import {CONFIG} from '../config/config'
import {NETWORK_REGISTRY, WALLET_IMPLEMENTATION_REGISTRY} from '../config/types'
import {isJormungandr} from '../config/networks'
import assert from '../utils/assert'
import {Logger} from '../utils/logging'
import {InvalidState} from './errors'
import {TransactionCache} from './transactionCache'

import type {
  RawUtxo,
  PoolInfoRequest,
  TxBodiesRequest,
  TxBodiesResponse,
} from '../api/types'
import type {
  AddressedUtxo,
  BaseSignRequest,
  TransactionInput,
  PreparedTransactionData,
  SignedTx,
} from './types'
import type {CryptoAccount} from './byron/util'
import type {HWDeviceInfo} from './byron/ledgerUtils'
import type {NetworkId, WalletImplementationId} from '../config/types'
import type {WalletMeta} from '../state'

export default class LegacyWallet extends Wallet implements WalletInterface {
  // =================== create =================== //

  async _initialize(
    networkId: NetworkId,
    account: CryptoAccount | string,
    chimericAccountAddr: ?string,
    hwDeviceInfo: ?HWDeviceInfo,
    implementationId: WalletImplementationId,
  ) {
    this.networkId = networkId

    this.walletImplementationId = implementationId

    this.isHW = hwDeviceInfo != null

    this.hwDeviceInfo = hwDeviceInfo

    this.transactionCache = new TransactionCache()

    // initialize address chains
    this.internalChain = new AddressChain(
      new AddressGenerator(account, 'Internal', isJormungandr(networkId)),
    )
    this.externalChain = new AddressChain(
      new AddressGenerator(account, 'External', isJormungandr(networkId)),
    )

    this.chimericAccountAddress = chimericAccountAddr

    this.version = DeviceInfo.getVersion()

    // Create at least one address in each block
    await this.internalChain.initialize()
    await this.externalChain.initialize()

    this.setupSubscriptions()
    this.notify()

    this.isInitialized = true
    return this.id
  }

  async create(
    mnemonic: string,
    newPassword: string,
    networkId: NetworkId,
    implementationId: WalletImplementationId,
  ) {
    Logger.info(`create wallet (networkId=${String(networkId)})`)
    Logger.info(`create wallet (implementationId=${String(implementationId)})`)
    this.id = uuid.v4() // required by encryptAndSaveMasterKey
    assert.assert(!this.isInitialized, 'createWallet: !isInitialized')
    assert.assert(!isJormungandr(networkId), 'createWallet: !isJormungandr')

    const masterKey = await util.getMasterKeyFromMnemonic(mnemonic)
    await this.encryptAndSaveMasterKey(
      'MASTER_PASSWORD',
      masterKey,
      newPassword,
    )
    const account: CryptoAccount = await util.getAccountFromMasterKey(masterKey)

    return await this._initialize(
      networkId,
      implementationId,
      account,
      null, // only byron wallet supported, no chimeric account
      null, // this is not a HW
    )
  }

  async createWithBip44Account(
    accountPublicKey: string,
    networkId: NetworkId,
    implementationId: WalletImplementationId,
    hwDeviceInfo: ?HWDeviceInfo,
  ) {
    Logger.info(
      `create wallet with account pub key (networkId=${String(networkId)})`,
    )
    Logger.debug('account pub key', accountPublicKey)
    this.id = uuid.v4()
    assert.assert(!this.isInitialized, 'createWallet: !isInitialized')
    const chimericAccountAddr = null // only byron wallets supported for now
    const accountObj: CryptoAccount = {
      root_cached_key: accountPublicKey,
      derivation_scheme: 'V2',
    }
    return await this._initialize(
      networkId,
      implementationId,
      accountObj,
      chimericAccountAddr,
      hwDeviceInfo,
    )
  }

  // =================== persistence =================== //

  toJSON() {
    return {
      lastGeneratedAddressIndex: this.state.lastGeneratedAddressIndex,
      chimericAccountAddress: this.chimericAccountAddress,
      version: this.version,
      internalChain: this.internalChain.toJSON(),
      externalChain: this.externalChain.toJSON(),
      transactionCache: this.transactionCache.toJSON(),
      networkId: this.networkId,
      walletImplementationId: this.walletImplementationId,
      isHW: this.isHW,
      hwDeviceInfo: this.hwDeviceInfo,
      isEasyConfirmationEnabled: this.isEasyConfirmationEnabled,
    }
  }

  _integrityCheck(): void {
    try {
      assert.assert(this.networkId === NETWORK_REGISTRY.BYRON_MAINNET,
        'invalid networkId')
      assert.assert(
        this.walletImplementationId === WALLET_IMPLEMENTATION_REGISTRY.HASKELL_BYRON,
        'invalid walletClassId',
      )
      if (this.isHW) {
        assert.assert(
          this.hwDeviceInfo != null,
          'no device info for hardware wallet',
        )
      }
    } catch (e) {
      Logger.error('wallet::_integrityCheck', e)
      throw new InvalidState(e.message)
    }
  }

  restore(data: any, walletMeta: WalletMeta): Promise<void> {
    Logger.info('restore wallet')
    assert.assert(!this.isInitialized, 'restoreWallet: !isInitialized')
    this.state = {
      lastGeneratedAddressIndex: data.lastGeneratedAddressIndex,
    }

    // can be null for versions < 3.0.0
    this.networkId = data.networkId != null
      ? data.networkId
      : walletMeta.networkId
    // can be null for versions < 3.0.2
    this.walletClassId = data.walletClassId != null
      ? data.walletClassId
      : walletMeta.walletClassId

    this.isHW = data.isHW != null ? data.isHW : false
    this.hwDeviceInfo = data.hwDeviceInfo
    // note(v-almonacid): chimericAccountAddr can be null in versions <= 2.1.0
    // before it was named accountAddress
    this.chimericAccountAddress = data.chimericAccountAddress
    this.version = data.version
    this.internalChain = AddressChain.fromJSON(data.internalChain)
    this.externalChain = AddressChain.fromJSON(data.externalChain)
    this.transactionCache = TransactionCache.fromJSON(data.transactionCache)
    this.isEasyConfirmationEnabled = data.isEasyConfirmationEnabled

    this._integrityCheck()

    // subscriptions
    this.setupSubscriptions()

    this.isInitialized = true
    return Promise.resolve()
  }

  // =================== tx building =================== //

  // this uses legacy addressing scheme
  _transformUtxoToInput(utxo: RawUtxo): TransactionInput {
    const chains = [
      ['Internal', this.internalChain],
      ['External', this.externalChain],
    ]

    let addressInfo = null
    chains.forEach(([type, chain]) => {
      if (chain.isMyAddress(utxo.receiver)) {
        addressInfo = {
          change: ADDRESS_TYPE_TO_CHANGE[type],
          index: chain.getIndexOfAddress(utxo.receiver),
        }
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
        account: CONFIG.NUMBERS.ACCOUNT_INDEX,
        change: addressInfo.change,
        index: addressInfo.index,
      },
    }
  }

  getChangeAddress() {
    const candidateAddresses = this.internalChain.addresses
    const unseen = candidateAddresses.filter(
      (addr) => !this.isUsedAddress(addr),
    )
    assert.assert(unseen.length > 0, 'Cannot find change address')
    return _.first(unseen)
  }

  getAllUtxosForKey(utxos: Array<RawUtxo>) {
    throw Error('not implemented')
  }

  getAddressingInfo(address: string) {
    const chains = [
      ['Internal', this.internalChain],
      ['External', this.externalChain],
    ]
    let addressInfo = null
    chains.forEach(([type, chain]) => {
      if (chain.isMyAddress(address)) {
        addressInfo = {
          path: [
            CONFIG.NUMBERS.ACCOUNT_INDEX,
            ADDRESS_TYPE_TO_CHANGE[type],
            chain.getIndexOfAddress(address),
          ],
          startLevel: CONFIG.NUMBERS.BIP44_DERIVATION_LEVELS.ACCOUNT,
        }
      }
    })
    return addressInfo
  }

  asAddressedUtxo(utxos: Array<RawUtxo>): Array<AddressedUtxo> {
    const addressedUtxos = utxos.map(
      (utxo: RawUtxo): AddressedUtxo => {
        const addressInfo = this.getAddressingInfo(utxo.receiver)
        if (addressInfo == null) {
          throw new Error(`Address not found for utxo: ${utxo.receiver}`)
        }
        return {
          ...utxo,
          addressing: addressInfo,
        }
      },
    )
    return addressedUtxos
  }

  async prepareTransaction(
    utxos: Array<RawUtxo>,
    receiverAddress: string,
    amount: BigNumber,
  ): Promise<PreparedTransactionData> {
    const inputs = utxos.map((utxo) => this._transformUtxoToInput(utxo))

    const outputs = [{address: receiverAddress, value: amount.toFixed(0)}]
    const changeAddress = this.getChangeAddress()
    const fakeWallet = await util.generateFakeWallet()
    const fakeTx = await util.signTransaction(
      fakeWallet,
      inputs,
      outputs,
      changeAddress,
    )
    Logger.debug('Inputs', inputs)
    Logger.debug('Outputs', outputs)
    Logger.debug('Change address', changeAddress)

    return {
      inputs,
      outputs,
      changeAddress,
      fee: fakeTx.fee,
    }
  }

  async legacySignTx(
    transaction: PreparedTransactionData,
    decryptedMasterKey: string,
  ) {
    const {inputs, outputs, changeAddress, fee} = transaction

    const signedTxData = await util.signTransaction(
      await util.getWalletFromMasterKey(decryptedMasterKey),
      inputs,
      outputs,
      changeAddress,
    )

    assert.assert(fee.eq(signedTxData.fee), 'Transaction fee does not match')

    return Buffer.from(signedTxData.cbor_encoded_tx, 'hex').toString('base64')
  }

  createUnsignedTx(
    utxos: Array<RawUtxo>,
    receiver: string,
    amount: string,
  ): Promise<BaseSignRequest<any>> {
    throw Error('not implemented')
  }

  signTx(unsignedTx: any, decryptedMasterKey: string): Promise<any> {
    throw Error('not implemented')
  }

  prepareDelegationTx<T>(
    poolData: any,
    valueInAccount: number,
    utxos: Array<RawUtxo>,
  ): Promise<T> {
    throw Error('not implemented')
  }

  signDelegationTx<T>(
    unsignedTx: T,
    decryptedMasterKey: string,
  ): Promise<SignedTx> {
    throw Error('not implemented')
  }

  // =================== backend API =================== //

  async submitTransaction(signedTx: string) {
    const submitTxFn = api.submitTransaction
    const response = await submitTxFn(signedTx)
    Logger.info(response)
    return response
  }

  async getTxsBodiesForUTXOs(
    request: TxBodiesRequest,
  ): Promise<TxBodiesResponse> {
    const getTxsBodiesForUTXOsFn = api.getTxsBodiesForUTXOs
    return await getTxsBodiesForUTXOsFn(request)
  }

  async fetchUTXOs() {
    const fetchFn = api.bulkFetchUTXOsForAddresses
    return await fetchFn([...this.internalAddresses, ...this.externalAddresses])
  }

  fetchAccountState() {
    throw new Error('not implemented')
  }

  fetchPoolInfo(pool: PoolInfoRequest) {
    throw Error('not implemented')
  }
}
