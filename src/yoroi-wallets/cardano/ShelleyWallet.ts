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
import {
  CardanoHaskellShelleyNetwork,
  getCardanoNetworkConfigById,
  isHaskellShelleyNetwork,
  isJormungandr,
  PROVIDERS,
} from '../../legacy/networks'
import {processTxHistoryData} from '../../legacy/processTransactions'
import {IsLockedError, nonblockingSynchronize, synchronize} from '../../legacy/promise'
import type {WalletMeta} from '../../legacy/state'
import {deriveRewardAddressHex} from '../../legacy/utils'
import {Storage} from '../storage'
import type {
  AccountStateResponse,
  BackendConfig,
  CurrencySymbol,
  DefaultAsset,
  FundInfoResponse,
  PoolInfoRequest,
  RawUtxo,
  TipStatusResponse,
  TokenInfo,
  TransactionInfo,
  TxStatusRequest,
  TxStatusResponse,
} from '../types'
import {NETWORK_REGISTRY, Quantity, SendTokenList, StakingInfo, YoroiSignedTx, YoroiUnsignedTx} from '../types'
import {Quantities} from '../utils'
import {parseSafe} from '../utils/parsing'
import {genTimeToSlot} from '../utils/timeUtils'
import {validatePassword} from '../utils/validators'
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
} from '.'
import * as api from './api'
import {AddressChain, AddressChainJSON, Addresses, AddressGenerator} from './chain'
import {filterAddressesByStakingKey, getDelegationStatus} from './shelley/delegationUtils'
import {toCachedTx} from './shelley/transactionCache'
import {yoroiSignedTx} from './signedTx'
import {makeTransactionManager, TransactionManager} from './transactionManager'
import {
  isYoroiWallet,
  NetworkId,
  WalletEvent,
  WalletImplementationId,
  WalletInterface,
  WalletSubscription,
  YoroiProvider,
  YoroiWallet,
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
  readonly primaryToken: DefaultAsset
  readonly primaryTokenInfo: TokenInfo
  readonly id: string
  readonly networkId: NetworkId
  readonly walletImplementationId: WalletImplementationId
  readonly hwDeviceInfo: null | HWDeviceInfo
  readonly isHW: boolean
  readonly isReadOnly: boolean
  readonly provider: null | undefined | YoroiProvider
  readonly internalChain: AddressChain
  readonly externalChain: AddressChain
  readonly publicKeyHex: string
  readonly rewardAddressHex: null | string = null
  readonly version: string
  readonly checksum: CardanoTypes.WalletChecksum
  readonly encryptedStorage: WalletEncryptedStorage
  isEasyConfirmationEnabled = false

  private _utxos: RawUtxo[]
  private readonly storage: Storage
  private readonly utxoManager: UtxoManager
  private readonly stakingKeyPath: number[]
  private readonly transactionManager: TransactionManager

  // =================== create =================== //

  static async create({
    id,
    networkId,
    implementationId,
    storage,
    provider,

    mnemonic,
    password,
  }: {
    id: string
    implementationId: WalletImplementationId
    networkId: NetworkId
    storage: Storage
    provider: YoroiProvider | undefined

    mnemonic: string
    password: string
  }): Promise<YoroiWallet> {
    const {rootKey, accountPubKeyHex} = await makeKeys({mnemonic, implementationId})
    const {internalChain, externalChain} = await addressChains.create({implementationId, networkId, accountPubKeyHex})

    const wallet = await this.commonCreate({
      id,
      networkId,
      implementationId,
      storage,
      accountPubKeyHex,
      hwDeviceInfo: null, // hw wallet
      isReadOnly: false, // readonly wallet
      internalChain,
      externalChain,
      isEasyConfirmationEnabled: false,
      provider,
    })

    await wallet.encryptAndSaveRootKey(rootKey, password)

    return wallet
  }

  static async createBip44({
    id,
    networkId,
    implementationId,
    storage,

    accountPubKeyHex,
    hwDeviceInfo, // hw wallet
    isReadOnly, // readonly wallet
  }: {
    accountPubKeyHex: string
    hwDeviceInfo: HWDeviceInfo | null
    id: string
    implementationId: WalletImplementationId
    networkId: NetworkId

    isReadOnly: boolean
    storage: Storage
  }): Promise<YoroiWallet> {
    const {internalChain, externalChain} = await addressChains.create({implementationId, networkId, accountPubKeyHex})

    return this.commonCreate({
      id,
      networkId,
      implementationId,
      storage,
      accountPubKeyHex,
      hwDeviceInfo, // hw wallet
      isReadOnly, // readonly wallet
      internalChain,
      externalChain,
      isEasyConfirmationEnabled: false,
      provider: undefined,
    })
  }

  static async restore({walletMeta, storage}: {storage: Storage; walletMeta: WalletMeta}) {
    const data = await storage.getItem('data', parseWalletJSON)
    if (!data) throw new Error('Cannot read saved data')
    Logger.debug('openWallet::data', data)
    Logger.info('restore wallet', walletMeta.name)

    const networkId = data.networkId ?? walletMeta.networkId // can be null for versions < 3.0.0
    const {internalChain, externalChain} = addressChains.restore({data, networkId})

    const wallet = await this.commonCreate({
      id: walletMeta.id,
      networkId,
      storage,
      internalChain,
      externalChain,

      implementationId: data.walletImplementationId ?? walletMeta.walletImplementationId, // can be null for versions < 3.0.2
      accountPubKeyHex: data.publicKeyHex ?? internalChain.publicKey, // can be null for versions < 3.0.2, in which case we can just retrieve from address generator
      hwDeviceInfo: data.hwDeviceInfo, // hw wallet
      isReadOnly: data.isReadOnly ?? false, // readonly wallet
      provider: data.provider ?? '',
      isEasyConfirmationEnabled: data.isEasyConfirmationEnabled,
      lastGeneratedAddressIndex: data.lastGeneratedAddressIndex ?? 0, // AddressManager
    })

    wallet.integrityCheck()

    return wallet
  }

  private static commonCreate = async ({
    id,
    networkId,
    implementationId,
    storage,
    internalChain,
    externalChain,

    accountPubKeyHex,
    hwDeviceInfo, // hw wallet
    isReadOnly, // readonly wallet
    provider,
    isEasyConfirmationEnabled,
    lastGeneratedAddressIndex = 0,
  }: {
    accountPubKeyHex: string
    hwDeviceInfo: HWDeviceInfo | null
    id: string
    implementationId: WalletImplementationId
    networkId: NetworkId
    storage: Storage
    internalChain: AddressChain
    externalChain: AddressChain
    isReadOnly: boolean
    provider: YoroiProvider | null | undefined
    isEasyConfirmationEnabled: boolean
    lastGeneratedAddressIndex?: number
  }) => {
    const rewardAddressHex = await deriveRewardAddressHex(accountPubKeyHex, networkId)
    const apiUrl = getCardanoNetworkConfigById(networkId).BACKEND.API_ROOT
    const utxoManager = await makeUtxoManager({storage: storage.join('utxoManager/'), apiUrl})
    const transactionManager = await makeTransactionManager(
      storage.join('txManager/'),
      getCardanoNetworkConfigById(networkId).BACKEND,
    )

    const wallet = new ShelleyWallet({
      storage,
      networkId,
      id,
      utxoManager,
      implementationId,
      hwDeviceInfo,
      isReadOnly,
      provider,
      accountPubKeyHex,
      rewardAddressHex,
      internalChain,
      externalChain,
      isEasyConfirmationEnabled,
      lastGeneratedAddressIndex,
      transactionManager,
    })

    await wallet.discoverAddresses()
    wallet.setupSubscriptions()
    wallet.isInitialized = true
    wallet.save()
    wallet.notify({type: 'initialize'})

    if (!isYoroiWallet(wallet)) throw new Error('invalid wallet')
    return wallet
  }

  private constructor({
    storage,
    networkId,
    id,
    utxoManager,
    implementationId,
    hwDeviceInfo,
    isReadOnly,
    provider,
    accountPubKeyHex,
    rewardAddressHex,
    internalChain,
    externalChain,
    isEasyConfirmationEnabled,
    lastGeneratedAddressIndex,
    transactionManager,
  }: {
    storage: Storage
    networkId: NetworkId
    id: string
    utxoManager: UtxoManager
    implementationId: WalletImplementationId
    hwDeviceInfo: HWDeviceInfo | null
    isReadOnly: boolean
    provider: YoroiProvider | null | undefined
    accountPubKeyHex: string
    rewardAddressHex: string
    internalChain: AddressChain
    externalChain: AddressChain
    isEasyConfirmationEnabled: boolean
    lastGeneratedAddressIndex: number
    transactionManager: TransactionManager
  }) {
    this.id = id
    this.storage = storage
    this.networkId = networkId === NETWORK_REGISTRY.BYRON_MAINNET ? NETWORK_REGISTRY.HASKELL_SHELLEY : networkId
    this.primaryToken = getDefaultAssetByNetworkId(this.networkId)
    this.primaryTokenInfo =
      networkId === NETWORK_REGISTRY.HASKELL_SHELLEY ? primaryTokenInfo.mainnet : primaryTokenInfo.testnet
    this.utxoManager = utxoManager
    this._utxos = utxoManager.initialUtxos
    this.encryptedStorage = makeWalletEncryptedStorage(id)
    this.walletImplementationId = implementationId
    this.isHW = hwDeviceInfo != null
    this.hwDeviceInfo = hwDeviceInfo
    this.isReadOnly = isReadOnly
    this.provider = provider
    this.transactionManager = transactionManager
    this.internalChain = internalChain
    this.externalChain = externalChain
    this.rewardAddressHex = rewardAddressHex
    this.publicKeyHex = accountPubKeyHex
    this.version = DeviceInfo.getVersion()
    this.checksum = isByron(implementationId)
      ? legacyWalletChecksum(accountPubKeyHex)
      : walletChecksum(accountPubKeyHex)
    this.setupSubscriptions()
    this.notify({type: 'initialize'})
    this.isInitialized = true
    this.isEasyConfirmationEnabled = isEasyConfirmationEnabled
    this.state = {lastGeneratedAddressIndex}
    this.stakingKeyPath = isByron(this.walletImplementationId)
      ? []
      : [
          CONFIG.NUMBERS.WALLET_TYPE_PURPOSE.CIP1852,
          CONFIG.NUMBERS.COIN_TYPES.CARDANO,
          CONFIG.NUMBERS.ACCOUNT_INDEX + CONFIG.NUMBERS.HARD_DERIVATION_START,
          CONFIG.NUMBERS.CHAIN_DERIVATIONS.CHIMERIC_ACCOUNT,
          CONFIG.NUMBERS.STAKING_KEY_INDEX,
        ]
  }

  get utxos() {
    return this._utxos
  }

  get receiveAddresses(): Addresses {
    return this.externalAddresses.slice(0, this.numReceiveAddresses)
  }

  save() {
    return this.storage.setItem('data', this.toJSON())
  }

  async remove() {
    await this.transactionManager.clearMemos()
    await this.clear()
  }

  async clear() {
    await this.transactionManager.clear()
    await this.utxoManager.clear()
  }

  saveMemo(txId: string, memo: string): Promise<void> {
    return this.transactionManager.saveMemo(txId, memo)
  }

  // =================== persistence =================== //

  private integrityCheck(): void {
    try {
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

  async sync() {
    await this.doFullSync()
    await this.save()
  }

  async resync() {
    await this.clear()
    this.transactionManager.resetState()
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
  private getChangeAddress(): string {
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

  private async getStakingKey() {
    if (this.walletImplementationId == null) throw new Error('Invalid wallet: walletImplementationId')

    assert.assert(isHaskellShelley(this.walletImplementationId), 'cannot get staking key from a byron-era wallet')

    const accountPubKey = await CardanoMobile.Bip32PublicKey.fromBytes(Buffer.from(this.publicKeyHex, 'hex'))
    const stakingKey = await accountPubKey
      .derive(CONFIG.NUMBERS.CHAIN_DERIVATIONS.CHIMERIC_ACCOUNT)
      .then((key) => key.derive(CONFIG.NUMBERS.STAKING_KEY_INDEX))
      .then((key) => key.toRawKey())

    Logger.info(`getStakingKey: ${Buffer.from(await stakingKey.asBytes()).toString('hex')}`)
    return stakingKey
  }

  private async getRewardAddress() {
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

  private getAddressing(address: string) {
    const purpose = this.getPurpose()

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

  private getAddressedUtxos() {
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
    if (this.rewardAddressHex == null) throw new Error('reward address is null')
    const certsForKey = this.transactionManager.getPerRewardAddressCertificates()[this.rewardAddressHex]
    return Promise.resolve(getDelegationStatus(this.rewardAddressHex, certsForKey))
  }

  canGenerateNewReceiveAddress() {
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
        this.primaryToken,
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
      defaults: this.primaryToken,
    }

    const unsignedTx = await Cardano.createUnsignedDelegationTx(
      absSlotNumber,
      addressedUtxos,
      stakingKey,
      delegationType,
      poolId || null,
      changeAddr,
      delegatedAmountMT,
      this.primaryToken,
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
        this.primaryToken,
        votingPublicKey,
        this.stakingKeyPath,
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
      this.primaryToken,
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

    const ledgerPayload = await Cardano.buildLedgerPayload(
      unsignedTx.unsignedTx,
      Number.parseInt(this.getChainNetworkId(), 10),
      (this.getBaseNetworkConfig() as any).PROTOCOL_MAGIC,
      this.stakingKeyPath,
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

  private async syncUtxos() {
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

  fetchTokenInfo(tokenId: string) {
    const apiUrl = this.getBackendConfig().TOKEN_INFO_SERVICE
    if (!apiUrl) throw new Error('invalid wallet')

    return (tokenId === '' || tokenId === 'ADA') && this.networkId === 1
      ? Promise.resolve(primaryTokenInfo.mainnet)
      : (tokenId === '' || tokenId === 'ADA' || tokenId === 'TADA') && this.networkId === 300
      ? Promise.resolve(primaryTokenInfo.testnet)
      : api.getTokenInfo(tokenId, `${apiUrl}/metadata`)
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

  private isInitialized = false

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
    return this.internalChain.addresses
  }

  get externalAddresses() {
    return this.externalChain.addresses
  }

  get isUsedAddressIndex() {
    return this._isUsedAddressIndexSelector(this.transactionManager.getPerAddressTxs())
  }

  get numReceiveAddresses() {
    return this.state.lastGeneratedAddressIndex + 1
  }

  get transactions() {
    console.log('transactions', this.transactionManager.getTransactions())
    return this.transactionManager.getTransactions()
  }

  get confirmationCounts() {
    return this.transactionManager.getConfirmationCounts()
  }

  // ============ security & key management ============ //
  async encryptAndSaveRootKey(rootKey: string, password: string) {
    return this.encryptedStorage.rootKey.write(rootKey, password)
  }

  async getDecryptedRootKey(password: string) {
    return this.encryptedStorage.rootKey.read(password)
  }

  async enableEasyConfirmation(rootKey: string) {
    await Keychain.setWalletKey(this.id, rootKey)
    this.isEasyConfirmationEnabled = true

    this.notify({type: 'easy-confirmation', enabled: this.isEasyConfirmationEnabled})
  }

  async disableEasyConfirmation() {
    await Keychain.removeWalletKey(this.id)
    this.isEasyConfirmationEnabled = false

    this.notify({type: 'easy-confirmation', enabled: this.isEasyConfirmationEnabled})
  }

  async changePassword(oldPassword: string, newPassword: string) {
    if (!_.isEmpty(validatePassword(newPassword, newPassword))) throw new Error('New password is not valid')

    const key = EncryptedStorageKeys.rootKey(this.id)
    const rootKey = await EncryptedStorage.read(key, oldPassword)
    return EncryptedStorage.write(key, rootKey, newPassword)
  }

  // =================== subscriptions =================== //

  // needs to be bound
  private notify = (event: WalletEvent) => {
    this.subscriptions.forEach((handler) => handler(event))
  }

  subscribe(subscription: WalletSubscription) {
    this.subscriptions.push(subscription)

    return () => {
      this.subscriptions = this.subscriptions.filter((sub) => sub !== subscription)
    }
  }

  private notifyOnTxHistoryUpdate = () => {
    this._onTxHistoryUpdateSubscriptions.forEach((handler) => handler(this))
  }

  subscribeOnTxHistoryUpdate(subscription: () => void) {
    this._onTxHistoryUpdateSubscriptions.push(subscription)

    return () => {
      this._onTxHistoryUpdateSubscriptions = this._onTxHistoryUpdateSubscriptions.filter((sub) => sub !== subscription)
    }
  }

  private setupSubscriptions() {
    this.transactionManager.subscribe(() => this.notify({type: 'transactions', transactions: this.transactions}))
    this.transactionManager.subscribe(this.notifyOnTxHistoryUpdate)
    this.internalChain.addSubscriberToNewAddresses(() =>
      this.notify({type: 'addresses', addresses: this.internalAddresses}),
    )
    this.externalChain.addSubscriberToNewAddresses(() =>
      this.notify({type: 'addresses', addresses: this.externalAddresses}),
    )
  }

  // =================== sync =================== //

  async tryDoFullSync() {
    try {
      return await nonblockingSynchronize(this._doFullSyncMutex, () => this._doFullSync())
    } catch (error) {
      if (!(error instanceof IsLockedError)) {
        throw error
      }
    }
  }

  private async doFullSync() {
    return synchronize(this._doFullSyncMutex, () => this._doFullSync())
  }

  private async _doFullSync() {
    assert.assert(this.isInitialized, 'doFullSync: isInitialized')

    if (isJormungandr(this.networkId)) return
    Logger.info('Discovery done, now syncing transactions')

    await this.discoverAddresses()

    await Promise.all([this.syncUtxos(), this.transactionManager.doSync(this.getAddressesInBlocks())])

    this.updateLastGeneratedAddressIndex()
  }

  private getAddressesInBlocks() {
    const internalAddresses = this.internalChain.getBlocks()
    const externalAddresses = this.externalChain.getBlocks()

    if (this.rewardAddressHex != null) return [...internalAddresses, ...externalAddresses, [this.rewardAddressHex]]

    return [...internalAddresses, ...externalAddresses]
  }

  private async discoverAddresses() {
    // last chunk gap limit check
    const filterFn = (addrs) => api.filterUsedAddresses(addrs, this.getBackendConfig())
    await Promise.all([this.internalChain.sync(filterFn), this.externalChain.sync(filterFn)])
  }

  private isUsedAddress(address: string) {
    const perAddressTxs = this.transactionManager.getPerAddressTxs()
    return !!perAddressTxs[address] && perAddressTxs[address].length > 0
  }

  private getLastUsedIndex(chain: AddressChain): number {
    for (let i = chain.size() - 1; i >= 0; i--) {
      if (this.isUsedAddress(chain.addresses[i])) {
        return i
      }
    }
    return -1
  }

  private updateLastGeneratedAddressIndex = () => {
    const lastUsedIndex = this.getLastUsedIndex(this.externalChain)
    if (lastUsedIndex > this.state.lastGeneratedAddressIndex) {
      this.state.lastGeneratedAddressIndex = lastUsedIndex
    }
  }

  // ========== UI state ============= //

  private updateState(update: Partial<WalletState>) {
    Logger.debug('Wallet::updateState', update)

    this.state = {
      ...this.state,
      ...update,
    }

    this.notify({type: 'state', state: this.state})
  }

  // ========== persistence ============= //

  // TODO: move to specific child class?
  toJSON(): WalletJSON {
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

const makeKeys = async ({mnemonic, implementationId}: {mnemonic: string; implementationId: WalletImplementationId}) => {
  const rootKeyPtr = await generateWalletRootKey(mnemonic)
  const rootKey: string = Buffer.from(await rootKeyPtr.asBytes()).toString('hex')

  const purpose = isByron(implementationId)
    ? CONFIG.NUMBERS.WALLET_TYPE_PURPOSE.BIP44
    : CONFIG.NUMBERS.WALLET_TYPE_PURPOSE.CIP1852
  const accountPubKeyHex = await rootKeyPtr
    .derive(purpose)
    .then((key) => key.derive(CONFIG.NUMBERS.COIN_TYPES.CARDANO))
    .then((key) => key.derive(CONFIG.NUMBERS.ACCOUNT_INDEX + CONFIG.NUMBERS.HARD_DERIVATION_START))
    .then((accountKey) => accountKey.toPublic())
    .then((accountPubKey) => accountPubKey.asBytes())
    .then((bytes) => Buffer.from(bytes).toString('hex'))

  return {
    rootKey,
    accountPubKeyHex,
  }
}

const addressChains = {
  create: async ({
    accountPubKeyHex,
    implementationId,
    networkId,
  }: {
    accountPubKeyHex: string
    implementationId: WalletImplementationId
    networkId: NetworkId
  }) => {
    const walletConfig = getWalletConfigById(implementationId)
    const internalChain = new AddressChain(
      new AddressGenerator(accountPubKeyHex, 'Internal', implementationId, networkId),
      walletConfig.DISCOVERY_BLOCK_SIZE,
      walletConfig.DISCOVERY_GAP_SIZE,
    )
    const externalChain = new AddressChain(
      new AddressGenerator(accountPubKeyHex, 'External', implementationId, networkId),
      walletConfig.DISCOVERY_BLOCK_SIZE,
      walletConfig.DISCOVERY_GAP_SIZE,
    )

    // Create at least one address in each block
    await internalChain.initialize()
    await externalChain.initialize()

    return {internalChain, externalChain}
  },

  restore: ({data, networkId}: {data: WalletJSON; networkId: NetworkId}) => {
    return {
      internalChain: AddressChain.fromJSON(data.internalChain, networkId),
      externalChain: AddressChain.fromJSON(data.externalChain, networkId),
    }
  },
}

const parseWalletJSON = (data: unknown) => {
  const parsed = parseSafe(data)
  return isWalletJSON(parsed) ? parsed : undefined
}

const isWalletJSON = (data: unknown): data is WalletJSON => {
  const candidate = data as WalletJSON
  return !!candidate && typeof candidate === 'object' && keys.every((key) => key in candidate)
}

const keys: Array<keyof WalletJSON> = [
  'publicKeyHex',
  'networkId',
  'walletImplementationId',
  'internalChain',
  'externalChain',
  'isEasyConfirmationEnabled',
  'lastGeneratedAddressIndex',
]

export const primaryTokenInfo = {
  mainnet: {
    id: '',
    name: 'ADA',
    decimals: 6,
    description: '',
    ticker: 'ADA',
  } as TokenInfo,
  testnet: {
    id: '',
    name: 'TADA',
    decimals: 6,
    description: '',
    ticker: 'TADA',
  } as TokenInfo,
}
