/* eslint-disable @typescript-eslint/no-explicit-any */
import {App, Balance} from '@yoroi/types'
import {parseSafe} from '@yoroi/wallets'
import assert from 'assert'
import {BigNumber} from 'bignumber.js'
import ExtendableError from 'es6-error'
import _ from 'lodash'
import DeviceInfo from 'react-native-device-info'
import {defaultMemoize} from 'reselect'

import LocalizableError from '../../../i18n/LocalizableError'
import {HWDeviceInfo} from '../../hw'
import {Logger} from '../../logging'
import {makeMemosManager, MemosManager} from '../../memos'
import {makeWalletEncryptedStorage, WalletEncryptedStorage} from '../../storage'
import {Keychain} from '../../storage/Keychain'
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
import {StakingInfo, YoroiSignedTx, YoroiUnsignedTx} from '../../types'
import {Quantities} from '../../utils'
import {validatePassword} from '../../utils/validators'
import {WalletMeta} from '../../walletManager'
import {Cardano, CardanoMobile} from '../../wallets'
import * as api from '../api'
import {encryptWithPassword} from '../catalyst/catalystCipher'
import {generatePrivateKeyForCatalyst} from '../catalyst/catalystUtils'
import {AddressChain, AddressChainJSON, Addresses, AddressGenerator} from '../chain'
import * as MAINNET from '../constants/mainnet/constants'
import * as TESTNET from '../constants/testnet/constants'
import {CardanoError} from '../errors'
import {ADDRESS_TYPE_TO_CHANGE} from '../formatPath'
import {withMinAmounts} from '../getMinAmounts'
import {getTime} from '../getTime'
import {doesCardanoAppVersionSupportCIP36, getCardanoAppMajorVersion, signTxWithLedger} from '../hw'
import {processTxHistoryData} from '../processTransactions'
import {IsLockedError, nonblockingSynchronize, synchronize} from '../promise'
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
import {deriveRewardAddressHex, toSendTokenList} from '../utils'
import {makeUtxoManager, UtxoManager} from '../utxoManager'
import {makeKeys} from './makeKeys'

type WalletState = {
  lastGeneratedAddressIndex: number
}

export type ShelleyWalletJSON = {
  version: string

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

export const makeShelleyWallet = (constants: typeof MAINNET | typeof TESTNET) => {
  const {
    ACCOUNT_INDEX,
    API_ROOT,
    BACKEND,
    BIP44_DERIVATION_LEVELS,
    CHAIN_NETWORK_ID,
    CHIMERIC_ACCOUNT,
    COIN_TYPE,
    DISCOVERY_BLOCK_SIZE,
    DISCOVERY_GAP_SIZE,
    HARD_DERIVATION_START,
    HISTORY_REFRESH_TIME,
    IS_MAINNET,
    KEY_DEPOSIT,
    LINEAR_FEE,
    MAX_GENERATED_UNUSED,
    MINIMUM_UTXO_VAL,
    NETWORK_CONFIG,
    NETWORK_ID,
    POOL_DEPOSIT,
    PRIMARY_TOKEN,
    PRIMARY_TOKEN_INFO,
    PROTOCOL_MAGIC,
    PURPOSE,
    REWARD_ADDRESS_ADDRESSING,
    STAKING_KEY_INDEX,
    STAKING_KEY_PATH,
    TOKEN_INFO_SERVICE,
    WALLET_IMPLEMENTATION_ID,
    COINS_PER_UTXO_WORD,
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

  return class ShelleyWallet implements YoroiWallet {
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
    isEasyConfirmationEnabled = false

    private _utxos: RawUtxo[]
    private readonly storage: App.Storage
    private readonly utxoManager: UtxoManager
    private readonly transactionManager: TransactionManager
    private readonly memosManager: MemosManager

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
      const {internalChain, externalChain} = await addressChains.create({accountPubKeyHex})

      const wallet = await this.commonCreate({
        id,
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
      const {internalChain, externalChain} = await addressChains.create({accountPubKeyHex})

      return this.commonCreate({
        id,
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
      Logger.debug('openWallet::data', data)
      Logger.info('restore wallet', walletMeta.name)

      const {internalChain, externalChain} = addressChains.restore({data})

      const wallet = await this.commonCreate({
        id: walletMeta.id,
        storage,
        internalChain,
        externalChain,
        accountPubKeyHex: data.publicKeyHex ?? internalChain.publicKey, // can be null for versions < 3.0.2, in which case we can just retrieve from address generator
        hwDeviceInfo: data.hwDeviceInfo, // hw wallet
        isReadOnly: data.isReadOnly ?? false, // readonly wallet
        isEasyConfirmationEnabled: data.isEasyConfirmationEnabled,
        lastGeneratedAddressIndex: data.lastGeneratedAddressIndex ?? 0, // AddressManager
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
      isEasyConfirmationEnabled,
      lastGeneratedAddressIndex = 0,
    }: {
      accountPubKeyHex: string
      hwDeviceInfo: HWDeviceInfo | null
      id: string
      storage: App.Storage
      internalChain: AddressChain
      externalChain: AddressChain
      isReadOnly: boolean
      isEasyConfirmationEnabled: boolean
      lastGeneratedAddressIndex?: number
    }) => {
      const rewardAddressHex = await deriveRewardAddressHex(accountPubKeyHex, NETWORK_ID)
      const utxoManager = await makeUtxoManager({storage: storage.join('utxoManager/'), apiUrl: API_ROOT})
      const transactionManager = await TransactionManager.create(storage.join('txs/'))
      const memosManager = await makeMemosManager(storage.join('memos/'))

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
        isEasyConfirmationEnabled,
        lastGeneratedAddressIndex,
        transactionManager,
        memosManager,
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
      id,
      utxoManager,
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
      isEasyConfirmationEnabled: boolean
      lastGeneratedAddressIndex: number
      transactionManager: TransactionManager
      memosManager: MemosManager
    }) {
      this.id = id
      this.storage = storage
      this.utxoManager = utxoManager
      this._utxos = utxoManager.initialUtxos
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
      this.notify({type: 'initialize'})
      this.isInitialized = true
      this.isEasyConfirmationEnabled = isEasyConfirmationEnabled
      this.state = {lastGeneratedAddressIndex}
    }

    timeout: NodeJS.Timeout | null = null

    startSync() {
      Logger.info(`starting wallet: ${this.id}`)

      const backgroundSync = async () => {
        try {
          await this.tryDoFullSync()
          await this.save()
        } catch (error) {
          Logger.error((error as Error)?.message)
        }
        if (process.env.NODE_ENV !== 'test') {
          this.timeout = setTimeout(() => backgroundSync(), HISTORY_REFRESH_TIME)
        }
      }

      backgroundSync()
    }

    stopSync() {
      if (!this.timeout) return
      Logger.info(`stopping wallet: ${this.id}`)
      clearTimeout(this.timeout)
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

    async clear() {
      await this.transactionManager.clear()
      await this.utxoManager.clear()
    }

    saveMemo(txId: string, memo: string): Promise<void> {
      return this.memosManager.saveMemo(txId, memo)
    }

    // =================== persistence =================== //
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
      const result = {
        address: changeAddr,
        addressing,
      }

      return Promise.resolve(result)
    }

    private async getStakingKey() {
      const accountPubKey = await CardanoMobile.Bip32PublicKey.fromBytes(Buffer.from(this.publicKeyHex, 'hex'))
      const stakingKey = await accountPubKey
        .derive(CHIMERIC_ACCOUNT)
        .then((key) => key.derive(STAKING_KEY_INDEX))
        .then((key) => key.toRawKey())

      Logger.info(`getStakingKey: ${Buffer.from(await stakingKey.asBytes()).toString('hex')}`)
      return stakingKey
    }

    private async getRewardAddress() {
      const baseAddr = await this.getFirstPaymentAddress()
      return baseAddr.toAddress()
    }

    async getAllUtxosForKey() {
      return filterAddressesByStakingKey(
        await CardanoMobile.StakeCredential.fromKeyhash(await (await this.getStakingKey()).hash()),
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

    async createUnsignedTx(entry: YoroiEntry, auxiliaryData?: Array<CardanoTypes.TxMetadata>) {
      const time = await this.checkServerStatus()
        .then(({serverTime}) => serverTime || Date.now())
        .catch(() => Date.now())

      const absSlotNumber = new BigNumber(getTime(time).absoluteSlot)
      const changeAddr = await this.getAddressedChangeAddress()
      const addressedUtxos = await this.getAddressedUtxos()
      const amounts = await withMinAmounts(entry.amounts, this.primaryToken)

      try {
        const unsignedTx = await Cardano.createUnsignedTx(
          absSlotNumber,
          addressedUtxos,
          entry.address,
          changeAddr,
          toSendTokenList(amounts, this.primaryToken),
          {
            keyDeposit: KEY_DEPOSIT,
            linearFee: {
              coefficient: LINEAR_FEE.COEFFICIENT,
              constant: LINEAR_FEE.CONSTANT,
            },
            minimumUtxoVal: MINIMUM_UTXO_VAL,
            coinsPerUtxoWord: COINS_PER_UTXO_WORD,
            poolDeposit: POOL_DEPOSIT,
            networkId: NETWORK_ID,
          },
          PRIMARY_TOKEN,
          {metadata: auxiliaryData},
        )

        return yoroiUnsignedTx({unsignedTx, networkConfig: NETWORK_CONFIG, addressedUtxos})
      } catch (e) {
        if (e instanceof NotEnoughMoneyToSendError || e instanceof NoOutputsError) throw e
        Logger.error(`shelley::createUnsignedTx:: ${(e as Error).message}`, e)
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
        unsignedTx.staking.withdrawals
          ? [stakingPrivateKey]
          : undefined

      const signedTx = await unsignedTx.unsignedTx.sign(
        BIP44_DERIVATION_LEVELS.ACCOUNT,
        accountPrivateKeyHex,
        new Set<string>(),
        stakingKeys,
        stakingPrivateKey,
      )

      return yoroiSignedTx({
        unsignedTx,
        signedTx,
      })
    }

    async createDelegationTx(poolId: string | undefined, delegatedAmount: BigNumber) {
      const time = await this.checkServerStatus()
        .then(({serverTime}) => serverTime || Date.now())
        .catch(() => Date.now())

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
          keyDeposit: KEY_DEPOSIT,
          linearFee: {
            constant: LINEAR_FEE.CONSTANT,
            coefficient: LINEAR_FEE.COEFFICIENT,
          },
          minimumUtxoVal: MINIMUM_UTXO_VAL,
          coinsPerUtxoWord: COINS_PER_UTXO_WORD,
          poolDeposit: POOL_DEPOSIT,
          networkId: NETWORK_ID,
        },
      )

      return yoroiUnsignedTx({
        unsignedTx,
        networkConfig: NETWORK_CONFIG,
        addressedUtxos,
      })
    }

    async getFirstPaymentAddress() {
      const externalAddress = this.externalAddresses[0]
      const addr = await Cardano.Wasm.Address.fromBech32(externalAddress)
      return Cardano.Wasm.BaseAddress.fromAddress(addr)
    }

    async createVotingRegTx(pin: string, supportsCIP36: boolean) {
      Logger.debug('CardanoWallet::createVotingRegTx called')

      const bytes = await generatePrivateKeyForCatalyst()
        .then((key) => key.toRawKey())
        .then((key) => key.asBytes())

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
        const config = {
          keyDeposit: KEY_DEPOSIT,
          linearFee: {
            coefficient: LINEAR_FEE.COEFFICIENT,
            constant: LINEAR_FEE.CONSTANT,
          },
          minimumUtxoVal: MINIMUM_UTXO_VAL,
          coinsPerUtxoWord: COINS_PER_UTXO_WORD,
          poolDeposit: POOL_DEPOSIT,
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

        const addressingCIP36 = this.getAddressing(await baseAddr.toAddress().then((a) => a.toBech32()))

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

        const rewardAddress = await this.getRewardAddress().then((address) => address.toBech32())
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
          }),
        }
      } catch (e) {
        if (e instanceof LocalizableError || e instanceof ExtendableError) throw e
        Logger.error(`shelley::createVotingRegTx:: ${(e as Error).message}`, e)
        throw new CardanoError((e as Error).message)
      }
    }

    async createWithdrawalTx(shouldDeregister: boolean): Promise<YoroiUnsignedTx> {
      const time = await this.checkServerStatus()
        .then(({serverTime}) => serverTime || Date.now())
        .catch(() => Date.now())

      const absSlotNumber = new BigNumber(getTime(time).absoluteSlot)
      const changeAddr = await this.getAddressedChangeAddress()
      const addressedUtxos = await this.getAddressedUtxos()
      const accountState = await api.getAccountState({addresses: [this.rewardAddressHex]}, BACKEND)

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
          linearFee: {
            coefficient: LINEAR_FEE.COEFFICIENT,
            constant: LINEAR_FEE.CONSTANT,
          },
          minimumUtxoVal: MINIMUM_UTXO_VAL,
          coinsPerUtxoWord: COINS_PER_UTXO_WORD,
          poolDeposit: POOL_DEPOSIT,
          keyDeposit: KEY_DEPOSIT,
          networkId: NETWORK_ID,
        },
        {metadata: undefined},
      )

      return yoroiUnsignedTx({
        unsignedTx: withdrawalTx,
        networkConfig: NETWORK_CONFIG,
        addressedUtxos,
      })
    }

    async ledgerSupportsCIP36(useUSB): Promise<boolean> {
      if (!this.hwDeviceInfo) throw new Error('Invalid wallet state')
      return doesCardanoAppVersionSupportCIP36(await getCardanoAppMajorVersion(this.hwDeviceInfo, useUSB))
    }

    async signTxWithLedger(unsignedTx: YoroiUnsignedTx, useUSB: boolean): Promise<YoroiSignedTx> {
      if (!this.hwDeviceInfo) throw new Error('Invalid wallet state')

      const appAdaVersion = await getCardanoAppMajorVersion(this.hwDeviceInfo, useUSB)

      if (!doesCardanoAppVersionSupportCIP36(appAdaVersion) && unsignedTx.voting.registration) {
        Logger.info('CardanoWallet::signTxWithLedger: Ledger app version <= 5')
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

      Logger.info('CardanoWallet::signTxWithLedger: Ledger app version > 5, using CIP-36')

      const ledgerPayload = await Cardano.buildLedgerPayload(
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
        true,
      )

      return yoroiSignedTx({unsignedTx, signedTx})
    }

    // =================== backend API =================== //

    async checkServerStatus() {
      return api.checkServerStatus(BACKEND)
    }

    async submitTransaction(signedTx: string) {
      const response: any = await api.submitTransaction(signedTx, BACKEND)
      Logger.info(response)
      return response as any
    }

    private async syncUtxos() {
      const addresses = [...this.internalAddresses, ...this.externalAddresses]

      await this.utxoManager.sync(addresses)

      this._utxos = await this.utxoManager.getCachedUtxos()

      // notifying always -> sync from lib need to flag if something has changed
      this.notify({type: 'utxos', utxos: this.utxos})
    }

    async fetchAccountState(): Promise<AccountStateResponse> {
      return api.bulkGetAccountState([this.rewardAddressHex], BACKEND)
    }

    async fetchPoolInfo(request: PoolInfoRequest) {
      return api.getPoolInfo(request, BACKEND)
    }

    fetchTokenInfo(tokenId: string) {
      return tokenId === '' || tokenId === 'ADA'
        ? Promise.resolve(PRIMARY_TOKEN_INFO)
        : api.getTokenInfo(tokenId, `${TOKEN_INFO_SERVICE}/metadata`, BACKEND)
    }

    async fetchFundInfo(): Promise<FundInfoResponse> {
      return api.getFundInfo(BACKEND, IS_MAINNET)
    }

    async fetchTxStatus(request: TxStatusRequest): Promise<TxStatusResponse> {
      return api.fetchTxStatus(request, BACKEND)
    }

    async fetchTipStatus(): Promise<TipStatusResponse> {
      return api.getTipStatus(BACKEND)
    }

    async fetchCurrentPrice(symbol: CurrencySymbol): Promise<number> {
      return api.fetchCurrentPrice(symbol, BACKEND)
    }

    // TODO: caching
    fetchNftModerationStatus(fingerprint: string): Promise<YoroiNftModerationStatus> {
      return api.getNFTModerationStatus(fingerprint, {...BACKEND, mainnet: true})
    }

    private state: WalletState = {
      lastGeneratedAddressIndex: 0,
    }

    private isInitialized = false

    private _doFullSyncMutex: any = {name: 'doFullSyncMutex', lock: null}

    private subscriptions: Array<WalletSubscription> = []

    private _onTxHistoryUpdateSubscriptions: Array<(Wallet) => void> = []

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
      assert(this.isInitialized, 'doFullSync: isInitialized')

      Logger.info('Discovery done, now syncing transactions')

      await this.discoverAddresses()

      await Promise.all([this.syncUtxos(), this.transactionManager.doSync(this.getAddressesInBlocks(), BACKEND)])

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
      const filterFn = (addrs) => api.filterUsedAddresses(addrs, BACKEND)
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
      Logger.debug('Wallet::updateState', update)

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
        isEasyConfirmationEnabled: this.isEasyConfirmationEnabled,
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

const keys: Array<keyof WalletJSON> = [
  'publicKeyHex',
  'internalChain',
  'externalChain',
  'isEasyConfirmationEnabled',
  'lastGeneratedAddressIndex',
]

const encryptAndSaveRootKey = (wallet: YoroiWallet, rootKey: string, password: string) =>
  wallet.encryptedStorage.rootKey.write(rootKey, password)
