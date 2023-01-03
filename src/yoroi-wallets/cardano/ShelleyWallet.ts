/* eslint-disable @typescript-eslint/no-explicit-any */
import {BigNumber} from 'bignumber.js'
import ExtendableError from 'es6-error'
import _ from 'lodash'
import DeviceInfo from 'react-native-device-info'
import {defaultMemoize} from 'reselect'

import {EncryptedStorage, EncryptedStorageKeys, makeWalletEncryptedStorage, WalletEncryptedStorage} from '../../auth'
import {Keychain} from '../../auth/Keychain'
import {encryptWithPassword} from '../../Catalyst/catalystCipher'
import LocalizableError from '../../i18n/LocalizableError'
import assert from '../../legacy/assert'
import {ADDRESS_TYPE_TO_CHANGE, generateWalletRootKey} from '../../legacy/commonUtils'
import {
  CONFIG,
  getCardanoBaseConfig,
  getDefaultAssetByNetworkId,
  getWalletConfigById,
  isByron,
  isHaskellShelley,
} from '../../legacy/config'
import {CardanoError, InvalidState} from '../../legacy/errors'
import type {HWDeviceInfo} from '../../legacy/ledgerUtils'
import {signTxWithLedger} from '../../legacy/ledgerUtils'
import {Logger} from '../../legacy/logging'
import {CardanoHaskellShelleyNetwork, getCardanoNetworkConfigById, isJormungandr} from '../../legacy/networks'
import {isHaskellShelleyNetwork, PROVIDERS} from '../../legacy/networks'
import {processTxHistoryData} from '../../legacy/processTransactions'
import {IsLockedError, nonblockingSynchronize, synchronize} from '../../legacy/promise'
import type {WalletMeta} from '../../legacy/state'
import storageLegacy from '../../legacy/storage'
import {deriveRewardAddressHex} from '../../legacy/utils'
import {
  Cardano,
  CardanoMobile,
  CardanoTypes,
  generatePrivateKeyForCatalyst,
  legacyWalletChecksum,
  NoOutputsError,
  NotEnoughMoneyToSendError,
  RegistrationStatus,
  walletChecksum,
} from '../cardano'
import {makeStorageWithPrefix} from '../storage'
import {DefaultAsset, Quantity, SendTokenList, StakingInfo, YoroiSignedTx, YoroiUnsignedTx} from '../types'
import type {
  AccountStateResponse,
  BackendConfig,
  CurrencySymbol,
  FundInfoResponse,
  PoolInfoRequest,
  RawUtxo,
  TipStatusResponse,
  TokenInfoRequest,
  TransactionInfo,
  TxStatusRequest,
  TxStatusResponse,
} from '../types/other'
import {NETWORK_REGISTRY} from '../types/other'
import {Quantities} from '../utils'
import {genTimeToSlot} from '../utils/timeUtils'
import {validatePassword} from '../utils/validators'
import * as api from './api'
import {AddressChain, AddressChainJSON, Addresses, AddressGenerator} from './chain'
import {filterAddressesByStakingKey, getDelegationStatus} from './shelley/delegationUtils'
import {toCachedTx, TransactionCache} from './shelley/transactionCache'
import {yoroiSignedTx} from './signedTx'
import {
  NetworkId,
  WalletEvent,
  WalletImplementationId,
  WalletInterface,
  WalletSubscription,
  YoroiProvider,
} from './types'
import {yoroiUnsignedTx} from './unsignedTx'
import {makeUtxoManager, UtxoManager} from './utxoManager'

type WalletState = {
  lastGeneratedAddressIndex: number
}

export type ShelleyWalletJSON = {
  version: string

  networkId: NetworkId
  walletImplementationId: WalletImplementationId
  provider?: null | YoroiProvider

  isHW: boolean
  hwDeviceInfo: null | HWDeviceInfo
  isReadOnly: boolean
  isEasyConfirmationEnabled: boolean

  publicKeyHex?: string

  lastGeneratedAddressIndex: number
  internalChain: AddressChainJSON
  externalChain: AddressChainJSON
}

export type ByronWalletJSON = Omit<ShelleyWalletJSON, 'account'>

export type WalletJSON = ShelleyWalletJSON | ByronWalletJSON

export default ShelleyWallet
export class ShelleyWallet implements WalletInterface {
  storage: typeof storageLegacy
  private readonly utxoManager: UtxoManager
  protected encryptedStorage: WalletEncryptedStorage
  defaultAsset: DefaultAsset
  id: null | string = null
  networkId: undefined | NetworkId
  walletImplementationId: undefined | WalletImplementationId
  isHW = false
  hwDeviceInfo: null | HWDeviceInfo = null
  isReadOnly: undefined | boolean
  provider: null | undefined | YoroiProvider
  isEasyConfirmationEnabled = false
  internalChain: null | AddressChain = null
  externalChain: null | AddressChain = null
  publicKeyHex: undefined | string
  rewardAddressHex: null | string = null
  version: undefined | string
  checksum: undefined | CardanoTypes.WalletChecksum
  private _utxos: RawUtxo[]

  // =================== create =================== //
  private constructor(storage: typeof storageLegacy, networkId: NetworkId, id: string, utxoManager: UtxoManager) {
    this.id = id
    this.storage = storage
    this.networkId = networkId
    this.defaultAsset = getDefaultAssetByNetworkId(this.networkId)

    this.utxoManager = utxoManager
    this._utxos = utxoManager.initialUtxos
    this.encryptedStorage = makeWalletEncryptedStorage(id)
  }

  static async build(storage: typeof storageLegacy, networkId: NetworkId, id: string) {
    const apiUrl = getCardanoNetworkConfigById(networkId).BACKEND.API_ROOT
    const utxoManager = await makeUtxoManager(id, apiUrl, storage)

    return new ShelleyWallet(storage, networkId, id, utxoManager)
  }

  get utxos() {
    return this._utxos
  }

  get receiveAddresses(): Addresses {
    return this.externalAddresses.slice(0, this.numReceiveAddresses)
  }

  save() {
    return this.storage.write(`/wallet/${this.id}/data`, this.toJSON())
  }

  async clear() {
    await this.transactionCache?.clear()
    await this.utxoManager.clear()
  }

  private async initialize(
    networkId: NetworkId,
    implementationId: WalletImplementationId,
    accountPubKeyHex: string,
    hwDeviceInfo: null | HWDeviceInfo,
    readOnly: boolean,
    provider?: null | YoroiProvider,
  ) {
    if (!this.id) throw new Error('Invalid wallet creation state')
    this.walletImplementationId = implementationId

    this.isHW = hwDeviceInfo != null

    this.hwDeviceInfo = hwDeviceInfo

    this.isReadOnly = readOnly

    this.provider = provider

    this.transactionCache = await TransactionCache.create(makeStorageWithPrefix(`/wallet/${this.id}/txs`))

    // initialize address chains
    const walletConfig = getWalletConfigById(implementationId)
    this.internalChain = new AddressChain(
      new AddressGenerator(accountPubKeyHex, 'Internal', implementationId, networkId),
      walletConfig.DISCOVERY_BLOCK_SIZE,
      walletConfig.DISCOVERY_GAP_SIZE,
    )
    this.externalChain = new AddressChain(
      new AddressGenerator(accountPubKeyHex, 'External', implementationId, networkId),
      walletConfig.DISCOVERY_BLOCK_SIZE,
      walletConfig.DISCOVERY_GAP_SIZE,
    )

    this.rewardAddressHex = await deriveRewardAddressHex(accountPubKeyHex, networkId)

    this.publicKeyHex = accountPubKeyHex

    this.version = DeviceInfo.getVersion()

    this.checksum = isByron(implementationId)
      ? legacyWalletChecksum(accountPubKeyHex)
      : walletChecksum(accountPubKeyHex)

    // Create at least one address in each block
    await this.internalChain.initialize()
    await this.externalChain.initialize()

    await this.discoverAddresses()

    this.setupSubscriptions()
    this.notify({type: 'initialize'})

    this.isInitialized = true

    return this.id
  }

  async create(
    mnemonic: string,
    newPassword: string,
    networkId: NetworkId,
    implementationId: WalletImplementationId,
    provider?: null | YoroiProvider,
  ) {
    Logger.info(`create wallet (networkId=${String(networkId)})`)
    Logger.info(`create wallet (implementationId=${String(implementationId)})`)
    Logger.info(`create wallet (provider=${String(provider)})`)

    assert.assert(!this.isInitialized, 'ShelleyWallet::create: !isInitialized')
    assert.assert(isHaskellShelleyNetwork(networkId), 'ShelleyWallet::create: invalid networkId')
    assert.assert(
      isByron(implementationId) || isHaskellShelley(implementationId),
      'ShelleyWallet::create: invalid walletImplementationId',
    )
    const rootKeyPtr = await generateWalletRootKey(mnemonic)
    const rootKey: string = Buffer.from(await rootKeyPtr.asBytes()).toString('hex')
    await this.encryptAndSaveRootKey(rootKey, newPassword)
    const purpose = isByron(implementationId)
      ? CONFIG.NUMBERS.WALLET_TYPE_PURPOSE.BIP44
      : CONFIG.NUMBERS.WALLET_TYPE_PURPOSE.CIP1852

    const accountKey = await (
      await (await rootKeyPtr.derive(purpose)).derive(CONFIG.NUMBERS.COIN_TYPES.CARDANO)
    ).derive(CONFIG.NUMBERS.ACCOUNT_INDEX + CONFIG.NUMBERS.HARD_DERIVATION_START)
    const accountPubKey = await accountKey.toPublic()
    const accountPubKeyHex: string = Buffer.from(await accountPubKey.asBytes()).toString('hex')

    return this.initialize(
      networkId,
      implementationId,
      accountPubKeyHex,
      null, // this is not a HW
      false, // not a read-only wallet
      provider,
    )
  }

  async createWithBip44Account(
    accountPublicKey: string,
    networkId: NetworkId,
    implementationId: WalletImplementationId,
    hwDeviceInfo: null | HWDeviceInfo,
    readOnly: boolean,
  ) {
    Logger.info(`create wallet with account pub key (networkId=${String(networkId)})`)
    Logger.debug('account pub key', accountPublicKey)
    assert.assert(!this.isInitialized, 'createWallet: !isInitialized')
    return this.initialize(networkId, implementationId, accountPublicKey, hwDeviceInfo, readOnly)
  }

  // =================== persistence =================== //

  private async runMigrations(data: WalletJSON, walletMeta: WalletMeta): Promise<void> {
    /**
     * New versions of Yoroi may involve changes in the data structure used to
     * store the wallet state. Hence, we need to check whether data migrations
     * are needed every time we open a wallet.
     * In some cases, we can determine that some data field needs to be
     * re-accommodated to a new format just by inspecting the data structure in
     * storage. In other cases, we may use the explicit version number, though
     * it should only be available for versions >= 4.1.0
     */

    // recall: Prior to v4.1.0, `version` corresponded to the version on which
    // the wallet was created/restored.
    const lastSeenVersion = data.version

    this.state = {
      lastGeneratedAddressIndex: data.lastGeneratedAddressIndex,
    }

    // can be null for versions < 3.0.2
    this.walletImplementationId =
      data.walletImplementationId != null ? data.walletImplementationId : walletMeta.walletImplementationId

    this.isHW = data.isHW ?? false
    this.hwDeviceInfo = data.hwDeviceInfo
    this.isReadOnly = data.isReadOnly ?? false
    this.provider = data.provider

    if (!this.checksum) {
      this.checksum = walletMeta.checksum
    }

    this.version = DeviceInfo.getVersion()
    if (this.version !== lastSeenVersion) {
      Logger.debug(`updated version from ${lastSeenVersion} to ${this.version}`)
    }

    if (this.networkId == null) throw new Error('Invalid wallet: networkId')

    this.internalChain = AddressChain.fromJSON(data.internalChain, this.networkId)
    this.externalChain = AddressChain.fromJSON(data.externalChain, this.networkId)
    // can be null for versions < 3.0.2, in which case we can just retrieve
    // from address generator
    this.publicKeyHex = data.publicKeyHex != null ? data.publicKeyHex : this.internalChain.publicKey
    this.rewardAddressHex = await deriveRewardAddressHex(this.publicKeyHex, this.networkId)
    this.isEasyConfirmationEnabled = data.isEasyConfirmationEnabled

    this.transactionCache = await TransactionCache.create(makeStorageWithPrefix(`/wallet/${walletMeta.id}/txs/`))
  }

  private integrityCheck(): void {
    try {
      if (this.networkId === NETWORK_REGISTRY.BYRON_MAINNET) {
        this.networkId = NETWORK_REGISTRY.HASKELL_SHELLEY
      }
      if (!this.networkId) throw new Error('invalid state')
      assert.assert(isHaskellShelleyNetwork(this.networkId), 'invalid networkId')
      if (this.walletImplementationId == null) throw new Error('Invalid wallet: walletImplementationId')
      assert.assert(
        isByron(this.walletImplementationId) || isHaskellShelley(this.walletImplementationId),
        'invalid walletImplementationId',
      )
      if (isHaskellShelley(this.walletImplementationId)) {
        assert.assert(this.rewardAddressHex != null, 'reward address is null')
      }
      if (this.isHW) {
        assert.assert(this.hwDeviceInfo != null, 'no device info for hardware wallet')
      }
    } catch (e) {
      Logger.error('wallet::_integrityCheck', e)
      throw new InvalidState((e as Error).message)
    }
  }

  // TODO(v-almonacid): move to parent class?
  async restore(data: WalletJSON, walletMeta: WalletMeta) {
    Logger.info('restore wallet', walletMeta.name)
    assert.assert(!this.isInitialized, 'restoreWallet: !isInitialized')

    await this.runMigrations(data, walletMeta)

    this.integrityCheck()

    await this.discoverAddresses()

    this.setupSubscriptions()

    this.isInitialized = true
  }

  async sync() {
    await this.doFullSync()
    await this.save()
  }

  async resync() {
    await this.clear()
    if (!this.transactionCache) throw new Error('invalid wallet state')
    this.transactionCache.resetState()
    await this.save()
    this.sync()
  }

  // =================== utils =================== //

  private getNetworkConfig(): CardanoHaskellShelleyNetwork {
    switch (this.networkId) {
      case PROVIDERS.HASKELL_SHELLEY.NETWORK_ID:
        if (this.provider === 'emurgo-alonzo') {
          return PROVIDERS.ALONZO_MAINNET
        }
        return PROVIDERS.HASKELL_SHELLEY
      case PROVIDERS.HASKELL_SHELLEY_TESTNET.NETWORK_ID:
        if (this.provider === 'emurgo-alonzo') {
          return PROVIDERS.ALONZO_TESTNET
        }
        return PROVIDERS.HASKELL_SHELLEY_TESTNET
      default:
        throw new Error('network id is not valid')
    }
  }

  private getBaseNetworkConfig() {
    return this.getNetworkConfig().BASE_CONFIG.reduce((acc, next) => Object.assign(acc, next), {})
  }

  private getBackendConfig(): BackendConfig {
    return this.getNetworkConfig().BACKEND
  }

  private getPurpose(): number {
    if (this.walletImplementationId == null) throw new Error('Invalid wallet: walletImplementationId')

    if (isByron(this.walletImplementationId)) {
      return CONFIG.NUMBERS.WALLET_TYPE_PURPOSE.BIP44
    } else if (isHaskellShelley(this.walletImplementationId)) {
      return CONFIG.NUMBERS.WALLET_TYPE_PURPOSE.CIP1852
    } else {
      throw new Error('ShelleyWallet::_getPurpose: invalid wallet impl. id')
    }
  }

  private getChainNetworkId(): string {
    return this.getNetworkConfig().CHAIN_NETWORK_ID
  }

  // returns the address in bech32 (Shelley) or base58 (Byron) format
  getChangeAddress(): string {
    if (!this.internalChain) throw new Error('invalid wallet state')
    const candidateAddresses = this.internalChain.addresses
    const unseen = candidateAddresses.filter((addr) => !this.isUsedAddress(addr))
    assert.assert(unseen.length > 0, 'Cannot find change address')
    const changeAddress = _.first(unseen)
    if (!changeAddress) throw new Error('invalid wallet state')

    return changeAddress
  }

  private getAddressedChangeAddress(): Promise<{address: string; addressing: CardanoTypes.Addressing}> {
    const changeAddr = this.getChangeAddress()
    const addressing = this.getAddressing(changeAddr)

    return Promise.resolve({
      address: changeAddr,
      addressing,
    })
  }

  async getStakingKey() {
    if (this.walletImplementationId == null) throw new Error('Invalid wallet: walletImplementationId')

    assert.assert(isHaskellShelley(this.walletImplementationId), 'cannot get staking key from a byron-era wallet')
    if (!this.publicKeyHex) throw new Error('invalid wallet state')
    const accountPubKey = await CardanoMobile.Bip32PublicKey.fromBytes(Buffer.from(this.publicKeyHex, 'hex'))
    const stakingKey = await accountPubKey
      .derive(CONFIG.NUMBERS.CHAIN_DERIVATIONS.CHIMERIC_ACCOUNT)
      .then((key) => key.derive(CONFIG.NUMBERS.STAKING_KEY_INDEX))
      .then((key) => key.toRawKey())

    Logger.info(`getStakingKey: ${Buffer.from(await stakingKey.asBytes()).toString('hex')}`)
    return stakingKey
  }

  getStakingKeyPath(): Array<number> {
    if (this.walletImplementationId == null) throw new Error('Invalid wallet: walletImplementationId')

    assert.assert(isHaskellShelley(this.walletImplementationId), 'cannot get staking key from a byron-era wallet')
    return [
      CONFIG.NUMBERS.WALLET_TYPE_PURPOSE.CIP1852,
      CONFIG.NUMBERS.COIN_TYPES.CARDANO,
      CONFIG.NUMBERS.ACCOUNT_INDEX + CONFIG.NUMBERS.HARD_DERIVATION_START,
      CONFIG.NUMBERS.CHAIN_DERIVATIONS.CHIMERIC_ACCOUNT,
      CONFIG.NUMBERS.STAKING_KEY_INDEX,
    ]
  }

  async getRewardAddress() {
    if (this.walletImplementationId == null) throw new Error('Invalid wallet: walletImplementationId')

    assert.assert(isHaskellShelley(this.walletImplementationId), 'cannot get reward address from a byron-era wallet')
    const stakingKey = await this.getStakingKey()
    const credential = await CardanoMobile.StakeCredential.fromKeyhash(await stakingKey.hash())
    const rewardAddr = await CardanoMobile.RewardAddress.new(Number.parseInt(this.getChainNetworkId(), 10), credential)
    return rewardAddr.toAddress()
  }

  private getRewardAddressAddressing() {
    return {
      path: [
        this.getPurpose(),
        CONFIG.NUMBERS.COIN_TYPES.CARDANO,
        CONFIG.NUMBERS.ACCOUNT_INDEX + CONFIG.NUMBERS.HARD_DERIVATION_START,
        CONFIG.NUMBERS.CHAIN_DERIVATIONS.CHIMERIC_ACCOUNT,
        CONFIG.NUMBERS.STAKING_KEY_INDEX,
      ],
      startLevel: CONFIG.NUMBERS.BIP44_DERIVATION_LEVELS.PURPOSE,
    }
  }

  async getAllUtxosForKey() {
    return filterAddressesByStakingKey(
      await CardanoMobile.StakeCredential.fromKeyhash(await (await this.getStakingKey()).hash()),
      await this.getAddressedUtxos(),
      false,
    )
  }

  getAddressing(address: string) {
    const purpose = this.getPurpose()
    if (!this.internalChain) throw new Error('invalid wallet state')
    if (!this.externalChain) throw new Error('invalid wallet state')

    if (this.internalChain.isMyAddress(address)) {
      return {
        path: [
          purpose,
          CONFIG.NUMBERS.COIN_TYPES.CARDANO,
          CONFIG.NUMBERS.ACCOUNT_INDEX + CONFIG.NUMBERS.HARD_DERIVATION_START,
          ADDRESS_TYPE_TO_CHANGE['Internal'],
          this.internalChain.getIndexOfAddress(address),
        ],
        startLevel: CONFIG.NUMBERS.BIP44_DERIVATION_LEVELS.PURPOSE,
      }
    }

    if (this.externalChain.isMyAddress(address)) {
      return {
        path: [
          purpose,
          CONFIG.NUMBERS.COIN_TYPES.CARDANO,
          CONFIG.NUMBERS.ACCOUNT_INDEX + CONFIG.NUMBERS.HARD_DERIVATION_START,
          ADDRESS_TYPE_TO_CHANGE['External'],
          this.externalChain.getIndexOfAddress(address),
        ],
        startLevel: CONFIG.NUMBERS.BIP44_DERIVATION_LEVELS.PURPOSE,
      }
    }

    throw new Error(`Missing address info for: ${address} `)
  }

  getAddressedUtxos() {
    const addressedUtxos = this.utxos.map((utxo: RawUtxo): CardanoTypes.CardanoAddressedUtxo => {
      const addressing = this.getAddressing(utxo.receiver)

      return {
        addressing,
        txIndex: utxo.tx_index,
        txHash: utxo.tx_hash,
        amount: utxo.amount,
        receiver: utxo.receiver,
        utxoId: utxo.utxo_id,
        assets: utxo.assets,
      }
    })

    return Promise.resolve(addressedUtxos)
  }

  getDelegationStatus() {
    if (!this.transactionCache) throw new Error('invalid wallet state')
    if (this.rewardAddressHex == null) throw new Error('reward address is null')
    const certsForKey = this.transactionCache.perRewardAddressCertificates[this.rewardAddressHex]
    return Promise.resolve(getDelegationStatus(this.rewardAddressHex, certsForKey))
  }

  canGenerateNewReceiveAddress() {
    if (!this.externalChain) throw new Error('invalid wallet state')
    const lastUsedIndex = this.getLastUsedIndex(this.externalChain)
    // TODO: should use specific wallet config
    const maxIndex = lastUsedIndex + CONFIG.WALLETS.HASKELL_SHELLEY.MAX_GENERATED_UNUSED
    if (this.state.lastGeneratedAddressIndex >= maxIndex) {
      return false
    }
    return this.numReceiveAddresses < this.externalAddresses.length
  }

  generateNewReceiveAddressIfNeeded() {
    /* new address is automatically generated when you use the latest unused */
    if (!this.externalChain) throw new Error('invalid wallet state')
    const lastGeneratedAddress = this.externalChain.addresses[this.state.lastGeneratedAddressIndex]
    if (!this.isUsedAddress(lastGeneratedAddress)) {
      return false
    }
    return this.generateNewReceiveAddress()
  }

  generateNewReceiveAddress(): boolean {
    if (!this.canGenerateNewReceiveAddress()) return false

    this.updateState({
      lastGeneratedAddressIndex: this.state.lastGeneratedAddressIndex + 1,
    })

    // note: don't await on purpose
    this.save()

    this.notify({type: 'addresses', addresses: this.receiveAddresses})

    return true
  }

  async getStakingInfo(): Promise<StakingInfo> {
    if (!this.rewardAddressHex) throw new Error('invalid wallet')

    const stakingStatus = await this.getDelegationStatus()
    if (!stakingStatus.isRegistered) return {status: 'not-registered'}
    if (!('poolKeyHash' in stakingStatus)) return {status: 'registered'}

    const accountStates = await this.fetchAccountState()
    const accountState = accountStates[this.rewardAddressHex]
    if (!accountState) throw new Error('Account state not found')

    const stakingUtxos = await this.getAllUtxosForKey()
    const amount = Quantities.sum([
      ...stakingUtxos.map((utxo) => utxo.amount as Quantity),
      accountState.remainingAmount as Quantity,
    ])

    return {
      status: 'staked',
      poolId: stakingStatus.poolKeyHash,
      amount,
      rewards: accountState.remainingAmount as Quantity,
    }
  }

  // =================== tx building =================== //

  async createUnsignedTx(receiver: string, tokens: SendTokenList, auxiliaryData?: Array<CardanoTypes.TxMetadata>) {
    const timeToSlotFn = genTimeToSlot(getCardanoBaseConfig(this.getNetworkConfig()))
    const time = await this.checkServerStatus()
      .then(({serverTime}) => serverTime || Date.now())
      .catch(() => Date.now())

    const absSlotNumber = new BigNumber(timeToSlotFn({time}).slot)
    const changeAddr = await this.getAddressedChangeAddress()
    const addressedUtxos = await this.getAddressedUtxos()
    const networkConfig = this.getNetworkConfig()

    try {
      const unsignedTx = await Cardano.createUnsignedTx(
        absSlotNumber,
        addressedUtxos,
        receiver,
        changeAddr,
        tokens as any,
        {
          keyDeposit: networkConfig.KEY_DEPOSIT,
          linearFee: {
            coefficient: networkConfig.LINEAR_FEE.COEFFICIENT,
            constant: networkConfig.LINEAR_FEE.CONSTANT,
          },
          minimumUtxoVal: networkConfig.MINIMUM_UTXO_VAL,
          poolDeposit: networkConfig.POOL_DEPOSIT,
          networkId: networkConfig.NETWORK_ID,
        },
        this.defaultAsset,
        {metadata: auxiliaryData},
      )

      return yoroiUnsignedTx({unsignedTx, networkConfig: this.getNetworkConfig(), addressedUtxos})
    } catch (e) {
      if (e instanceof NotEnoughMoneyToSendError || e instanceof NoOutputsError) throw e
      Logger.error(`shelley::createUnsignedTx:: ${(e as Error).message}`, e)
      throw new CardanoError((e as Error).message)
    }
  }

  async signTx(unsignedTx: YoroiUnsignedTx, decryptedMasterKey: string) {
    const masterKey = await CardanoMobile.Bip32PrivateKey.fromBytes(Buffer.from(decryptedMasterKey, 'hex'))
    const accountPrivateKey = await masterKey
      .derive(this.getPurpose())
      .then((key) => key.derive(CONFIG.NUMBERS.COIN_TYPES.CARDANO))
      .then((key) => key.derive(0 + CONFIG.NUMBERS.HARD_DERIVATION_START))
    const accountPrivateKeyHex = await accountPrivateKey.asBytes().then(toHex)
    const stakingPrivateKey = await accountPrivateKey
      .derive(CONFIG.NUMBERS.CHAIN_DERIVATIONS.CHIMERIC_ACCOUNT)
      .then((key) => key.derive(CONFIG.NUMBERS.STAKING_KEY_INDEX))
      .then((key) => key.toRawKey())
    const stakingKeys =
      unsignedTx.staking.delegations ||
      unsignedTx.staking.registrations ||
      unsignedTx.staking.deregistrations ||
      unsignedTx.staking.withdrawals
        ? [stakingPrivateKey]
        : undefined

    const signedTx = await unsignedTx.unsignedTx.sign(
      CONFIG.NUMBERS.BIP44_DERIVATION_LEVELS.ACCOUNT,
      accountPrivateKeyHex,
      new Set<string>(),
      stakingKeys,
    )

    return yoroiSignedTx({
      unsignedTx,
      signedTx,
    })
  }

  async createDelegationTx(poolId: string | undefined, delegatedAmount: BigNumber) {
    const timeToSlotFn = genTimeToSlot(getCardanoBaseConfig(this.getNetworkConfig()))
    const time = await this.checkServerStatus()
      .then(({serverTime}) => serverTime || Date.now())
      .catch(() => Date.now())

    const absSlotNumber = new BigNumber(timeToSlotFn({time}).slot)
    const changeAddr = await this.getAddressedChangeAddress()
    const addressedUtxos = await this.getAddressedUtxos()
    const registrationStatus = (await this.getDelegationStatus()).isRegistered
    const stakingKey = await this.getStakingKey()
    const delegationType = registrationStatus ? RegistrationStatus.DelegateOnly : RegistrationStatus.RegisterAndDelegate
    const networkConfig = this.getNetworkConfig()
    const delegatedAmountMT = {
      values: [{identifier: '', amount: delegatedAmount, networkId: networkConfig.NETWORK_ID}],
      defaults: this.defaultAsset,
    }

    const unsignedTx = await Cardano.createUnsignedDelegationTx(
      absSlotNumber,
      addressedUtxos,
      stakingKey,
      delegationType,
      poolId || null,
      changeAddr,
      delegatedAmountMT,
      this.defaultAsset,
      {},
      {
        keyDeposit: networkConfig.KEY_DEPOSIT,
        linearFee: {
          constant: networkConfig.LINEAR_FEE.CONSTANT,
          coefficient: networkConfig.LINEAR_FEE.COEFFICIENT,
        },
        minimumUtxoVal: networkConfig.MINIMUM_UTXO_VAL,
        poolDeposit: networkConfig.POOL_DEPOSIT,
        networkId: networkConfig.NETWORK_ID,
      },
    )

    return yoroiUnsignedTx({
      unsignedTx,
      networkConfig,
      addressedUtxos,
    })
  }

  async createVotingRegTx(pin: string) {
    Logger.debug('ShelleyWallet::createVotingRegTx called')
    if (!this.networkId) throw new Error('invalid wallet')

    const bytes = await generatePrivateKeyForCatalyst()
      .then((key) => key.toRawKey())
      .then((key) => key.asBytes())

    const catalystKeyHex = Buffer.from(bytes).toString('hex')

    try {
      const timeToSlotFn = genTimeToSlot(getCardanoBaseConfig(this.getNetworkConfig()))
      const time = await this.checkServerStatus()
        .then(({serverTime}) => serverTime || Date.now())
        .catch(() => Date.now())

      const absSlotNumber = new BigNumber(timeToSlotFn({time}).slot)
      const votingPublicKey = await Promise.resolve(Buffer.from(catalystKeyHex, 'hex'))
        .then((bytes) => CardanoMobile.PrivateKey.fromExtendedBytes(bytes))
        .then((key) => key.toPublic())
      const stakingKeyPath = this.getStakingKeyPath()
      const stakingPublicKey = await this.getStakingKey()
      const changeAddr = await this.getAddressedChangeAddress()
      const networkConfig = this.getNetworkConfig()
      const config = {
        keyDeposit: networkConfig.KEY_DEPOSIT,
        linearFee: {
          coefficient: networkConfig.LINEAR_FEE.COEFFICIENT,
          constant: networkConfig.LINEAR_FEE.CONSTANT,
        },
        minimumUtxoVal: networkConfig.MINIMUM_UTXO_VAL,
        poolDeposit: networkConfig.POOL_DEPOSIT,
        networkId: networkConfig.NETWORK_ID,
      }
      const txOptions = {}
      const nonce = absSlotNumber.toNumber()
      const chainNetworkConfig = Number.parseInt(this.getChainNetworkId(), 10)

      const addressedUtxos = await this.getAddressedUtxos()

      const unsignedTx = await Cardano.createUnsignedVotingTx(
        absSlotNumber,
        this.defaultAsset,
        votingPublicKey,
        stakingKeyPath,
        stakingPublicKey,
        addressedUtxos,
        changeAddr,
        config,
        txOptions,
        nonce,
        chainNetworkConfig,
      )

      const votingRegistration: {
        votingPublicKey: string
        stakingPublicKey: string
        rewardAddress: string
        nonce: number
      } = {
        votingPublicKey: await votingPublicKey.toBech32(),
        stakingPublicKey: await stakingPublicKey.toBech32(),
        rewardAddress: await this.getRewardAddress().then((address) => address.toBech32()),
        nonce,
      }

      const password = Buffer.from(pin.split('').map(Number))
      const catalystKeyEncrypted = await encryptWithPassword(password, bytes)

      return {
        votingKeyEncrypted: catalystKeyEncrypted,
        votingRegTx: await yoroiUnsignedTx({
          unsignedTx,
          networkConfig,
          votingRegistration,
          addressedUtxos,
        }),
      }
    } catch (e) {
      if (e instanceof LocalizableError || e instanceof ExtendableError) throw e
      Logger.error(`shelley::createVotingRegTx:: ${(e as Error).message}`, e)
      throw new CardanoError((e as Error).message)
    }
  }

  async createWithdrawalTx(shouldDeregister: boolean): Promise<YoroiUnsignedTx> {
    if (this.rewardAddressHex == null) throw new Error('reward address is null')
    const timeToSlotFn = genTimeToSlot(getCardanoBaseConfig(this.getNetworkConfig()))

    const time = await this.checkServerStatus()
      .then(({serverTime}) => serverTime || Date.now())
      .catch(() => Date.now())

    const absSlotNumber = new BigNumber(timeToSlotFn({time}).slot)
    const changeAddr = await this.getAddressedChangeAddress()
    const addressedUtxos = await this.getAddressedUtxos()
    const accountState = await api.getAccountState(
      {addresses: [this.rewardAddressHex]},
      this.getNetworkConfig().BACKEND,
    )

    const withdrawalTx = await Cardano.createUnsignedWithdrawalTx(
      accountState,
      this.defaultAsset,
      absSlotNumber,
      addressedUtxos,
      [
        {
          addressing: this.getRewardAddressAddressing(),
          rewardAddress: this.rewardAddressHex,
          shouldDeregister,
        },
      ],
      changeAddr,
      {
        linearFee: {
          coefficient: this.getNetworkConfig().LINEAR_FEE.COEFFICIENT,
          constant: this.getNetworkConfig().LINEAR_FEE.CONSTANT,
        },
        minimumUtxoVal: this.getNetworkConfig().MINIMUM_UTXO_VAL,
        poolDeposit: this.getNetworkConfig().POOL_DEPOSIT,
        keyDeposit: this.getNetworkConfig().KEY_DEPOSIT,
        networkId: this.getNetworkConfig().NETWORK_ID,
      },
      {metadata: undefined},
    )

    return yoroiUnsignedTx({
      unsignedTx: withdrawalTx,
      networkConfig: this.getNetworkConfig(),
      addressedUtxos,
    })
  }

  async signTxWithLedger(unsignedTx: YoroiUnsignedTx, useUSB: boolean): Promise<YoroiSignedTx> {
    if (!this.hwDeviceInfo) throw new Error('Invalid wallet state')
    if (!this.publicKeyHex) throw new Error('Invalid wallet state')
    if (!this.walletImplementationId) throw new Error('Invalid wallet state')

    const ledgerPayload = await Cardano.buildLedgerPayload(
      unsignedTx.unsignedTx,
      Number.parseInt(this.getChainNetworkId(), 10),
      (this.getBaseNetworkConfig() as any).PROTOCOL_MAGIC,
      this.getStakingKeyPath(),
    )

    const signedLedgerTx = await signTxWithLedger(ledgerPayload, this.hwDeviceInfo, useUSB)
    const signedTx = await Cardano.buildLedgerSignedTx(
      unsignedTx.unsignedTx,
      signedLedgerTx,
      this.getPurpose(),
      this.publicKeyHex,
    )

    return yoroiSignedTx({
      unsignedTx,
      signedTx,
    })
  }

  // =================== backend API =================== //

  async checkServerStatus() {
    return api.checkServerStatus(this.getBackendConfig())
  }

  async submitTransaction(signedTx: string) {
    const response: any = await api.submitTransaction(signedTx, this.getBackendConfig())
    Logger.info(response)
    return response as any
  }

  async getTransactions(txids: Array<string>) {
    const rawTxs = await api.getTransactions(txids, this.getBackendConfig())
    const txs = Object.values(rawTxs).map((rawTx) => toCachedTx(rawTx))
    const txInfos = txs.map((tx) => {
      if (!this.networkId) throw new Error('invalid state')

      return processTxHistoryData(
        tx,
        this.rewardAddressHex != null
          ? [...this.internalAddresses, ...this.externalAddresses, ...[this.rewardAddressHex]]
          : [...this.internalAddresses, ...this.externalAddresses],
        this.confirmationCounts[tx.id] || 0,
        this.networkId,
      )
    })

    return txInfos.reduce((result, txInfo) => ({...result, [txInfo.id]: txInfo}), {} as Record<string, TransactionInfo>)
  }

  async syncUtxos() {
    const addresses = [...this.internalAddresses, ...this.externalAddresses]

    await this.utxoManager.sync(addresses)

    this._utxos = await this.utxoManager.getCachedUtxos()

    // notifying always -> sync from lib need to flag if something has changed
    this.notify({type: 'utxos', utxos: this.utxos})
  }

  async fetchAccountState(): Promise<AccountStateResponse> {
    if (this.rewardAddressHex == null) throw new Error('reward address is null')
    return api.bulkGetAccountState([this.rewardAddressHex], this.getBackendConfig())
  }

  async fetchPoolInfo(request: PoolInfoRequest) {
    return api.getPoolInfo(request, this.getBackendConfig())
  }

  fetchTokenInfo(request: TokenInfoRequest) {
    return api.getTokenInfo(request, this.getBackendConfig())
  }

  async fetchFundInfo(): Promise<FundInfoResponse> {
    return api.getFundInfo(this.getBackendConfig(), this.getNetworkConfig().IS_MAINNET)
  }

  async fetchTxStatus(request: TxStatusRequest): Promise<TxStatusResponse> {
    return api.fetchTxStatus(request, this.getBackendConfig())
  }

  async fetchTipStatus(): Promise<TipStatusResponse> {
    return api.getTipStatus(this.getBackendConfig())
  }

  async fetchCurrentPrice(symbol: CurrencySymbol): Promise<number> {
    return api.fetchCurrentPrice(symbol, this.getBackendConfig())
  }

  state: WalletState = {
    lastGeneratedAddressIndex: 0,
  }

  isInitialized = false

  transactionCache: null | TransactionCache = null

  _doFullSyncMutex: any = {name: 'doFullSyncMutex', lock: null}

  private subscriptions: Array<WalletSubscription> = []

  _onTxHistoryUpdateSubscriptions: Array<(Wallet) => void> = []

  _isUsedAddressIndexSelector = defaultMemoize((perAddressTxs) =>
    _.mapValues(perAddressTxs, (txs) => {
      assert.assert(!!txs, 'perAddressTxs cointains false-ish value')
      return txs.length > 0
    }),
  )

  // =================== getters =================== //

  get internalAddresses() {
    if (!this.internalChain) throw new Error('invalid wallet state')

    return this.internalChain.addresses
  }

  get externalAddresses() {
    if (!this.externalChain) throw new Error('invalid wallet state')

    return this.externalChain.addresses
  }

  get isUsedAddressIndex() {
    if (!this.transactionCache) throw new Error('invalid wallet state')
    return this._isUsedAddressIndexSelector(this.transactionCache.perAddressTxs)
  }

  get numReceiveAddresses() {
    return this.state.lastGeneratedAddressIndex + 1
  }

  get transactions() {
    if (!this.transactionCache) throw new Error('invalid wallet state')
    return this.transactionCache.transactions
  }

  get confirmationCounts() {
    if (!this.transactionCache) throw new Error('invalid wallet state')
    return this.transactionCache.confirmationCounts
  }

  // ============ security & key management ============ //
  async encryptAndSaveRootKey(rootKey: string, password: string) {
    if (this.id != null) return EncryptedStorage.write(EncryptedStorageKeys.rootKey(this.id), rootKey, password)

    throw new Error('invalid wallet state')
  }

  async getDecryptedRootKey(password: string) {
    if (this.id != null) return EncryptedStorage.read(EncryptedStorageKeys.rootKey(this.id), password)

    throw new Error('invalid wallet state')
  }

  async enableEasyConfirmation(rootKey: string) {
    if (!this.id) throw new Error('invalid wallet state')

    await Keychain.setWalletKey(this.id, rootKey)
    this.isEasyConfirmationEnabled = true

    this.notify({type: 'easy-confirmation', enabled: this.isEasyConfirmationEnabled})
  }

  async disableEasyConfirmation() {
    if (!this.id) throw new Error('invalid wallet state')

    await Keychain.removeWalletKey(this.id)
    this.isEasyConfirmationEnabled = false

    this.notify({type: 'easy-confirmation', enabled: this.isEasyConfirmationEnabled})
  }

  async changePassword(oldPassword: string, newPassword: string) {
    if (!this.id) throw new Error('invalid wallet state')

    if (!_.isEmpty(validatePassword(newPassword, newPassword))) throw new Error('New password is not valid')

    const key = EncryptedStorageKeys.rootKey(this.id)
    const rootKey = await EncryptedStorage.read(key, oldPassword)
    return EncryptedStorage.write(key, rootKey, newPassword)
  }

  // =================== subscriptions =================== //

  // needs to be bound
  notify = (event: WalletEvent) => {
    this.subscriptions.forEach((handler) => handler(event))
  }

  subscribe(subscription: WalletSubscription) {
    this.subscriptions.push(subscription)

    return () => {
      this.subscriptions = this.subscriptions.filter((sub) => sub !== subscription)
    }
  }

  notifyOnTxHistoryUpdate = () => {
    this._onTxHistoryUpdateSubscriptions.forEach((handler) => handler(this))
  }

  subscribeOnTxHistoryUpdate(subscription: () => void) {
    this._onTxHistoryUpdateSubscriptions.push(subscription)

    return () => {
      this._onTxHistoryUpdateSubscriptions = this._onTxHistoryUpdateSubscriptions.filter((sub) => sub !== subscription)
    }
  }

  setupSubscriptions() {
    if (!this.internalChain) throw new Error('invalid wallet state')
    if (!this.externalChain) throw new Error('invalid wallet state')
    if (!this.transactionCache) throw new Error('invalid wallet state')

    this.transactionCache.subscribe(() => this.notify({type: 'transactions', transactions: this.transactions}))
    this.transactionCache.subscribe(this.notifyOnTxHistoryUpdate)
    this.internalChain.addSubscriberToNewAddresses(() =>
      this.notify({type: 'addresses', addresses: this.internalAddresses}),
    )
    this.externalChain.addSubscriberToNewAddresses(() =>
      this.notify({type: 'addresses', addresses: this.externalAddresses}),
    )
  }

  // =================== synch =================== //

  async doFullSync() {
    return synchronize(this._doFullSyncMutex, () => this._doFullSync())
  }

  async tryDoFullSync() {
    try {
      return await nonblockingSynchronize(this._doFullSyncMutex, () => this._doFullSync())
    } catch (error) {
      if (!(error instanceof IsLockedError)) {
        throw error
      }
    }
  }

  private getAddressesInBlocks() {
    if (!this.internalChain) throw new Error('invalid wallet state')
    if (!this.externalChain) throw new Error('invalid wallet state')

    const internalAddresses = this.internalChain.getBlocks()
    const externalAddresses = this.externalChain.getBlocks()

    if (this.rewardAddressHex != null) return [...internalAddresses, ...externalAddresses, [this.rewardAddressHex]]

    return [...internalAddresses, ...externalAddresses]
  }

  async discoverAddresses() {
    if (!this.internalChain) throw new Error('invalid wallet state')
    if (!this.externalChain) throw new Error('invalid wallet state')

    // last chunk gap limit check
    const filterFn = (addrs) => api.filterUsedAddresses(addrs, this.getBackendConfig())
    await Promise.all([this.internalChain.sync(filterFn), this.externalChain.sync(filterFn)])
  }

  isUsedAddress(address: string) {
    if (!this.transactionCache) throw new Error('invalid wallet state')
    return !!this.transactionCache.perAddressTxs[address] && this.transactionCache.perAddressTxs[address].length > 0
  }

  getLastUsedIndex(chain: AddressChain): number {
    for (let i = chain.size() - 1; i >= 0; i--) {
      if (this.isUsedAddress(chain.addresses[i])) {
        return i
      }
    }
    return -1
  }

  updateLastGeneratedAddressIndex = () => {
    if (!this.externalChain) throw new Error('invalid wallet state')

    const lastUsedIndex = this.getLastUsedIndex(this.externalChain)
    if (lastUsedIndex > this.state.lastGeneratedAddressIndex) {
      this.state.lastGeneratedAddressIndex = lastUsedIndex
    }
  }

  private async _doFullSync() {
    if (!this.transactionCache) throw new Error('invalid wallet state')
    if (!this.networkId) throw new Error('invalid wallet state')
    if (!this.externalChain) throw new Error('invalid wallet state')
    assert.assert(this.isInitialized, 'doFullSync: isInitialized')

    if (isJormungandr(this.networkId)) return
    Logger.info('Discovery done, now syncing transactions')

    await this.discoverAddresses()

    await Promise.all([
      this.syncUtxos(),
      this.transactionCache.doSync(this.getAddressesInBlocks(), this.getBackendConfig()),
    ])

    this.updateLastGeneratedAddressIndex()
  }

  // ========== UI state ============= //

  updateState(update: Partial<WalletState>) {
    Logger.debug('Wallet::updateState', update)

    this.state = {
      ...this.state,
      ...update,
    }

    this.notify({type: 'state', state: this.state})
  }

  generateNewUiReceiveAddress(): boolean {
    if (!this.canGenerateNewReceiveAddress()) return false

    this.updateState({
      lastGeneratedAddressIndex: this.state.lastGeneratedAddressIndex + 1,
    })

    return true
  }

  // ========== persistence ============= //

  // TODO: move to specific child class?
  toJSON(): WalletJSON {
    if (this.networkId == null) throw new Error('invalid WalletJSON: networkId')
    if (this.walletImplementationId == null) throw new Error('invalid WalletJSON: walletImplementationId')
    if (this.version == null) throw new Error('invalid WalletJSON: version')
    if (this.isReadOnly == null) throw new Error('invalid WalletJSON: isReadOnly')
    if (this.externalAddresses == null) throw new Error('invalid WalletJSON: externalAddresses')
    if (this.internalAddresses == null) throw new Error('invalid WalletJSON: internalAddresses')
    if (this.externalChain == null) throw new Error('invalid WalletJSON: externalChain')
    if (this.internalChain == null) throw new Error('invalid WalletJSON: internalChain')

    return {
      lastGeneratedAddressIndex: this.state.lastGeneratedAddressIndex,
      publicKeyHex: this.publicKeyHex,
      version: this.version,
      internalChain: this.internalChain.toJSON(),
      externalChain: this.externalChain.toJSON(),
      networkId: this.networkId,
      walletImplementationId: this.walletImplementationId,
      isHW: this.isHW,
      hwDeviceInfo: this.hwDeviceInfo,
      isReadOnly: this.isReadOnly,
      isEasyConfirmationEnabled: this.isEasyConfirmationEnabled,
      provider: this.provider,
    }
  }
}

const toHex = (bytes: Uint8Array) => Buffer.from(bytes).toString('hex')
