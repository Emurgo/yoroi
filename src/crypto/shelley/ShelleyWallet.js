// @flow

// TODO(v-almonacid): this doesn't include haskell shelley logic yet
// but still the byron-era implementation

import _ from 'lodash'
import {BigNumber} from 'bignumber.js'
import uuid from 'uuid'
import DeviceInfo from 'react-native-device-info'

import Wallet from '../Wallet'
import {WalletInterface} from '../WalletInterface'
import {AddressChain, AddressGenerator} from '../chain'
import * as byronUtil from '../byron/util'
import * as jormungandrUtil from '../jormungandr/util'
import {ADDRESS_TYPE_TO_CHANGE} from '../commonUtils'
import * as api from '../../api/byron/api'
import {CONFIG} from '../../config/config'
import {NETWORK_REGISTRY} from '../../config/types'
import {isJormungandr} from '../../config/networks'
import assert from '../../utils/assert'
import {Logger} from '../../utils/logging'
import {InvalidState} from '../errors'
import {TransactionCache} from '../transactionCache'

import type {RawUtxo, TxBodiesRequest, TxBodiesResponse} from '../../api/types'
import type {
  AddressedUtxo,
  TransactionInput,
  PreparedTransactionData,
  V3SignedTx,
  V3UnsignedTxAddressedUtxoData,
} from './../types'
import type {CryptoAccount} from '../byron/util'
import type {HWDeviceInfo} from '../byron/ledgerUtils'
import type {NetworkId} from '../../config/types'
import type {DelegationTxData, PoolData} from '../jormungandr/delegationUtils'

export default class ShelleyWallet extends Wallet implements WalletInterface {
  // =================== create =================== //

  async _initialize(
    networkId: NetworkId,
    account: CryptoAccount | string,
    chimericAccountAddr: ?string,
    hwDeviceInfo: ?HWDeviceInfo,
  ) {
    this.networkId = networkId

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

  async create(mnemonic: string, newPassword: string, networkId: NetworkId) {
    Logger.info(`create wallet (networkId=${String(networkId)})`)
    this.id = uuid.v4()
    assert.assert(!this.isInitialized, 'createWallet: !isInitialized')
    const masterKey = await jormungandrUtil.generateWalletRootKey(mnemonic)
    const masterKeyHex = Buffer.from(await masterKey.as_bytes()).toString('hex')
    await this.encryptAndSaveMasterKey(
      'MASTER_PASSWORD',
      masterKeyHex,
      newPassword,
    )
    const chimericAccountAddr = null // not jormun
    const account = await byronUtil.getAccountFromMasterKey(masterKeyHex)

    return await this._initialize(
      networkId,
      account,
      chimericAccountAddr,
      null, // this is not a HW
    )
  }

  async createWithBip44Account(
    accountPublicKey: string,
    networkId: NetworkId,
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
      accountObj,
      chimericAccountAddr,
      hwDeviceInfo,
    )
  }

  // =================== persistence =================== //

  _integrityCheck(data) {
    try {
      if (this.networkId === NETWORK_REGISTRY.UNDEFINED) {
        // prettier-ignore
        this.networkId =
          data.isShelley != null
            ? data.isShelley
              ? NETWORK_REGISTRY.JORMUNGANDR
              : NETWORK_REGISTRY.BYRON_MAINNET
            : (() => {
              throw new Error('wallet::_integrityCheck: networkId')
            })()
      }
    } catch (e) {
      Logger.error('wallet::_integrityCheck', e)
      throw new InvalidState()
    }
  }

  // TODO(v-almonacid): move to parent class?
  async restore(data: any) {
    Logger.info('restore wallet')
    assert.assert(!this.isInitialized, 'restoreWallet: !isInitialized')
    this.state = {
      lastGeneratedAddressIndex: data.lastGeneratedAddressIndex,
    }
    this.networkId =
      data.networkId != null ? data.networkId : NETWORK_REGISTRY.UNDEFINED
    this.isHW = data.isHW != null ? data.isHW : false
    this.hwDeviceInfo = data.hwDeviceInfo
    this.version = data.version
    this.internalChain = AddressChain.fromJSON(data.internalChain)
    this.externalChain = AddressChain.fromJSON(data.externalChain)
    this.transactionCache = TransactionCache.fromJSON(data.transactionCache)
    this.isEasyConfirmationEnabled = data.isEasyConfirmationEnabled

    await this._integrityCheck(data)

    // subscriptions
    this.setupSubscriptions()

    this.isInitialized = true
  }

  // =================== tx building =================== //

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

  prepareTransaction(
    utxos: Array<RawUtxo>,
    receiverAddress: string,
    amount: BigNumber,
  ): Promise<PreparedTransactionData> {
    throw Error('not implemented')
  }

  signTx(
    transaction: PreparedTransactionData,
    decryptedMasterKey: string,
  ): Promise<string> {
    throw Error('not implemented')
  }

  prepareDelegationTx(
    poolData: PoolData,
    valueInAccount: number,
    utxos: Array<RawUtxo>,
  ): Promise<DelegationTxData> {
    throw Error('not implemented')
  }

  signDelegationTx(
    unsignedTx: V3UnsignedTxAddressedUtxoData,
    decryptedMasterKey: string,
  ): Promise<V3SignedTx> {
    throw Error('not implemented')
  }

  // =================== backend API =================== //

  async submitTransaction(signedTx: string) {
    const response = await api.submitTransaction(signedTx)
    Logger.info(response)
    return response
  }

  async getTxsBodiesForUTXOs(
    request: TxBodiesRequest,
  ): Promise<TxBodiesResponse> {
    return await api.getTxsBodiesForUTXOs(request)
  }

  async fetchUTXOs() {
    return await api.bulkFetchUTXOsForAddresses([
      ...this.internalAddresses,
      ...this.externalAddresses,
    ])
  }

  fetchAccountState() {
    throw Error('not implemented')
  }

  fetchPoolInfo() {
    throw Error('not implemented')
  }
}
