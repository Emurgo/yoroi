// @flow

// implements Shelley-era wallets. Also supports legacy Byron wallets

import _ from 'lodash'
import uuid from 'uuid'
import DeviceInfo from 'react-native-device-info'
import {
  Bip32PrivateKey,
  Bip32PublicKey,
  /* eslint-disable-next-line camelcase */
  hash_transaction,
  Transaction,
  /* eslint-disable-next-line no-unused-vars */
  TransactionBuilder,
} from 'react-native-haskell-shelley'
import {BigNumber} from 'bignumber.js'
import {walletChecksum, legacyWalletChecksum} from '@emurgo/cip4-js'

import Wallet from '../Wallet'
import {WalletInterface} from '../WalletInterface'
import {AddressChain, AddressGenerator} from './chain'
import * as byronUtil from '../byron/util'
import {ADDRESS_TYPE_TO_CHANGE} from '../commonUtils'
import * as api from '../../api/byron/api'
import {CONFIG} from '../../config/config'
import {
  NETWORK_REGISTRY,
  WALLET_IMPLEMENTATION_REGISTRY,
} from '../../config/types'
import assert from '../../utils/assert'
import {Logger} from '../../utils/logging'
import {InvalidState} from '../errors'
import {TransactionCache} from './transactionCache'
import {signTransaction} from './transactions'
import {createUnsignedTx} from './transactionUtils'
import {genTimeToSlot} from '../../utils/timeUtils'

import type {RawUtxo, TxBodiesRequest, TxBodiesResponse} from '../../api/types'
import type {AddressedUtxo, BaseSignRequest, SignedTx} from './../types'
import type {HWDeviceInfo} from '../byron/ledgerUtils'
import type {NetworkId, WalletImplementationId} from '../../config/types'
import type {WalletMeta} from '../../state'

const _getWalletConfig = (implementationId: WalletImplementationId) => {
  switch (implementationId) {
    case WALLET_IMPLEMENTATION_REGISTRY.HASKELL_BYRON:
      return CONFIG.WALLETS.HASKELL_BYRON
    case WALLET_IMPLEMENTATION_REGISTRY.HASKELL_SHELLEY:
      return CONFIG.WALLETS.HASKELL_SHELLEY
    default:
      return CONFIG.WALLETS.HASKELL_SHELLEY
  }
}

export default class ShelleyWallet extends Wallet implements WalletInterface {
  // =================== create =================== //

  async _initialize(
    networkId: NetworkId,
    implementationId: WalletImplementationId,
    accountPubKeyHex: string,
    chimericAccountAddr: ?string,
    hwDeviceInfo: ?HWDeviceInfo,
  ) {
    this.networkId = networkId

    this.walletImplementationId = implementationId

    this.isHW = hwDeviceInfo != null

    this.hwDeviceInfo = hwDeviceInfo

    this.transactionCache = new TransactionCache()

    // initialize address chains
    this.internalChain = new AddressChain(
      new AddressGenerator(accountPubKeyHex, 'Internal', implementationId),
      _getWalletConfig(implementationId).DISCOVERY_BLOCK_SIZE,
      _getWalletConfig(implementationId).DISCOVERY_GAP_SIZE,
    )
    this.externalChain = new AddressChain(
      new AddressGenerator(accountPubKeyHex, 'External', implementationId),
      _getWalletConfig(implementationId).DISCOVERY_BLOCK_SIZE,
      _getWalletConfig(implementationId).DISCOVERY_GAP_SIZE,
    )

    this.publicKeyHex = accountPubKeyHex

    this.chimericAccountAddress = chimericAccountAddr

    this.version = DeviceInfo.getVersion()

    this.checksum =
      implementationId === WALLET_IMPLEMENTATION_REGISTRY.HASKELL_BYRON
        ? legacyWalletChecksum(accountPubKeyHex)
        : walletChecksum(accountPubKeyHex)

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
    this.id = uuid.v4()
    assert.assert(!this.isInitialized, 'createWallet: !isInitialized')
    const masterKey = await byronUtil.getMasterKeyFromMnemonic(mnemonic)
    await this.encryptAndSaveMasterKey(
      'MASTER_PASSWORD',
      masterKey,
      newPassword,
    )
    let _purpose
    switch (implementationId) {
      case WALLET_IMPLEMENTATION_REGISTRY.HASKELL_SHELLEY:
        _purpose = CONFIG.NUMBERS.WALLET_TYPE_PURPOSE.CIP1852
        break
      case WALLET_IMPLEMENTATION_REGISTRY.HASKELL_BYRON:
        _purpose = CONFIG.NUMBERS.WALLET_TYPE_PURPOSE.BIP44
        break
      default:
        throw new Error('wallet implementation id not valid')
    }

    const masterKeyPtr = await Bip32PrivateKey.from_bytes(
      Buffer.from(masterKey, 'hex'),
    )
    const accountKey = await (await (await masterKeyPtr.derive(
      _purpose,
    )).derive(CONFIG.NUMBERS.COIN_TYPES.CARDANO)).derive(
      0 + CONFIG.NUMBERS.HARD_DERIVATION_START,
    )
    const accountPubKey = await accountKey.to_public()
    const accountPubKeyHex = Buffer.from(
      await accountPubKey.as_bytes(),
    ).toString('hex')

    return await this._initialize(
      networkId,
      implementationId,
      accountPubKeyHex,
      null,
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
    return await this._initialize(
      networkId,
      implementationId,
      accountPublicKey,
      chimericAccountAddr,
      hwDeviceInfo,
    )
  }

  // =================== persistence =================== //

  _integrityCheck(): void {
    try {
      assert.assert(
        this.networkId === NETWORK_REGISTRY.HASKELL_SHELLEY,
        'invalid networkId',
      )
      assert.assert(
        this.walletImplementationId ===
          WALLET_IMPLEMENTATION_REGISTRY.HASKELL_SHELLEY ||
          this.walletImplementationId ===
            WALLET_IMPLEMENTATION_REGISTRY.HASKELL_BYRON,
        'invalid walletImplementationId',
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

  // TODO(v-almonacid): move to parent class?
  restore(data: any, walletMeta: WalletMeta) {
    Logger.info('restore wallet')
    assert.assert(!this.isInitialized, 'restoreWallet: !isInitialized')
    this.state = {
      lastGeneratedAddressIndex: data.lastGeneratedAddressIndex,
    }

    // can be null for versions < 3.0.0
    this.networkId =
      data.networkId != null ? data.networkId : walletMeta.networkId
    // can be null for versions < 3.0.2
    this.walletImplementationId =
      data.walletImplementationId != null
        ? data.walletImplementationId
        : walletMeta.walletImplementationId

    this.isHW = data.isHW != null ? data.isHW : false
    this.hwDeviceInfo = data.hwDeviceInfo
    this.version = data.version
    this.internalChain = AddressChain.fromJSON(data.internalChain)
    this.externalChain = AddressChain.fromJSON(data.externalChain)
    // can be null for versions < 3.0.2, in which case we can just retrieve
    // from address generator
    this.publicKeyHex =
      data.publicKeyHex != null
        ? data.publicKeyHex
        : this.internalChain.publicKey
    this.transactionCache = TransactionCache.fromJSON(data.transactionCache)
    this.isEasyConfirmationEnabled = data.isEasyConfirmationEnabled

    this._integrityCheck()

    // subscriptions
    this.setupSubscriptions()

    this.isInitialized = true
    return Promise.resolve()
  }

  // =================== tx building =================== //

  getChangeAddress() {
    const candidateAddresses = this.internalChain.addresses
    const unseen = candidateAddresses.filter(
      (addr) => !this.isUsedAddress(addr),
    )
    assert.assert(unseen.length > 0, 'Cannot find change address')
    return _.first(unseen)
  }

  _getAddressedChangeAddress() {
    const changeAddr = this.getChangeAddress()
    const addressInfo = this.getAddressingInfo(changeAddr)
    if (addressInfo == null) {
      throw new Error("Couldn't get change addressing, should never happen")
    }
    return {
      address: changeAddr,
      addressing: addressInfo,
    }
  }

  async getStakingKey() {
    assert.assert(
      this.walletImplementationId ===
        WALLET_IMPLEMENTATION_REGISTRY.HASKELL_SHELLEY,
      'cannot get staking key from a byron-era wallet',
    )
    const accountPubKey = await Bip32PublicKey.from_bytes(
      Buffer.from(this.publicKeyHex, 'hex'),
    )
    const stakingKey = await (await (await accountPubKey.derive(
      CONFIG.NUMBERS.CHAIN_DERIVATIONS.CHIMERIC_ACCOUNT,
    )).derive(CONFIG.NUMBERS.STAKING_KEY_INDEX)).to_raw_key()
    Logger.info(
      `getStakingKey: ${Buffer.from(await stakingKey.as_bytes()).toString(
        'hex',
      )}`,
    )
    return stakingKey
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

  async createUnsignedTx<TransactionBuilder>(
    utxos: Array<RawUtxo>,
    receiver: string,
    amount: string,
  ): Promise<BaseSignRequest<TransactionBuilder>> {
    const timeToSlotFn = await genTimeToSlot([
      {
        StartAt: CONFIG.NETWORKS.HASKELL_SHELLEY.START_AT,
        GenesisDate: CONFIG.NETWORKS.HASKELL_SHELLEY.GENESIS_DATE,
        SlotsPerEpoch: CONFIG.NETWORKS.HASKELL_SHELLEY.SLOTS_PER_EPOCH,
        SlotDuration: CONFIG.NETWORKS.HASKELL_SHELLEY.SLOT_DURATION,
      },
    ])
    const absSlotNumber = new BigNumber(timeToSlotFn({time: new Date()}).slot)
    const changeAddr = await this._getAddressedChangeAddress()
    const addressedUtxos = this.asAddressedUtxo(utxos)

    const resp = await createUnsignedTx({
      changeAddr,
      absSlotNumber,
      receiver,
      addressedUtxos,
      amount,
    })
    Logger.debug(JSON.stringify(resp))
    return resp
  }

  async signTx<TransactionBuilder>(
    signRequest: BaseSignRequest<TransactionBuilder>,
    decryptedMasterKey: string,
  ): Promise<SignedTx> {
    const masterKey = await Bip32PrivateKey.from_bytes(
      Buffer.from(decryptedMasterKey, 'hex'),
    )
    let _purpose
    switch (this.walletImplementationId) {
      case WALLET_IMPLEMENTATION_REGISTRY.HASKELL_SHELLEY:
        _purpose = CONFIG.NUMBERS.WALLET_TYPE_PURPOSE.CIP1852
        break
      case WALLET_IMPLEMENTATION_REGISTRY.HASKELL_BYRON:
        _purpose = CONFIG.NUMBERS.WALLET_TYPE_PURPOSE.BIP44
        break
      default:
        _purpose = CONFIG.NUMBERS.WALLET_TYPE_PURPOSE.CIP1852
    }

    const accountPvrKey: Bip32PrivateKey = await (await (await masterKey.derive(
      _purpose,
    )).derive(CONFIG.NUMBERS.COIN_TYPES.CARDANO)).derive(
      0 + CONFIG.NUMBERS.HARD_DERIVATION_START,
    )
    const signedTx: Transaction = await signTransaction(
      signRequest,
      CONFIG.NUMBERS.BIP44_DERIVATION_LEVELS.ACCOUNT,
      accountPvrKey,
      [], // no staking key
      undefined,
    )
    const id = Buffer.from(
      await (await hash_transaction(await signedTx.body())).to_bytes(),
    ).toString('hex')
    const encodedTx = await signedTx.to_bytes()
    return {
      id,
      encodedTx,
    }
  }

  createDelegationTx(
    poolData: any,
    valueInAccount: BigNumber,
    utxos: Array<RawUtxo>,
  ): Promise<any> {
    throw Error('not implemented')
  }

  // remove and just use signTx
  signDelegationTx<V4UnsignedTxAddressedUtxoResponse>(
    unsignedTx: V4UnsignedTxAddressedUtxoResponse,
    decryptedMasterKey: string,
  ): Promise<SignedTx> {
    throw Error('not implemented')
  }

  // =================== backend API =================== //

  async getBestBlock() {
    return await api.getBestBlock()
  }

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
