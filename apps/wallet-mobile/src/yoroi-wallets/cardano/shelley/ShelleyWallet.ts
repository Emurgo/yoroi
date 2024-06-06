/* eslint-disable @typescript-eslint/no-explicit-any */
import * as CSL from '@emurgo/cross-csl-core'
import {createSignedLedgerTxFromCbor, signRawTransaction} from '@emurgo/yoroi-lib'
import {Datum} from '@emurgo/yoroi-lib/dist/internals/models'
import {AppApi, CardanoApi} from '@yoroi/api'
import {isNonNullable, parseSafe} from '@yoroi/common'
import {Api, App, Balance, Portfolio} from '@yoroi/types'
import assert from 'assert'
import {BigNumber} from 'bignumber.js'
import {Buffer} from 'buffer'
import _ from 'lodash'
import DeviceInfo from 'react-native-device-info'
import {defaultMemoize} from 'reselect'
import {Observable} from 'rxjs'

import {buildPortfolioBalanceManager} from '../../../features/Portfolio/common/helpers/build-balance-manager'
import {toBalanceManagerSyncArgs} from '../../../features/Portfolio/common/transformers/toBalanceManagerSyncArgs'
import {NetworkManager, WalletMeta} from '../../../features/WalletManager/common/types'
import LocalizableError from '../../../kernel/i18n/LocalizableError'
import {logger} from '../../../kernel/logger/logger'
import {makeWalletEncryptedStorage, WalletEncryptedStorage} from '../../../kernel/storage/EncryptedStorage'
import {makeMemosManager, MemosManager} from '../../../legacy/TxHistory/common/memos/memosManager'
import {HWDeviceInfo} from '../../hw'
import type {
  AccountStateResponse,
  CurrencySymbol,
  DefaultAsset,
  FundInfoResponse,
  PoolInfoRequest,
  RawUtxo,
  TipStatusResponse,
  Transaction,
  TxStatusRequest,
  TxStatusResponse,
  YoroiEntry,
  YoroiNftModerationStatus,
} from '../../types'
import {NETWORK_REGISTRY, StakingInfo, YoroiSignedTx, YoroiUnsignedTx} from '../../types'
import {asQuantity, Quantities} from '../../utils'
import {validatePassword} from '../../utils/validators'
import {Cardano, CardanoMobile} from '../../wallets'
import * as legacyApi from '../api'
import {calcLockedDeposit} from '../assetUtils'
import {encryptWithPassword} from '../catalyst/catalystCipher'
import {generatePrivateKeyForCatalyst} from '../catalyst/catalystUtils'
import {AddressChain, AddressChainJSON, Addresses, AddressGenerator} from '../chain'
import {createSwapCancellationLedgerPayload} from '../common/signatureUtils'
import * as MAINNET from '../constants/mainnet/constants'
import * as SANCHONET from '../constants/sanchonet/constants'
import * as TESTNET from '../constants/testnet/constants'
import {CardanoError} from '../errors'
import {ADDRESS_TYPE_TO_CHANGE} from '../formatPath'
import {getTime} from '../getTime'
import {doesCardanoAppVersionSupportCIP36, getCardanoAppMajorVersion, signTxWithLedger} from '../hw'
import {processTxHistoryData} from '../processTransactions'
import {filterAddressesByStakingKey, getDelegationStatus} from '../shelley/delegationUtils'
import {yoroiSignedTx} from '../signedTx'
import {TransactionManager} from '../transactionManager'
import {
  CardanoTypes,
  isYoroiWallet,
  NoOutputsError,
  NotEnoughMoneyToSendError,
  RegistrationStatus,
  walletChecksum,
  WalletEvent,
  WalletSubscription,
  YoroiWallet,
} from '../types'
import {yoroiUnsignedTx} from '../unsignedTx'
import {deriveRewardAddressHex, toRecipients} from '../utils'
import {makeUtxoManager, UtxoManager} from '../utxoManager'
import {utxosMaker} from '../utxoManager/utxos'
import {makeKeys} from './makeKeys'

type WalletState = {
  lastGeneratedAddressIndex: number
}

export type ShelleyWalletJSON = {
  version: string

  isHW: boolean
  hwDeviceInfo: null | HWDeviceInfo
  isReadOnly: boolean

  publicKeyHex?: string

  lastGeneratedAddressIndex: number
  internalChain: AddressChainJSON
  externalChain: AddressChainJSON
}

export type ByronWalletJSON = Omit<ShelleyWalletJSON, 'account'>

export type WalletJSON = ShelleyWalletJSON | ByronWalletJSON

export const makeShelleyWallet = (constants: typeof MAINNET | typeof TESTNET | typeof SANCHONET) => {
  const {
    ACCOUNT_INDEX,
    API_ROOT,
    BACKEND,
    MINIMUM_UTXO_VAL,
    BIP44_DERIVATION_LEVELS,
    CHAIN_NETWORK_ID,
    CHIMERIC_ACCOUNT,
    COIN_TYPE,
    DISCOVERY_BLOCK_SIZE,
    DISCOVERY_GAP_SIZE,
    HARD_DERIVATION_START,
    IS_MAINNET,
    MAX_GENERATED_UNUSED,
    NETWORK_CONFIG,
    NETWORK_ID,
    PRIMARY_TOKEN,
    PRIMARY_TOKEN_INFO,
    PROTOCOL_MAGIC,
    PURPOSE,
    REWARD_ADDRESS_ADDRESSING,
    STAKING_KEY_INDEX,
    STAKING_KEY_PATH,
    TOKEN_INFO_SERVICE,
    WALLET_IMPLEMENTATION_ID,
  } = constants

  const addressChains = {
    create: async ({accountPubKeyHex}: {accountPubKeyHex: string}) => {
      const internalChain = new AddressChain(
        new AddressGenerator(accountPubKeyHex, 'Internal', WALLET_IMPLEMENTATION_ID, NETWORK_ID),
        DISCOVERY_BLOCK_SIZE,
        DISCOVERY_GAP_SIZE,
      )
      const externalChain = new AddressChain(
        new AddressGenerator(accountPubKeyHex, 'External', WALLET_IMPLEMENTATION_ID, NETWORK_ID),
        DISCOVERY_BLOCK_SIZE,
        DISCOVERY_GAP_SIZE,
      )

      // Create at least one address in each block
      await internalChain.initialize()
      await externalChain.initialize()

      return {internalChain, externalChain}
    },

    restore: ({data}: {data: WalletJSON}) => {
      return {
        internalChain: AddressChain.fromJSON(data.internalChain, NETWORK_ID),
        externalChain: AddressChain.fromJSON(data.externalChain, NETWORK_ID),
      }
    },
  }

  const appApi = AppApi.appApiMaker({baseUrl: API_ROOT})

  return class ShelleyWallet implements YoroiWallet {
    readonly api: App.Api = appApi
    readonly primaryToken: DefaultAsset = PRIMARY_TOKEN
    readonly primaryTokenInfo: Balance.TokenInfo = PRIMARY_TOKEN_INFO
    readonly walletImplementationId = WALLET_IMPLEMENTATION_ID
    readonly networkId = NETWORK_ID
    readonly id: string
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
    private _utxos: RawUtxo[]
    private readonly storage: App.Storage
    private readonly utxoManager: UtxoManager
    private readonly transactionManager: TransactionManager
    private readonly memosManager: MemosManager
    private _collateralId = ''
    private readonly cardanoApi: Api.Cardano.Actions

    readonly balance$: Observable<Portfolio.Event.BalanceManager>
    readonly portfolioPrimaryTokenInfo: Readonly<Portfolio.Token.Info>
    readonly balanceManager: Readonly<Portfolio.Manager.Balance>
    readonly networkManager: Readonly<NetworkManager>

    // =================== create =================== //
    static async create({
      id,
      storage,
      mnemonic,
      password,
      networkManager,
    }: {
      id: string
      storage: Readonly<App.Storage>
      mnemonic: string
      password: string
      networkManager: Readonly<NetworkManager>
    }): Promise<YoroiWallet> {
      // NOTE: keys are part of wallet manager and should be passed by the caller
      // TODO: encrypt root pubkey
      const {rootKey, accountPubKeyHex} = await makeKeys({mnemonic})
      const {internalChain, externalChain} = await addressChains.create({accountPubKeyHex})

      const wallet = await this.commonCreate({
        id,
        storage,
        accountPubKeyHex,
        hwDeviceInfo: null, // hw wallet
        isReadOnly: false, // readonly wallet
        internalChain,
        externalChain,
        networkManager,
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
      networkManager,
    }: {
      accountPubKeyHex: string
      hwDeviceInfo: HWDeviceInfo | null
      id: string
      isReadOnly: boolean
      storage: Readonly<App.Storage>
      networkManager: Readonly<NetworkManager>
    }): Promise<YoroiWallet> {
      const {internalChain, externalChain} = await addressChains.create({accountPubKeyHex})

      return this.commonCreate({
        id,
        storage,
        accountPubKeyHex,
        hwDeviceInfo, // hw wallet
        isReadOnly, // readonly wallet
        internalChain,
        externalChain,
        networkManager,
      })
    }

    static async restore({
      walletMeta,
      storage,
      networkManager,
    }: {
      storage: App.Storage
      walletMeta: WalletMeta
      networkManager: NetworkManager
    }) {
      const data = await storage.getItem('data', parseWalletJSON)
      if (!data) throw new Error('Cannot read saved data')

      const {internalChain, externalChain} = addressChains.restore({data})

      const wallet = await this.commonCreate({
        id: walletMeta.id,
        storage,
        internalChain,
        externalChain,
        accountPubKeyHex: data.publicKeyHex ?? internalChain.publicKey, // can be null for versions < 3.0.2, in which case we can just retrieve from address generator
        hwDeviceInfo: data.hwDeviceInfo, // hw wallet
        isReadOnly: data.isReadOnly ?? false, // readonly wallet
        lastGeneratedAddressIndex: data.lastGeneratedAddressIndex ?? 0, // AddressManager
        networkManager,
      })

      return wallet
    }

    private static commonCreate = async ({
      id,
      storage,
      internalChain,
      externalChain,
      accountPubKeyHex,
      hwDeviceInfo, // hw wallet
      isReadOnly, // readonly wallet
      lastGeneratedAddressIndex = 0,
      networkManager,
    }: {
      accountPubKeyHex: string
      hwDeviceInfo: HWDeviceInfo | null
      id: string
      storage: App.Storage
      internalChain: AddressChain
      externalChain: AddressChain
      isReadOnly: boolean
      lastGeneratedAddressIndex?: number
      networkManager: NetworkManager
    }) => {
      const rewardAddressHex = await deriveRewardAddressHex(accountPubKeyHex, NETWORK_ID)
      const utxoManager = await makeUtxoManager({storage: storage.join('utxoManager/'), apiUrl: API_ROOT})
      const transactionManager = await TransactionManager.create(storage.join('txs/'))
      const memosManager = await makeMemosManager(storage.join('memos/'))
      const cardanoApi = CardanoApi.cardanoApiMaker({
        network:
          NETWORK_ID === NETWORK_REGISTRY.HASKELL_SHELLEY
            ? 'mainnet'
            : NETWORK_ID === NETWORK_REGISTRY.SANCHONET
            ? 'sanchonet'
            : 'preprod',
      })

      const {rootStorage: networkRootStorage, tokenManager, primaryTokenInfo} = networkManager
      const {balanceManager} = buildPortfolioBalanceManager({primaryTokenInfo, tokenManager, networkRootStorage})(id)

      const wallet = new ShelleyWallet({
        storage,
        id,
        utxoManager,
        hwDeviceInfo,
        isReadOnly,
        accountPubKeyHex,
        rewardAddressHex,
        internalChain,
        externalChain,
        lastGeneratedAddressIndex,
        transactionManager,
        memosManager,
        cardanoApi,
        balanceManager,
        networkManager,
        portfolioPrimaryTokenInfo: primaryTokenInfo,
      })
      if (!isYoroiWallet(wallet)) {
        const error = new Error('invalid wallet')
        logger.error(error)
        throw error
      }

      await wallet.discoverAddresses()
      wallet.isInitialized = true
      wallet.save()
      wallet.notify({type: 'initialize'})

      return wallet
    }

    private constructor({
      storage,
      id,
      utxoManager,
      hwDeviceInfo,
      isReadOnly,
      accountPubKeyHex,
      rewardAddressHex,
      internalChain,
      externalChain,
      lastGeneratedAddressIndex,
      transactionManager,
      memosManager,
      cardanoApi,

      balanceManager,
      networkManager,
      portfolioPrimaryTokenInfo,
    }: {
      storage: App.Storage
      id: string
      utxoManager: UtxoManager
      hwDeviceInfo: HWDeviceInfo | null
      isReadOnly: boolean
      accountPubKeyHex: string
      rewardAddressHex: string
      internalChain: AddressChain
      externalChain: AddressChain
      lastGeneratedAddressIndex: number
      transactionManager: TransactionManager
      memosManager: MemosManager
      cardanoApi: Api.Cardano.Actions

      balanceManager: Readonly<Portfolio.Manager.Balance>
      networkManager: Readonly<NetworkManager>
      portfolioPrimaryTokenInfo: Readonly<Portfolio.Token.Info>
    }) {
      this.id = id
      this.storage = storage
      this.utxoManager = utxoManager
      this._utxos = utxoManager.initialUtxos
      this._collateralId = utxoManager.initialCollateralId
      this.encryptedStorage = makeWalletEncryptedStorage(id)
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
      this.checksum = walletChecksum(accountPubKeyHex)
      this.setupSubscriptions()
      this.state = {lastGeneratedAddressIndex}
      this.cardanoApi = cardanoApi

      this.balanceManager = balanceManager
      this.balance$ = balanceManager.observable$
      this.networkManager = networkManager
      this.portfolioPrimaryTokenInfo = portfolioPrimaryTokenInfo
    }

    // portfolio - here to get snapshots only, avoid using it directly
    get balances() {
      return this.balanceManager.getBalances()
    }

    get primaryBalance() {
      return this.balanceManager.getPrimaryBalance()
    }

    get primaryBreakdown() {
      return this.balanceManager.getPrimaryBreakdown()
    }

    get hasOnlyPrimary() {
      return this.balanceManager.getHasOnlyPrimary()
    }

    get isEmpty() {
      return this.balanceManager.getIsEmpty()
    }
    // end of portfolio

    get receiveAddresses(): Addresses {
      return this.externalAddresses.slice(0, this.numReceiveAddresses)
    }

    get isMainnet() {
      return this.networkManager.isMainnet
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
    async sync({isForced = false}: {isForced?: boolean} = {}) {
      if (!this.isInitialized) {
        console.error('ShelleyWallet::sync: wallet not initialized')
        return Promise.resolve()
      }

      const addressesBeforeRequest = this.internalChain.addresses.length + this.externalChain.addresses.length
      await this.discoverAddresses()
      const addressesAfterRequest = this.internalChain.addresses.length + this.externalChain.addresses.length
      const hasAddedNewAddress = addressesAfterRequest !== addressesBeforeRequest
      if (hasAddedNewAddress) await this.save()

      this.generateNewReceiveAddressIfNeeded()

      await Promise.all([
        this.syncUtxos({isForced}),
        this.transactionManager.doSync(this.getAddressesInBlocks(), BACKEND),
      ])
    }

    async resync() {
      await this.clear()
      await this.save()
      this.sync()
    }

    // =================== utils =================== //
    // returns the address in bech32 (Shelley) or base58 (Byron) format
    getChangeAddress(): string {
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
      const result = {
        address: changeAddr,
        addressing,
      }

      return Promise.resolve(result)
    }

    public async getStakingKey() {
      const accountPubKey = await CardanoMobile.Bip32PublicKey.fromBytes(Buffer.from(this.publicKeyHex, 'hex'))
      const stakingKey = await accountPubKey
        .derive(CHIMERIC_ACCOUNT)
        .then((key) => key.derive(STAKING_KEY_INDEX))
        .then((key) => key.toRawKey())

      return stakingKey
    }

    public async signRawTx(txHex: string, pKeys: CSL.PrivateKey[]) {
      return signRawTransaction(CardanoMobile, txHex, pKeys)
    }

    private async getRewardAddress() {
      const baseAddr = await this.getFirstPaymentAddress()
      if (!baseAddr) throw new Error('invalid wallet state')
      return baseAddr.toAddress()
    }

    async getAllUtxosForKey() {
      return filterAddressesByStakingKey(
        await CardanoMobile.Credential.fromKeyhash(await (await this.getStakingKey()).hash()),
        await this.getAddressedUtxos(),
        false,
      )
    }

    private getAddressing(address: string) {
      if (this.internalChain.isMyAddress(address)) {
        return {
          path: [
            PURPOSE,
            COIN_TYPE,
            ACCOUNT_INDEX + HARD_DERIVATION_START,
            ADDRESS_TYPE_TO_CHANGE['Internal'],
            this.internalChain.getIndexOfAddress(address),
          ],
          startLevel: BIP44_DERIVATION_LEVELS.PURPOSE,
        }
      }

      if (this.externalChain.isMyAddress(address)) {
        return {
          path: [
            PURPOSE,
            COIN_TYPE,
            ACCOUNT_INDEX + HARD_DERIVATION_START,
            ADDRESS_TYPE_TO_CHANGE['External'],
            this.externalChain.getIndexOfAddress(address),
          ],
          startLevel: BIP44_DERIVATION_LEVELS.PURPOSE,
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
      const time = await this.checkServerStatus()
        .then(({serverTime}) => serverTime || Date.now())
        .catch(() => Date.now())
      const primaryTokenId = this.primaryTokenInfo.id
      const absSlotNumber = new BigNumber(getTime(time).absoluteSlot)
      const changeAddr = await this.getAddressedChangeAddress()
      const addressedUtxos = await this.getAddressedUtxos()

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
            minimumUtxoVal: MINIMUM_UTXO_VAL,
            coinsPerUtxoByte,
            poolDeposit,
            networkId: NETWORK_ID,
          },
          PRIMARY_TOKEN,
          {metadata: auxiliaryData},
        )

        return yoroiUnsignedTx({unsignedTx, networkConfig: NETWORK_CONFIG, addressedUtxos, entries, primaryTokenId})
      } catch (e) {
        if (e instanceof NotEnoughMoneyToSendError || e instanceof NoOutputsError) throw e
        throw new CardanoError((e as Error).message)
      }
    }

    async createUnsignedGovernanceTx(votingCertificates: CardanoTypes.Certificate[]) {
      const time = await this.checkServerStatus()
        .then(({serverTime}) => serverTime || Date.now())
        .catch(() => Date.now())
      const primaryTokenId = this.primaryTokenInfo.id
      const absSlotNumber = new BigNumber(getTime(time).absoluteSlot)
      const changeAddr = await this.getAddressedChangeAddress()
      const addressedUtxos = await this.getAddressedUtxos()

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
            minimumUtxoVal: MINIMUM_UTXO_VAL,
            coinsPerUtxoByte,
            poolDeposit,
            networkId: NETWORK_ID,
          },
          PRIMARY_TOKEN,
          {},
          votingCertificates,
        )

        return yoroiUnsignedTx({
          unsignedTx,
          networkConfig: NETWORK_CONFIG,
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
        .derive(PURPOSE)
        .then((key) => key.derive(COIN_TYPE))
        .then((key) => key.derive(0 + HARD_DERIVATION_START))
      const accountPrivateKeyHex = await accountPrivateKey.asBytes().then(toHex)
      const stakingPrivateKey = await accountPrivateKey
        .derive(CHIMERIC_ACCOUNT)
        .then((key) => key.derive(STAKING_KEY_INDEX))
        .then((key) => key.toRawKey())
      const stakingKeys =
        unsignedTx.staking.delegations ||
        unsignedTx.staking.registrations ||
        unsignedTx.staking.deregistrations ||
        unsignedTx.staking.withdrawals ||
        unsignedTx.governance
          ? [stakingPrivateKey]
          : undefined

      const datumDatas = unsignedTx.entries
        .map((entry) => entry.datum)
        .filter(isNonNullable)
        .filter((datum): datum is Exclude<Datum, {hash: string}> => 'data' in datum)

      if (datumDatas.length > 0) {
        const signedTx = await unsignedTx.unsignedTx.sign(
          BIP44_DERIVATION_LEVELS.ACCOUNT,
          accountPrivateKeyHex,
          new Set<string>(),
          [],
          undefined,
          datumDatas,
        )
        return yoroiSignedTx({unsignedTx, signedTx})
      }

      const signedTx = await unsignedTx.unsignedTx.sign(
        BIP44_DERIVATION_LEVELS.ACCOUNT,
        accountPrivateKeyHex,
        new Set<string>(),
        stakingKeys,
        stakingPrivateKey,
      )

      return yoroiSignedTx({unsignedTx, signedTx})
    }

    async createDelegationTx(poolId: string | undefined, delegatedAmount: BigNumber) {
      const time = await this.checkServerStatus()
        .then(({serverTime}) => serverTime || Date.now())
        .catch(() => Date.now())
      const primaryTokenId = this.primaryTokenInfo.id

      const absSlotNumber = new BigNumber(getTime(time).absoluteSlot)
      const changeAddr = await this.getAddressedChangeAddress()
      const addressedUtxos = await this.getAddressedUtxos()
      const registrationStatus = (await this.getDelegationStatus()).isRegistered
      const stakingKey = await this.getStakingKey()
      const delegationType = registrationStatus
        ? RegistrationStatus.DelegateOnly
        : RegistrationStatus.RegisterAndDelegate
      const delegatedAmountMT = {
        values: [{identifier: '', amount: delegatedAmount, networkId: NETWORK_ID}],
        defaults: PRIMARY_TOKEN,
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
        PRIMARY_TOKEN,
        {},
        {
          keyDeposit,
          linearFee,
          minimumUtxoVal: MINIMUM_UTXO_VAL,
          coinsPerUtxoByte,
          poolDeposit,
          networkId: NETWORK_ID,
        },
      )

      return yoroiUnsignedTx({unsignedTx, networkConfig: NETWORK_CONFIG, addressedUtxos, primaryTokenId})
    }

    async getFirstPaymentAddress() {
      const externalAddress = this.externalAddresses[0]
      const addr = await Cardano.Wasm.Address.fromBech32(externalAddress)
      const address = await Cardano.Wasm.BaseAddress.fromAddress(addr)
      if (!address) throw new Error('invalid wallet state')
      return address
    }

    async createVotingRegTx(pin: string, supportsCIP36: boolean) {
      const bytes = await generatePrivateKeyForCatalyst()
        .then((key) => key.toRawKey())
        .then((key) => key.asBytes())

      const primaryTokenId = this.primaryTokenInfo.id

      const catalystKeyHex = Buffer.from(bytes).toString('hex')

      try {
        const time = await this.checkServerStatus()
          .then(({serverTime}) => serverTime || Date.now())
          .catch(() => Date.now())

        const absSlotNumber = new BigNumber(getTime(time).absoluteSlot)
        const votingPublicKey = await Promise.resolve(Buffer.from(catalystKeyHex, 'hex'))
          .then((bytes) => CardanoMobile.PrivateKey.fromExtendedBytes(bytes))
          .then((key) => key.toPublic())
        const stakingPublicKey = await this.getStakingKey()
        const changeAddr = await this.getAddressedChangeAddress()

        const {coinsPerUtxoByte, keyDeposit, linearFee, poolDeposit} = await this.getProtocolParams()

        const config = {
          keyDeposit,
          linearFee,
          minimumUtxoVal: MINIMUM_UTXO_VAL,
          coinsPerUtxoByte,
          poolDeposit,
          networkId: NETWORK_ID,
        }
        const txOptions = {}
        const nonce = absSlotNumber.toNumber()

        const addressedUtxos = await this.getAddressedUtxos()

        const baseAddr = await this.getFirstPaymentAddress()

        const paymentAddressCIP36 = await baseAddr
          .toAddress()
          .then((a) => a.toBytes())
          .then((b) => Buffer.from(b).toString('hex'))

        const addressingCIP36 = this.getAddressing(await baseAddr.toAddress().then((a) => a.toBech32(undefined)))

        const unsignedTx = await Cardano.createUnsignedVotingTx(
          absSlotNumber,
          PRIMARY_TOKEN,
          votingPublicKey,
          STAKING_KEY_PATH,
          stakingPublicKey,
          addressedUtxos,
          changeAddr,
          config,
          txOptions,
          nonce,
          CHAIN_NETWORK_ID,
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
            networkConfig: NETWORK_CONFIG,
            votingRegistration,
            addressedUtxos,
            primaryTokenId,
          }),
        }
      } catch (e) {
        if (e instanceof LocalizableError || e instanceof Error) throw e
        throw new CardanoError((e as Error).message)
      }
    }

    async createWithdrawalTx(shouldDeregister: boolean): Promise<YoroiUnsignedTx> {
      const time = await this.checkServerStatus()
        .then(({serverTime}) => serverTime || Date.now())
        .catch(() => Date.now())
      const primaryTokenId = this.primaryTokenInfo.id

      const absSlotNumber = new BigNumber(getTime(time).absoluteSlot)
      const changeAddr = await this.getAddressedChangeAddress()
      const addressedUtxos = await this.getAddressedUtxos()
      const accountState = await legacyApi.getAccountState({addresses: [this.rewardAddressHex]}, BACKEND)

      const {coinsPerUtxoByte, keyDeposit, linearFee, poolDeposit} = await this.getProtocolParams()

      const withdrawalTx = await Cardano.createUnsignedWithdrawalTx(
        accountState,
        PRIMARY_TOKEN,
        absSlotNumber,
        addressedUtxos,
        [
          {
            addressing: REWARD_ADDRESS_ADDRESSING,
            rewardAddress: this.rewardAddressHex,
            shouldDeregister,
          },
        ],
        changeAddr,
        {
          linearFee,
          minimumUtxoVal: MINIMUM_UTXO_VAL,
          coinsPerUtxoByte,
          poolDeposit,
          keyDeposit,
          networkId: NETWORK_ID,
        },
        {metadata: undefined},
      )

      return yoroiUnsignedTx({unsignedTx: withdrawalTx, networkConfig: NETWORK_CONFIG, addressedUtxos, primaryTokenId})
    }

    async ledgerSupportsCIP36(useUSB: boolean): Promise<boolean> {
      if (!this.hwDeviceInfo) throw new Error('Invalid wallet state')
      return doesCardanoAppVersionSupportCIP36(await getCardanoAppMajorVersion(this.hwDeviceInfo, useUSB))
    }

    async signSwapCancellationWithLedger(cbor: string, useUSB: boolean): Promise<void> {
      if (!this.hwDeviceInfo) throw new Error('Invalid wallet state')

      const stakeVkeyHash = await this.getStakingKey().then((key) => key.hash())
      const payload = await createSwapCancellationLedgerPayload(
        cbor,
        this,
        NETWORK_ID,
        PROTOCOL_MAGIC,
        (address: string) => this.getAddressing(address),
        stakeVkeyHash,
      )

      const signedLedgerTx = await signTxWithLedger(payload, this.hwDeviceInfo, useUSB)

      const bytes = await createSignedLedgerTxFromCbor(
        CardanoMobile,
        cbor,
        signedLedgerTx.witnesses,
        PURPOSE,
        this.publicKeyHex,
      )

      const base64 = Buffer.from(bytes).toString('base64')
      await this.submitTransaction(base64)
    }

    async signTxWithLedger(unsignedTx: YoroiUnsignedTx, useUSB: boolean): Promise<YoroiSignedTx> {
      if (!this.hwDeviceInfo) throw new Error('Invalid wallet state')

      const appAdaVersion = await getCardanoAppMajorVersion(this.hwDeviceInfo, useUSB)

      if (!doesCardanoAppVersionSupportCIP36(appAdaVersion) && unsignedTx.voting.registration) {
        logger.info('ShelleyWallet: signTxWithLedger ledger app version <= 5, no CIP-36 support', {appAdaVersion})
        const ledgerPayload = await Cardano.buildVotingLedgerPayloadV5(
          unsignedTx.unsignedTx,
          CHAIN_NETWORK_ID,
          PROTOCOL_MAGIC,
          STAKING_KEY_PATH,
        )

        const signedLedgerTx = await signTxWithLedger(ledgerPayload, this.hwDeviceInfo, useUSB)

        const signedTx = await Cardano.buildLedgerSignedTx(
          unsignedTx.unsignedTx,
          signedLedgerTx,
          PURPOSE,
          this.publicKeyHex,
          false,
        )

        return yoroiSignedTx({unsignedTx, signedTx})
      }

      logger.info('ShelleyWallet: signTxWithLedger ledger app version > 5, using CIP-36', {appAdaVersion})

      const ledgerPayload = await Cardano.buildLedgerPayload(
        unsignedTx.unsignedTx,
        CHAIN_NETWORK_ID,
        PROTOCOL_MAGIC,
        STAKING_KEY_PATH,
      )

      const signedLedgerTx = await signTxWithLedger(ledgerPayload, this.hwDeviceInfo, useUSB)

      const datumDatas = unsignedTx.entries
        .map((entry) => entry.datum)
        .filter(isNonNullable)
        .filter((datum): datum is Exclude<Datum, {hash: string}> => 'data' in datum)

      const signedTx = await Cardano.buildLedgerSignedTx(
        unsignedTx.unsignedTx,
        signedLedgerTx,
        PURPOSE,
        this.publicKeyHex,
        true,
        datumDatas.length > 0 ? datumDatas : undefined,
      )

      return yoroiSignedTx({unsignedTx, signedTx})
    }

    // =================== backend API =================== //

    async checkServerStatus() {
      return legacyApi.checkServerStatus(BACKEND)
    }

    getProtocolParams() {
      return this.cardanoApi.getProtocolParams()
    }

    async submitTransaction(base64SignedTx: string) {
      await legacyApi.submitTransaction(base64SignedTx, BACKEND)
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
      return legacyApi.bulkGetAccountState([this.rewardAddressHex], BACKEND)
    }

    async fetchPoolInfo(request: PoolInfoRequest) {
      return legacyApi.getPoolInfo(request, BACKEND)
    }

    fetchTokenInfo(tokenId: string) {
      return tokenId === '' || tokenId === 'ADA'
        ? Promise.resolve(PRIMARY_TOKEN_INFO)
        : legacyApi.getTokenInfo(tokenId, `${TOKEN_INFO_SERVICE}/metadata`, BACKEND)
    }

    async fetchFundInfo(): Promise<FundInfoResponse> {
      return legacyApi.getFundInfo(BACKEND, IS_MAINNET)
    }

    async fetchTxStatus(request: TxStatusRequest): Promise<TxStatusResponse> {
      return legacyApi.fetchTxStatus(request, BACKEND)
    }

    async fetchTipStatus(): Promise<TipStatusResponse> {
      return legacyApi.getTipStatus(BACKEND)
    }

    async fetchCurrentPrice(symbol: CurrencySymbol): Promise<number> {
      return legacyApi.fetchCurrentPrice(symbol, BACKEND)
    }

    // TODO: caching
    fetchNftModerationStatus(fingerprint: string): Promise<YoroiNftModerationStatus> {
      return legacyApi.getNFTModerationStatus(fingerprint, {...BACKEND, mainnet: true})
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
          NETWORK_ID,
          memos[tx.id] ?? null,
          this.primaryToken,
        )
      })
    }

    get confirmationCounts() {
      return this.transactionManager.confirmationCounts
    }

    // ============ security & key management ============ //

    async getDecryptedRootKey(password: string) {
      return this.encryptedStorage.rootKey.read(password)
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
        this._onTxHistoryUpdateSubscriptions = this._onTxHistoryUpdateSubscriptions.filter(
          (sub) => sub !== subscription,
        )
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

    async discoverAddresses() {
      // last chunk gap limit check
      const filterFn = (addrs: Addresses) => legacyApi.filterUsedAddresses(addrs, BACKEND)
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
        return true
      }
      return false
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
        isHW: this.isHW,
        hwDeviceInfo: this.hwDeviceInfo,
        isReadOnly: this.isReadOnly,
      }
    }
  }
}

const toHex = (bytes: Uint8Array) => Buffer.from(bytes).toString('hex')

const parseWalletJSON = (data: unknown) => {
  const parsed = parseSafe(data)
  return isWalletJSON(parsed) ? parsed : undefined
}

const isWalletJSON = (data: unknown): data is WalletJSON => {
  const candidate = data as WalletJSON
  return !!candidate && typeof candidate === 'object' && keys.every((key) => key in candidate)
}

const keys: Array<keyof WalletJSON> = ['publicKeyHex', 'internalChain', 'externalChain', 'lastGeneratedAddressIndex']

const encryptAndSaveRootKey = (wallet: YoroiWallet, rootKey: string, password: string) =>
  wallet.encryptedStorage.rootKey.write(rootKey, password)
