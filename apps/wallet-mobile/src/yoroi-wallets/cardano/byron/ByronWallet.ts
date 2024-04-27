/* eslint-disable @typescript-eslint/no-explicit-any */
import {PrivateKey} from '@emurgo/cross-csl-core'
import {signRawTransaction} from '@emurgo/yoroi-lib'
import {Datum} from '@emurgo/yoroi-lib/dist/internals/models'
import {AppApi, CardanoApi} from '@yoroi/api'
import {isNonNullable, parseSafe} from '@yoroi/common'
import {Api, App, Balance, Chain, Portfolio} from '@yoroi/types'
import assert from 'assert'
import {BigNumber} from 'bignumber.js'
import ExtendableError from 'es6-error'
import _ from 'lodash'
import DeviceInfo from 'react-native-device-info'
import {defaultMemoize} from 'reselect'
import {Observable} from 'rxjs'

import {buildPortfolioBalanceManager} from '../../../features/Portfolio/common/hooks/usePortfolioBalanceManager'
import {toBalanceManagerSyncArgs} from '../../../features/Portfolio/common/transformers/toBalanceManagerSyncArgs'
import {toChainSupportedNetwork} from '../../../features/Portfolio/common/transformers/toChainSupportedNetwork'
import {networksConfig} from '../../../features/WalletManager/common/constants'
import LocalizableError from '../../../i18n/LocalizableError'
import {WalletMeta} from '../../../wallet-manager/types'
import walletManager from '../../../wallet-manager/walletManager'
import {HWDeviceInfo} from '../../hw'
import {Logger} from '../../logging'
import {makeMemosManager, MemosManager} from '../../memos'
import {makeWalletEncryptedStorage, WalletEncryptedStorage} from '../../storage'
import {Keychain} from '../../storage/Keychain'
import {
  AccountStateResponse,
  BackendConfig,
  CurrencySymbol,
  DefaultAsset,
  FundInfoResponse,
  NETWORK_REGISTRY,
  NetworkId,
  PoolInfoRequest,
  RawUtxo,
  StakingInfo,
  TipStatusResponse,
  Transaction,
  TxStatusRequest,
  TxStatusResponse,
  WALLET_IMPLEMENTATION_REGISTRY,
  WalletImplementationId,
  YoroiEntry,
  YoroiNftModerationStatus,
  YoroiSignedTx,
  YoroiUnsignedTx,
} from '../../types'
import {asQuantity, isMainnetNetworkId, Quantities} from '../../utils'
import {genTimeToSlot} from '../../utils/timeUtils'
import {validatePassword} from '../../utils/validators'
import {Cardano, CardanoMobile} from '../../wallets'
import * as legacyApi from '../api'
import {calcLockedDeposit} from '../assetUtils'
import {encryptWithPassword} from '../catalyst/catalystCipher'
import {generatePrivateKeyForCatalyst} from '../catalyst/catalystUtils'
import {AddressChain, AddressChainJSON, Addresses, AddressGenerator} from '../chain'
import {API_ROOT, MAX_GENERATED_UNUSED, PRIMARY_TOKEN, PRIMARY_TOKEN_INFO} from '../constants/mainnet/constants'
import {CardanoError, InvalidState} from '../errors'
import {ADDRESS_TYPE_TO_CHANGE} from '../formatPath'
import {getTime} from '../getTime'
import {doesCardanoAppVersionSupportCIP36, getCardanoAppMajorVersion, signTxWithLedger} from '../hw'
import {CardanoHaskellShelleyNetwork, getCardanoNetworkConfigById, isHaskellShelleyNetwork} from '../networks'
import {NUMBERS} from '../numbers'
import {processTxHistoryData} from '../processTransactions'
import {filterAddressesByStakingKey, getDelegationStatus} from '../shelley/delegationUtils'
import {yoroiSignedTx} from '../signedTx'
import {TransactionManager} from '../transactionManager'
import {
  CardanoTypes,
  isYoroiWallet,
  legacyWalletChecksum,
  NoOutputsError,
  NotEnoughMoneyToSendError,
  RegistrationStatus,
  walletChecksum,
  WalletEvent,
  WalletSubscription,
  YoroiWallet,
} from '../types'
import {yoroiUnsignedTx} from '../unsignedTx'
import {
  deriveRewardAddressHex,
  getCardanoBaseConfig,
  getWalletConfigById,
  isByron,
  isHaskellShelley,
  toRecipients,
} from '../utils'
import {makeUtxoManager, UtxoManager} from '../utxoManager'
import {utxosMaker} from '../utxoManager/utxos'
import {makeKeys} from './makeKeys'

type WalletState = {
  lastGeneratedAddressIndex: number
}

export type ShelleyWalletJSON = {
  version: string

  networkId: NetworkId
  walletImplementationId: WalletImplementationId

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

const networkId = NETWORK_REGISTRY.HASKELL_SHELLEY
const implementationId = WALLET_IMPLEMENTATION_REGISTRY.HASKELL_BYRON

const appApi = AppApi.appApiMaker({baseUrl: API_ROOT})

export class ByronWallet implements YoroiWallet {
  readonly api: App.Api = appApi
  readonly primaryToken: DefaultAsset
  readonly primaryTokenInfo: Balance.TokenInfo
  readonly id: string
  readonly networkId: NetworkId
  readonly walletImplementationId: WalletImplementationId
  readonly hwDeviceInfo: null | HWDeviceInfo
  readonly isHW: boolean
  readonly isReadOnly: boolean
  readonly internalChain: AddressChain
  readonly externalChain: AddressChain
  readonly publicKeyHex: string
  readonly rewardAddressHex: string
  readonly version: string
  readonly checksum: CardanoTypes.WalletChecksum
  readonly encryptedStorage: WalletEncryptedStorage
  isEasyConfirmationEnabled = false
  readonly balance$: Observable<Portfolio.Event.BalanceManager>
  readonly network: Chain.SupportedNetworks
  readonly portfolioPrimaryTokenInfo: Readonly<Portfolio.Token.Info>
  readonly balanceManager: Readonly<Portfolio.Manager.Balance>

  private _utxos: RawUtxo[]
  private readonly storage: App.Storage
  private readonly utxoManager: UtxoManager
  private readonly stakingKeyPath: number[]
  private readonly transactionManager: TransactionManager
  private readonly memosManager: MemosManager
  private _collateralId = ''
  private readonly cardanoApi: Api.Cardano.Actions

  // =================== create =================== //

  static async create({
    id,
    storage,
    mnemonic,
    password,
  }: {
    id: string
    storage: App.Storage
    mnemonic: string
    password: string
  }): Promise<YoroiWallet> {
    const {rootKey, accountPubKeyHex} = await makeKeys({mnemonic})
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
    })

    await encryptAndSaveRootKey(wallet, rootKey, password)

    return wallet
  }

  static async createBip44({
    id,
    storage,
    accountPubKeyHex,
    hwDeviceInfo, // hw wallet
    isReadOnly, // readonly wallet
  }: {
    accountPubKeyHex: string
    hwDeviceInfo: HWDeviceInfo | null
    id: string
    isReadOnly: boolean
    storage: App.Storage
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
    })
  }

  static async restore({walletMeta, storage}: {storage: App.Storage; walletMeta: WalletMeta}) {
    const data = await storage.getItem('data', parseWalletJSON)
    if (!data) throw new Error('Cannot read saved data')

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
    isEasyConfirmationEnabled,
    lastGeneratedAddressIndex = 0,
  }: {
    accountPubKeyHex: string
    hwDeviceInfo: HWDeviceInfo | null
    id: string
    implementationId: WalletImplementationId
    networkId: NetworkId
    storage: App.Storage
    internalChain: AddressChain
    externalChain: AddressChain
    isReadOnly: boolean
    isEasyConfirmationEnabled: boolean
    lastGeneratedAddressIndex?: number
  }) => {
    const rewardAddressHex = await deriveRewardAddressHex(accountPubKeyHex, networkId)
    const apiUrl = getCardanoNetworkConfigById(networkId).BACKEND.API_ROOT
    const utxoManager = await makeUtxoManager({storage: storage.join('utxoManager/'), apiUrl})
    const transactionManager = await TransactionManager.create(storage.join('txs/'))
    const memosManager = await makeMemosManager(storage.join('memos/'))
    const cardanoApi = CardanoApi.cardanoApiMaker({
      network:
        networkId === NETWORK_REGISTRY.HASKELL_SHELLEY
          ? 'mainnet'
          : networkId === NETWORK_REGISTRY.SANCHONET
          ? 'sanchonet'
          : 'preprod',
    })

    const network = toChainSupportedNetwork(networkId)
    const portfolioPrimaryTokenInfo = networksConfig[network].primaryTokenInfo
    const tokenManager = walletManager.getTokenManager(network)
    const {balanceManager} = buildPortfolioBalanceManager({
      walletId: id,
      primaryTokenInfo: portfolioPrimaryTokenInfo,
      tokenManager,
      network,
    })

    const wallet = new ByronWallet({
      storage,
      networkId,
      id,
      utxoManager,
      implementationId,
      hwDeviceInfo,
      isReadOnly,
      accountPubKeyHex,
      rewardAddressHex,
      internalChain,
      externalChain,
      isEasyConfirmationEnabled,
      lastGeneratedAddressIndex,
      transactionManager,
      memosManager,
      cardanoApi,
      balanceManager,
      network,
      portfolioPrimaryTokenInfo,
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
    accountPubKeyHex,
    rewardAddressHex,
    internalChain,
    externalChain,
    isEasyConfirmationEnabled,
    lastGeneratedAddressIndex,
    transactionManager,
    memosManager,
    cardanoApi,
    balanceManager,
    network,
    portfolioPrimaryTokenInfo,
  }: {
    storage: App.Storage
    networkId: NetworkId
    id: string
    utxoManager: UtxoManager
    implementationId: WalletImplementationId
    hwDeviceInfo: HWDeviceInfo | null
    isReadOnly: boolean
    accountPubKeyHex: string
    rewardAddressHex: string
    internalChain: AddressChain
    externalChain: AddressChain
    isEasyConfirmationEnabled: boolean
    lastGeneratedAddressIndex: number
    transactionManager: TransactionManager
    memosManager: MemosManager
    cardanoApi: Api.Cardano.Actions
    balanceManager: Readonly<Portfolio.Manager.Balance>
    network: Chain.SupportedNetworks
    portfolioPrimaryTokenInfo: Readonly<Portfolio.Token.Info>
  }) {
    this.id = id
    this.storage = storage
    this.networkId = networkId === NETWORK_REGISTRY.BYRON_MAINNET ? NETWORK_REGISTRY.HASKELL_SHELLEY : networkId
    this.primaryToken = PRIMARY_TOKEN
    this.primaryTokenInfo = PRIMARY_TOKEN_INFO
    this.utxoManager = utxoManager
    this._utxos = utxoManager.initialUtxos
    this._collateralId = utxoManager.initialCollateralId
    this.encryptedStorage = makeWalletEncryptedStorage(id)
    this.walletImplementationId = implementationId
    this.isHW = hwDeviceInfo != null
    this.hwDeviceInfo = hwDeviceInfo
    this.isReadOnly = isReadOnly
    this.transactionManager = transactionManager
    this.memosManager = memosManager
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
          NUMBERS.WALLET_TYPE_PURPOSE.CIP1852,
          NUMBERS.COIN_TYPES.CARDANO,
          NUMBERS.ACCOUNT_INDEX + NUMBERS.HARD_DERIVATION_START,
          NUMBERS.CHAIN_DERIVATIONS.CHIMERIC_ACCOUNT,
          NUMBERS.STAKING_KEY_INDEX,
        ]
    this.cardanoApi = cardanoApi
    this.balanceManager = balanceManager
    this.balance$ = balanceManager.observable$
    this.network = network
    this.portfolioPrimaryTokenInfo = portfolioPrimaryTokenInfo
  }

  // portfoliio
  get balances() {
    return this.balanceManager.getBalances()
  }

  get primaryBalance() {
    return this.balanceManager.getPrimaryBalance()
  }

  get primaryBreakdown() {
    return this.balanceManager.getPrimaryBreakdown()
  }

  get receiveAddresses(): Addresses {
    return this.externalAddresses.slice(0, this.numReceiveAddresses)
  }

  get isMainnet() {
    return this.network === Chain.Network.Mainnet
  }

  save() {
    return this.storage.setItem('data', this.toJSON())
  }

  async clear() {
    this.balanceManager.clear()
    await this.transactionManager.clear()
    this.transactionManager.resetState()
    await this.utxoManager.clear()
  }

  saveMemo(txId: string, memo: string): Promise<void> {
    return this.memosManager.saveMemo(txId, memo)
  }

  // =================== persistence =================== //

  private integrityCheck(): void {
    try {
      assert(isHaskellShelleyNetwork(this.networkId), 'invalid networkId')
      if (this.walletImplementationId == null) throw new Error('Invalid wallet: walletImplementationId')
      assert(
        isByron(this.walletImplementationId) || isHaskellShelley(this.walletImplementationId),
        'invalid walletImplementationId',
      )
      if (isHaskellShelley(this.walletImplementationId)) {
        assert(this.rewardAddressHex != null, 'reward address is null')
      }
      if (this.isHW) {
        assert(this.hwDeviceInfo != null, 'no device info for hardware wallet')
      }
    } catch (e) {
      throw new InvalidState((e as Error).message)
    }
  }

  async sync({isForced = false}: {isForced?: boolean} = {}) {
    if (!this.isInitialized) {
      console.error('ShelleyWallet::sync: wallet not initialized')
      return Promise.resolve()
    }

    const addressesBeforeRequest = this.internalChain.addresses.length + this.externalChain.addresses.length
    await this.discoverAddresses()
    const addressesAfterRequest = this.internalChain.addresses.length + this.externalChain.addresses.length
    const hasAddedNewAddress = addressesAfterRequest !== addressesBeforeRequest

    const [hasUpdatedUtxos, hasUpdateTxs] = await Promise.all([
      this.syncUtxos({isForced}),
      this.transactionManager.doSync(this.getAddressesInBlocks(), this.getBackendConfig()),
    ])

    const hasNewLastGeneratedAddress = this.generateNewReceiveAddressIfNeeded()

    const shouldPersist =
      hasNewLastGeneratedAddress || hasAddedNewAddress || hasUpdateTxs || hasUpdatedUtxos || isForced

    if (shouldPersist) await this.save()
  }

  async resync() {
    await this.clear()
    await this.save()
    this.sync()
  }

  // =================== utils =================== //

  private getNetworkConfig(): CardanoHaskellShelleyNetwork {
    return getCardanoNetworkConfigById(this.networkId)
  }

  private getBaseNetworkConfig() {
    type Config = {
      PROTOCOL_MAGIC?: number
      GENESIS_DATE?: string
      START_AT: number
      SLOTS_PER_EPOCH: number
      SLOT_DURATION: number
    }

    const config: Config[] = this.getNetworkConfig().BASE_CONFIG
    return config.reduce((acc, next) => Object.assign(acc, next), {})
  }

  private getBackendConfig(): BackendConfig {
    return this.getNetworkConfig().BACKEND
  }

  private getPurpose(): number {
    if (this.walletImplementationId == null) throw new Error('Invalid wallet: walletImplementationId')

    if (isByron(this.walletImplementationId)) {
      return NUMBERS.WALLET_TYPE_PURPOSE.BIP44
    } else if (isHaskellShelley(this.walletImplementationId)) {
      return NUMBERS.WALLET_TYPE_PURPOSE.CIP1852
    } else {
      throw new Error('CardanoWallet::_getPurpose: invalid wallet impl. id')
    }
  }

  private getChainNetworkId(): string {
    return this.getNetworkConfig().CHAIN_NETWORK_ID
  }

  // returns the address in bech32 (Shelley) or base58 (Byron) format
  private getChangeAddress(): string {
    const candidateAddresses = this.internalChain.addresses
    const unseen = candidateAddresses.filter((addr) => !this.isUsedAddress(addr))
    assert(unseen.length > 0, 'Cannot find change address')
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

  public async getStakingKey() {
    if (this.walletImplementationId == null) throw new Error('Invalid wallet: walletImplementationId')

    assert(isHaskellShelley(this.walletImplementationId), 'cannot get staking key from a byron-era wallet')

    const accountPubKey = await CardanoMobile.Bip32PublicKey.fromBytes(Buffer.from(this.publicKeyHex, 'hex'))
    const stakingKey = await accountPubKey
      .derive(NUMBERS.CHAIN_DERIVATIONS.CHIMERIC_ACCOUNT)
      .then((key) => key.derive(NUMBERS.STAKING_KEY_INDEX))
      .then((key) => key.toRawKey())

    return stakingKey
  }

  private async getRewardAddress() {
    if (this.walletImplementationId == null) throw new Error('Invalid wallet: walletImplementationId')

    const baseAddr = await this.getFirstPaymentAddress()
    return baseAddr.toAddress()
  }

  private getRewardAddressAddressing() {
    return {
      path: [
        this.getPurpose(),
        NUMBERS.COIN_TYPES.CARDANO,
        NUMBERS.ACCOUNT_INDEX + NUMBERS.HARD_DERIVATION_START,
        NUMBERS.CHAIN_DERIVATIONS.CHIMERIC_ACCOUNT,
        NUMBERS.STAKING_KEY_INDEX,
      ],
      startLevel: NUMBERS.BIP44_DERIVATION_LEVELS.PURPOSE,
    }
  }

  async getAllUtxosForKey() {
    return filterAddressesByStakingKey(
      await CardanoMobile.Credential.fromKeyhash(await (await this.getStakingKey()).hash()),
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
          NUMBERS.COIN_TYPES.CARDANO,
          NUMBERS.ACCOUNT_INDEX + NUMBERS.HARD_DERIVATION_START,
          ADDRESS_TYPE_TO_CHANGE['Internal'],
          this.internalChain.getIndexOfAddress(address),
        ],
        startLevel: NUMBERS.BIP44_DERIVATION_LEVELS.PURPOSE,
      }
    }

    if (this.externalChain.isMyAddress(address)) {
      return {
        path: [
          purpose,
          NUMBERS.COIN_TYPES.CARDANO,
          NUMBERS.ACCOUNT_INDEX + NUMBERS.HARD_DERIVATION_START,
          ADDRESS_TYPE_TO_CHANGE['External'],
          this.externalChain.getIndexOfAddress(address),
        ],
        startLevel: NUMBERS.BIP44_DERIVATION_LEVELS.PURPOSE,
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
    const certsForKey = this.transactionManager.perRewardAddressCertificates[this.rewardAddressHex]
    return Promise.resolve(getDelegationStatus(this.rewardAddressHex, certsForKey))
  }

  canGenerateNewReceiveAddress() {
    const lastUsedIndex = this.getLastUsedIndex(this.externalChain)
    // TODO: should use specific wallet config
    const maxIndex = lastUsedIndex + MAX_GENERATED_UNUSED
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

  generateNewReceiveAddress() {
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
      ...stakingUtxos.map((utxo) => utxo.amount as Balance.Quantity),
      accountState.remainingAmount as Balance.Quantity,
    ])

    return {
      status: 'staked',
      poolId: stakingStatus.poolKeyHash,
      amount,
      rewards: accountState.remainingAmount as Balance.Quantity,
    }
  }

  // =================== tx building =================== //

  async createUnsignedTx(entries: YoroiEntry[], auxiliaryData?: Array<CardanoTypes.TxMetadata>) {
    const networkConfig = this.getNetworkConfig()
    const timeToSlotFn = genTimeToSlot(getCardanoBaseConfig(networkConfig))
    const time = await this.checkServerStatus()
      .then(({serverTime}) => serverTime || Date.now())
      .catch(() => Date.now())

    const absSlotNumber = new BigNumber(timeToSlotFn({time}).slot)
    const changeAddr = await this.getAddressedChangeAddress()
    const addressedUtxos = await this.getAddressedUtxos()
    const primaryTokenId = this.primaryTokenInfo.id

    const recipients = await toRecipients(entries, this.primaryToken)

    const containsDatum = recipients.some((recipient) => recipient.datum)

    const {
      coinsPerUtxoByte,
      keyDeposit,
      linearFee: {coefficient, constant},
      poolDeposit,
    } = await this.getProtocolParams()

    try {
      const unsignedTx = await Cardano.createUnsignedTx(
        absSlotNumber,
        addressedUtxos,
        recipients,
        changeAddr,
        {
          keyDeposit,
          linearFee: {
            coefficient,
            constant: containsDatum ? String(BigInt(constant) * 2n) : constant,
          },
          minimumUtxoVal: networkConfig.MINIMUM_UTXO_VAL,
          coinsPerUtxoByte,
          poolDeposit,
          networkId: networkConfig.NETWORK_ID,
        },
        this.primaryToken,
        {metadata: auxiliaryData},
      )

      return yoroiUnsignedTx({
        unsignedTx,
        networkConfig,
        addressedUtxos,
        entries,
        primaryTokenId,
      })
    } catch (e) {
      if (e instanceof NotEnoughMoneyToSendError || e instanceof NoOutputsError) throw e
      Logger.error(`shelley::createUnsignedTx:: ${(e as Error).message}`, e)
      throw new CardanoError((e as Error).message)
    }
  }

  signSwapCancellationWithLedger(): Promise<void> {
    return Promise.reject(new Error('Method not implemented.'))
  }

  async createUnsignedGovernanceTx(votingCertificates: CardanoTypes.Certificate[]) {
    const time = await this.checkServerStatus()
      .then(({serverTime}) => serverTime || Date.now())
      .catch(() => Date.now())
    const primaryTokenId = this.primaryTokenInfo.id
    const absSlotNumber = new BigNumber(getTime(time).absoluteSlot)
    const changeAddr = await this.getAddressedChangeAddress()
    const addressedUtxos = await this.getAddressedUtxos()
    const networkConfig = this.getNetworkConfig()

    const {coinsPerUtxoByte, keyDeposit, linearFee, poolDeposit} = await this.getProtocolParams()

    try {
      const unsignedTx = await Cardano.createUnsignedTx(
        absSlotNumber,
        addressedUtxos,
        [],
        changeAddr,
        {
          keyDeposit,
          linearFee,
          minimumUtxoVal: networkConfig.MINIMUM_UTXO_VAL,
          coinsPerUtxoByte,
          poolDeposit,
          networkId: networkConfig.NETWORK_ID,
        },
        PRIMARY_TOKEN,
        {},
        votingCertificates,
      )

      return yoroiUnsignedTx({
        unsignedTx,
        networkConfig: networkConfig,
        addressedUtxos,
        entries: [],
        governance: true,
        primaryTokenId,
      })
    } catch (e) {
      if (e instanceof NotEnoughMoneyToSendError || e instanceof NoOutputsError) throw e
      throw new CardanoError((e as Error).message)
    }
  }

  async signTx(unsignedTx: YoroiUnsignedTx, decryptedMasterKey: string) {
    const masterKey = await CardanoMobile.Bip32PrivateKey.fromBytes(Buffer.from(decryptedMasterKey, 'hex'))
    const accountPrivateKey = await masterKey
      .derive(this.getPurpose())
      .then((key) => key.derive(NUMBERS.COIN_TYPES.CARDANO))
      .then((key) => key.derive(0 + NUMBERS.HARD_DERIVATION_START))
    const accountPrivateKeyHex = await accountPrivateKey.asBytes().then(toHex)
    const stakingPrivateKey = await accountPrivateKey
      .derive(NUMBERS.CHAIN_DERIVATIONS.CHIMERIC_ACCOUNT)
      .then((key) => key.derive(NUMBERS.STAKING_KEY_INDEX))
      .then((key) => key.toRawKey())
    const stakingKeys =
      unsignedTx.staking.delegations ||
      unsignedTx.staking.registrations ||
      unsignedTx.staking.deregistrations ||
      unsignedTx.staking.withdrawals
        ? [stakingPrivateKey]
        : undefined

    const datumDatas = unsignedTx.entries
      .map((entry) => entry.datum)
      .filter(isNonNullable)
      .filter((datum): datum is Exclude<Datum, {hash: string}> => 'data' in datum)

    if (datumDatas.length > 0) {
      const signedTx = await unsignedTx.unsignedTx.sign(
        NUMBERS.BIP44_DERIVATION_LEVELS.ACCOUNT,
        accountPrivateKeyHex,
        new Set<string>(),
        [],
        undefined,
        datumDatas,
      )
      return yoroiSignedTx({unsignedTx, signedTx})
    }

    const signedTx = await unsignedTx.unsignedTx.sign(
      NUMBERS.BIP44_DERIVATION_LEVELS.ACCOUNT,
      accountPrivateKeyHex,
      new Set<string>(),
      stakingKeys,
      stakingPrivateKey,
    )

    return yoroiSignedTx({unsignedTx, signedTx})
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
    const primaryTokenId = this.primaryTokenInfo.id
    const delegatedAmountMT = {
      values: [{identifier: '', amount: delegatedAmount, networkId: networkConfig.NETWORK_ID}],
      defaults: this.primaryToken,
    }

    const {coinsPerUtxoByte, keyDeposit, linearFee, poolDeposit} = await this.getProtocolParams()

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
        keyDeposit,
        linearFee,
        minimumUtxoVal: networkConfig.MINIMUM_UTXO_VAL,
        coinsPerUtxoByte,
        poolDeposit,
        networkId: networkConfig.NETWORK_ID,
      },
    )

    return yoroiUnsignedTx({
      unsignedTx,
      networkConfig,
      addressedUtxos,
      primaryTokenId,
    })
  }

  async getFirstPaymentAddress() {
    const externalAddress = this.externalAddresses[0]
    const addr = await Cardano.Wasm.Address.fromBech32(externalAddress)
    const address = await Cardano.Wasm.BaseAddress.fromAddress(addr)
    if (!address) throw new Error('invalid address')
    return address
  }

  async ledgerSupportsCIP36(useUSB: boolean): Promise<boolean> {
    if (!this.hwDeviceInfo) throw new Error('Invalid wallet state')
    return doesCardanoAppVersionSupportCIP36(await getCardanoAppMajorVersion(this.hwDeviceInfo, useUSB))
  }

  async createVotingRegTx(pin: string, supportsCIP36: boolean) {
    const bytes = await generatePrivateKeyForCatalyst()
      .then((key) => key.toRawKey())
      .then((key) => key.asBytes())

    const catalystKeyHex = Buffer.from(bytes).toString('hex')

    try {
      const timeToSlotFn = genTimeToSlot(getCardanoBaseConfig(this.getNetworkConfig()))
      const time = await this.checkServerStatus()
        .then(({serverTime}) => serverTime || Date.now())
        .catch(() => Date.now())
      const primaryTokenId = this.primaryTokenInfo.id

      const absSlotNumber = new BigNumber(timeToSlotFn({time}).slot)
      const votingPublicKey = await Promise.resolve(Buffer.from(catalystKeyHex, 'hex'))
        .then((bytes) => CardanoMobile.PrivateKey.fromExtendedBytes(bytes))
        .then((key) => key.toPublic())
      const stakingPublicKey = await this.getStakingKey()
      const changeAddr = await this.getAddressedChangeAddress()
      const networkConfig = this.getNetworkConfig()
      const {coinsPerUtxoByte, keyDeposit, linearFee, poolDeposit} = await this.getProtocolParams()

      const config = {
        keyDeposit,
        linearFee,
        minimumUtxoVal: networkConfig.MINIMUM_UTXO_VAL,
        coinsPerUtxoByte,
        poolDeposit,
        networkId: networkConfig.NETWORK_ID,
      }
      const txOptions = {}
      const nonce = absSlotNumber.toNumber()
      const chainNetworkConfig = Number.parseInt(this.getChainNetworkId(), 10)

      const addressedUtxos = await this.getAddressedUtxos()

      const baseAddr = await this.getFirstPaymentAddress()
      const paymentAddressCIP36 = await baseAddr
        .toAddress()
        .then((a) => a.toBytes())
        .then((b) => Buffer.from(b).toString('hex'))

      const addressingCIP36 = this.getAddressing(await baseAddr.toAddress().then((a) => a.toBech32(undefined)))

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
        paymentAddressCIP36,
        addressingCIP36.path,
        supportsCIP36,
      )

      const rewardAddress = await this.getRewardAddress().then((address) => address.toBech32(undefined))

      const votingRegistration: {
        votingPublicKey: string
        stakingPublicKey: string
        rewardAddress: string
        nonce: number
      } = {
        votingPublicKey: await votingPublicKey.toBech32(),
        stakingPublicKey: await stakingPublicKey.toBech32(),
        rewardAddress,
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
          primaryTokenId,
        }),
      }
    } catch (e) {
      if (e instanceof LocalizableError || e instanceof ExtendableError) throw e
      throw new CardanoError((e as Error).message)
    }
  }

  async createWithdrawalTx(shouldDeregister: boolean): Promise<YoroiUnsignedTx> {
    const networkConfig = this.getNetworkConfig()
    const timeToSlotFn = genTimeToSlot(getCardanoBaseConfig(this.getNetworkConfig()))
    const primaryTokenId = this.primaryTokenInfo.id

    const time = await this.checkServerStatus()
      .then(({serverTime}) => serverTime || Date.now())
      .catch(() => Date.now())

    const absSlotNumber = new BigNumber(timeToSlotFn({time}).slot)
    const changeAddr = await this.getAddressedChangeAddress()
    const addressedUtxos = await this.getAddressedUtxos()
    const accountState = await legacyApi.getAccountState({addresses: [this.rewardAddressHex]}, networkConfig.BACKEND)

    const {coinsPerUtxoByte, keyDeposit, linearFee, poolDeposit} = await this.getProtocolParams()

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
        keyDeposit,
        linearFee,
        minimumUtxoVal: networkConfig.MINIMUM_UTXO_VAL,
        coinsPerUtxoByte,
        poolDeposit,
        networkId,
      },
      {metadata: undefined},
    )

    return yoroiUnsignedTx({
      unsignedTx: withdrawalTx,
      networkConfig,
      addressedUtxos,
      primaryTokenId,
    })
  }

  async signTxWithLedger(unsignedTx: YoroiUnsignedTx, useUSB: boolean): Promise<YoroiSignedTx> {
    if (!this.hwDeviceInfo) throw new Error('Invalid wallet state')

    const appAdaVersion = await getCardanoAppMajorVersion(this.hwDeviceInfo, useUSB)

    if (!doesCardanoAppVersionSupportCIP36(appAdaVersion) && unsignedTx.voting.registration) {
      const ledgerPayload = await Cardano.buildVotingLedgerPayloadV5(
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
        false,
      )

      return yoroiSignedTx({unsignedTx, signedTx})
    }

    Logger.info('CardanoWallet::signTxWithLedger: Ledger app version > 5, using CIP-36')

    const ledgerPayload = await Cardano.buildLedgerPayload(
      unsignedTx.unsignedTx,
      Number.parseInt(this.getChainNetworkId(), 10),
      (this.getBaseNetworkConfig() as any).PROTOCOL_MAGIC,
      this.stakingKeyPath,
    )

    const datumDatas = unsignedTx.entries
      .map((entry) => entry.datum)
      .filter(isNonNullable)
      .filter((datum): datum is Exclude<Datum, {hash: string}> => 'data' in datum)

    const signedLedgerTx = await signTxWithLedger(ledgerPayload, this.hwDeviceInfo, useUSB)
    const signedTx = await Cardano.buildLedgerSignedTx(
      unsignedTx.unsignedTx,
      signedLedgerTx,
      this.getPurpose(),
      this.publicKeyHex,
      true,
      datumDatas.length > 0 ? datumDatas : undefined,
    )

    return yoroiSignedTx({unsignedTx, signedTx})
  }

  // =================== backend API =================== //

  async checkServerStatus() {
    return legacyApi.checkServerStatus(this.getBackendConfig())
  }

  getProtocolParams() {
    return this.cardanoApi.getProtocolParams()
  }

  async submitTransaction(signedTx: string) {
    const response: any = await legacyApi.submitTransaction(signedTx, this.getBackendConfig())
    return response as any
  }

  private async syncUtxos({isForced = false}: {isForced?: boolean} = {}) {
    const addresses = [...this.internalAddresses, ...this.externalAddresses]

    await this.utxoManager.sync(addresses)
    const newUtxos = await this.utxoManager.getCachedUtxos()

    // NOTE: wallet is not aware of utxos state
    // if it crashes, the utxo manager will be out of sync with wallet
    if (this.didUtxosUpdate(this._utxos, newUtxos) || isForced) {
      // NOTE: recalc locked deposit should happen also when epoch changes after conway
      const {coinsPerUtxoByte} = await this.getProtocolParams()
      const lockedAsStorageCost = await calcLockedDeposit({
        rawUtxos: newUtxos,
        coinsPerUtxoByteStr: coinsPerUtxoByte,
      })

      const balancesToSync = toBalanceManagerSyncArgs(newUtxos, BigInt(lockedAsStorageCost.toString()))
      this.balanceManager.syncBalances(balancesToSync)

      this._utxos = newUtxos
      this.notify({type: 'utxos', utxos: this.utxos})
      return true
    }
    return false
  }

  get utxos() {
    return this._utxos.filter((utxo) => utxo.utxo_id !== this._collateralId)
  }

  get allUtxos() {
    return this._utxos
  }

  get collateralId(): string {
    return this._collateralId
  }

  getCollateralInfo() {
    const utxos = utxosMaker(this._utxos)
    const collateralId = this.collateralId
    const collateralUtxo = utxos.findById(collateralId)
    const quantity = collateralUtxo?.amount !== undefined ? asQuantity(collateralUtxo.amount) : Quantities.zero
    const txInfos = this.transactions
    const collateralTxId = collateralId ? collateralId.split(':')[0] : null
    const isConfirmed = !!collateralTxId && Object.values(txInfos).some((tx) => tx.id === collateralTxId)

    return {
      utxo: collateralUtxo,
      amount: {quantity, tokenId: this.primaryTokenInfo.id},
      collateralId,
      isConfirmed,
    }
  }

  async setCollateralId(id: RawUtxo['utxo_id']): Promise<void> {
    await this.utxoManager.setCollateralId(id)
    this._collateralId = id
    this.notify({type: 'collateral-id', collateralId: this._collateralId})
  }

  private didUtxosUpdate(oldUtxos: RawUtxo[], newUtxos: RawUtxo[]): boolean {
    if (oldUtxos.length !== newUtxos.length) {
      return true
    }

    const oldUtxoIds = new Set(oldUtxos.map((utxo) => utxo.utxo_id))

    for (const newUtxo of newUtxos) {
      if (!oldUtxoIds.has(newUtxo.utxo_id)) {
        return true
      }
    }

    return false
  }

  async fetchAccountState(): Promise<AccountStateResponse> {
    return legacyApi.bulkGetAccountState([this.rewardAddressHex], this.getBackendConfig())
  }

  async fetchPoolInfo(request: PoolInfoRequest) {
    return legacyApi.getPoolInfo(request, this.getBackendConfig())
  }

  public async signRawTx(txHex: string, pKeys: PrivateKey[]) {
    return signRawTransaction(CardanoMobile, txHex, pKeys)
  }

  async fetchTokenInfo(tokenId: string) {
    const apiUrl = this.getBackendConfig().TOKEN_INFO_SERVICE
    if (!apiUrl) throw new Error('invalid wallet')

    const isMainnet = isMainnetNetworkId(this.networkId)
    const isTestnet = !isMainnet

    if ((tokenId === '' || tokenId === 'ADA') && isMainnet) {
      return primaryTokenInfo.mainnet
    }

    if ((tokenId === '' || tokenId === 'ADA' || tokenId === 'TADA') && isTestnet) {
      return primaryTokenInfo.testnet
    }

    return legacyApi.getTokenInfo(tokenId, `${apiUrl}/metadata`, this.getBackendConfig())
  }

  async fetchFundInfo(): Promise<FundInfoResponse> {
    return legacyApi.getFundInfo(this.getBackendConfig(), this.getNetworkConfig().IS_MAINNET)
  }

  async fetchTxStatus(request: TxStatusRequest): Promise<TxStatusResponse> {
    return legacyApi.fetchTxStatus(request, this.getBackendConfig())
  }

  async fetchTipStatus(): Promise<TipStatusResponse> {
    return legacyApi.getTipStatus(this.getBackendConfig())
  }

  async fetchCurrentPrice(symbol: CurrencySymbol): Promise<number> {
    return legacyApi.fetchCurrentPrice(symbol, this.getBackendConfig())
  }

  // TODO: caching
  fetchNftModerationStatus(fingerprint: string): Promise<YoroiNftModerationStatus> {
    const backendConfig = this.getBackendConfig()
    const networkConfig = this.getNetworkConfig()
    const isMainnet = networkConfig.IS_MAINNET
    return legacyApi.getNFTModerationStatus(fingerprint, {...backendConfig, mainnet: isMainnet})
  }

  private state: WalletState = {
    lastGeneratedAddressIndex: 0,
  }

  private isInitialized = false

  private _doFullSyncMutex: any = {name: 'doFullSyncMutex', lock: null}

  private subscriptions: Array<WalletSubscription> = []

  private _onTxHistoryUpdateSubscriptions: Array<(wallet: YoroiWallet) => void> = []

  private _isUsedAddressIndexSelector = defaultMemoize((perAddressTxs) =>
    _.mapValues(perAddressTxs, (txs) => {
      assert(!!txs, 'perAddressTxs cointains false-ish value')
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
    return this._isUsedAddressIndexSelector(this.transactionManager.perAddressTxs)
  }

  get numReceiveAddresses() {
    return this.state.lastGeneratedAddressIndex + 1
  }

  get transactions() {
    const memos = this.memosManager.getMemos()
    return _.mapValues(this.transactionManager.transactions, (tx: Transaction) => {
      return processTxHistoryData(
        tx,
        this.rewardAddressHex != null
          ? [...this.internalAddresses, ...this.externalAddresses, ...[this.rewardAddressHex]]
          : [...this.internalAddresses, ...this.externalAddresses],
        this.confirmationCounts[tx.id] || 0,
        this.networkId,
        memos[tx.id] ?? null,
        this.primaryToken,
      )
    })
  }

  get confirmationCounts() {
    return this.transactionManager.confirmationCounts
  }

  // ============ security & key management ============ //

  getDecryptedRootKey(password: string) {
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

    const rootKey = await this.encryptedStorage.rootKey.read(oldPassword)
    return this.encryptedStorage.rootKey.write(rootKey, newPassword)
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
  private getAddressesInBlocks() {
    const internalAddresses = this.internalChain.getBlocks()
    const externalAddresses = this.externalChain.getBlocks()

    if (this.rewardAddressHex != null) return [...internalAddresses, ...externalAddresses, [this.rewardAddressHex]]

    return [...internalAddresses, ...externalAddresses]
  }

  private async discoverAddresses() {
    // last chunk gap limit check
    const filterFn = (addrs: Addresses) => legacyApi.filterUsedAddresses(addrs, this.getBackendConfig())
    await Promise.all([this.internalChain.sync(filterFn), this.externalChain.sync(filterFn)])
  }

  private isUsedAddress(address: string) {
    const perAddressTxs = this.transactionManager.perAddressTxs
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
    this.state = {
      ...this.state,
      ...update,
    }

    this.notify({type: 'state', state: this.state})
  }

  // ========== persistence ============= //

  private toJSON(): WalletJSON {
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
    }
  }
}

const toHex = (bytes: Uint8Array) => Buffer.from(bytes).toString('hex')

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

export const primaryTokenInfo: Record<'mainnet' | 'testnet', Balance.TokenInfo> = {
  mainnet: {
    id: '',
    name: 'ADA',
    description: 'Cardano',
    kind: 'ft',
    fingerprint: '',
    group: '',
    image: undefined,
    icon: undefined,
    ticker: 'ADA',
    decimals: 6,
    symbol: '₳',
    metadatas: {},
  },
  testnet: {
    kind: 'ft',
    id: '',
    name: 'TADA',
    description: 'Cardano',
    fingerprint: '',
    group: '',
    image: undefined,
    icon: undefined,
    ticker: 'TADA',
    decimals: 6,
    symbol: '₳',
    metadatas: {},
  },
}

const encryptAndSaveRootKey = (wallet: YoroiWallet, rootKey: string, password: string) =>
  wallet.encryptedStorage.rootKey.write(rootKey, password)
