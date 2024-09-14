/* eslint-disable @typescript-eslint/no-explicit-any */
import {walletChecksum} from '@emurgo/cip4-js'
import * as CSL from '@emurgo/cross-csl-core'
import {createSignedLedgerTxFromCbor, signRawTransaction} from '@emurgo/yoroi-lib'
import {Datum} from '@emurgo/yoroi-lib/dist/internals/models'
import {AppApi} from '@yoroi/api'
import {isNonNullable} from '@yoroi/common'
import {Api, App, Balance, HW, Network, Portfolio, Wallet} from '@yoroi/types'
import assert from 'assert'
import {BigNumber} from 'bignumber.js'
import {Buffer} from 'buffer'
import {freeze} from 'immer'
import _ from 'lodash'
import {defaultMemoize} from 'reselect'
import {Observable} from 'rxjs'

import {buildPortfolioBalanceManager} from '../../features/Portfolio/common/helpers/build-balance-manager'
import {toBalanceManagerSyncArgs} from '../../features/Portfolio/common/transformers/toBalanceManagerSyncArgs'
import {makeMemosManager, MemosManager} from '../../features/Transactions/common/memos/memosManager'
import {protocolParamsPlaceholder} from '../../features/WalletManager/network-manager/network-manager'
import LocalizableError from '../../kernel/i18n/LocalizableError'
import {throwLoggedError} from '../../kernel/logger/helpers/throw-logged-error'
import {logger} from '../../kernel/logger/logger'
import {makeWalletEncryptedStorage, WalletEncryptedStorage} from '../../kernel/storage/EncryptedStorage'
import {isEmptyString} from '../../kernel/utils'
import type {
  AccountStateResponse,
  FundInfoResponse,
  PoolInfoRequest,
  RawUtxo,
  TipStatusResponse,
  Transaction,
  TxStatusRequest,
  TxStatusResponse,
  YoroiEntry,
} from '../types'
import {StakingInfo, YoroiSignedTx, YoroiUnsignedTx} from '../types'
import {Quantities} from '../utils'
import {Cardano, CardanoMobile} from '../wallets'
import {AccountManager, accountManagerMaker, Addresses} from './account-manager/account-manager'
import * as legacyApi from './api/api'
import {calcLockedDeposit} from './assetUtils'
import {createSwapCancellationLedgerPayload} from './common/signatureUtils'
import {cardanoConfig} from './constants/cardano-config'
import * as MAINNET from './constants/mainnet/constants'
import * as SANCHONET from './constants/sanchonet/constants'
import * as TESTNET from './constants/testnet/constants'
import {filterAddressesByStakingKey, getDelegationStatus} from './delegationUtils'
import {getTime} from './getTime'
import {
  doesCardanoAppVersionSupportCIP36,
  doesCardanoAppVersionSupportCIP1694,
  getCardanoAppMajorVersion,
  signTxWithLedger,
} from './hw'
import {keyManager} from './key-manager/key-manager'
import {processTxHistoryData} from './processTransactions'
import {yoroiSignedTx} from './signedTx'
import {TransactionManager} from './transactionManager'
import {toLibToken} from './transformers/to-lib-token'
import {
  CardanoTypes,
  isYoroiWallet,
  NoOutputsError,
  NotEnoughMoneyToSendError,
  RegistrationStatus,
  WalletEvent,
  WalletSubscription,
  YoroiWallet,
} from './types'
import {yoroiUnsignedTx} from './unsignedTx'
import {deriveRewardAddressHex, toRecipients} from './utils'
import {makeUtxoManager, UtxoManager} from './utxoManager'
import {utxosMaker} from './utxoManager/utxos'

export const makeCardanoWallet = (
  networkManager: Network.Manager,
  implementation: Wallet.Implementation,
  // legacy
  constants: typeof MAINNET | typeof TESTNET | typeof SANCHONET,
) => {
  const implementationConfig = cardanoConfig.implementations[implementation]

  const appApi = AppApi.appApiMaker({baseUrl: networkManager.legacyApiBaseUrl})

  // legacy
  const {PRIMARY_TOKEN} = constants

  return class CardanoWallet implements YoroiWallet {
    readonly id: string

    readonly encryptedStorage: WalletEncryptedStorage

    readonly api: App.Api = appApi

    readonly publicKeyHex: string
    readonly rewardAddressHex: string
    readonly accountManager: AccountManager
    readonly accountVisual: number
    private readonly utxoManager: UtxoManager
    private _utxos: RawUtxo[]
    private _collateralId = ''

    private readonly transactionManager: TransactionManager
    private readonly memosManager: MemosManager

    readonly balanceManager: Readonly<Portfolio.Manager.Balance>
    readonly balance$: Observable<Portfolio.Event.BalanceManager>
    readonly portfolioPrimaryTokenInfo: Readonly<Portfolio.Token.Info>
    readonly networkManager: Readonly<Network.Manager> = networkManager
    readonly isMainnet: boolean = networkManager.isMainnet

    // TODO: needs to be updated when epoch changes after conway. (query needs invalidation)
    // considering pass it through the tx-builder straigh from the network manager
    protocolParams: Api.Cardano.ProtocolParams = protocolParamsPlaceholder

    static readonly calcChecksum = walletChecksum
    static readonly implementation: Wallet.Implementation = implementation
    static readonly makeKeys = keyManager(implementation)

    // =================== create =================== //
    static readonly build = async ({
      id,
      accountPubKeyHex,
      accountVisual,
    }: {
      id: YoroiWallet['id']
      accountPubKeyHex: string
      accountVisual: number
    }) => {
      const {
        rootStorage: networkRootStorage,
        primaryTokenInfo,
        chainId,
        legacyRootStorage,
        legacyApiBaseUrl,
        tokenManager,
      } = networkManager
      const walletRootStorage = legacyRootStorage.join(`${id}/`)
      const accountStorage = walletRootStorage.join(`accounts/${accountVisual}/`)

      // TODO: revisit it should be part of staking manager (when staking is supported/desired)
      const rewardAddressHex = implementationConfig.features.staking
        ? await deriveRewardAddressHex(
            accountPubKeyHex,
            chainId,
            implementationConfig.features.staking.derivation.role,
            implementationConfig.features.staking.derivation.index,
          )
        : ''

      const utxoManager = await makeUtxoManager({
        storage: accountStorage.join('utxos/'),
        apiUrl: legacyApiBaseUrl,
      })
      const transactionManager = await TransactionManager.create(accountStorage.join('txs/'))
      // TODO: revisit memos should be per network and shouldn't be cleared on wallet clear (unless user selects it)
      const memosManager = await makeMemosManager(accountStorage.join('memos/'))
      const {balanceManager} = buildPortfolioBalanceManager({
        primaryTokenInfo,
        tokenManager,
        networkRootStorage,
      })(id)
      const accountManager = await accountManagerMaker({
        storage: accountStorage,
        accountPubKeyHex,
        chainId,
        implementation,
        baseApiUrl: legacyApiBaseUrl,
      })
      // TODO: protocolParams needs update when epoch changes, this also should trigger
      // the calculation of locked deposit, since the cost can change
      const protocolParams = await networkManager.api.protocolParams()

      const wallet = new CardanoWallet({
        id,
        accountPubKeyHex,
        rewardAddressHex,
        accountManager,
        utxoManager,
        transactionManager,
        memosManager,
        balanceManager,
        portfolioPrimaryTokenInfo: primaryTokenInfo,
        accountVisual,
        protocolParams,
      })
      if (!isYoroiWallet(wallet)) throwLoggedError('ShelleyWallet: build invalid wallet')

      wallet.isInitialized = true
      wallet.notify({type: 'initialize'})

      return wallet
    }

    private constructor({
      id,
      accountPubKeyHex,
      rewardAddressHex,
      accountVisual,

      utxoManager,
      transactionManager,
      memosManager,
      balanceManager,
      accountManager,

      portfolioPrimaryTokenInfo,
      protocolParams,
    }: {
      id: string
      accountPubKeyHex: string
      accountVisual: number
      rewardAddressHex: string

      utxoManager: UtxoManager
      transactionManager: TransactionManager
      memosManager: MemosManager
      balanceManager: Readonly<Portfolio.Manager.Balance>
      accountManager: AccountManager

      portfolioPrimaryTokenInfo: Readonly<Portfolio.Token.Info>
      protocolParams: Api.Cardano.ProtocolParams
    }) {
      this.id = id
      this.publicKeyHex = accountPubKeyHex
      this.accountVisual = accountVisual
      this.rewardAddressHex = rewardAddressHex

      this.utxoManager = utxoManager
      this._utxos = utxoManager.initialUtxos
      this._collateralId = utxoManager.initialCollateralId
      this.transactionManager = transactionManager
      this.memosManager = memosManager
      this.balanceManager = balanceManager
      this.balance$ = balanceManager.observable$
      this.accountManager = accountManager
      this.portfolioPrimaryTokenInfo = portfolioPrimaryTokenInfo

      this.protocolParams = protocolParams

      this.encryptedStorage = makeWalletEncryptedStorage(id)

      this.setupSubscriptions()
    }

    // account
    get internalChain() {
      return this.accountManager.internalChain
    }

    get externalChain() {
      return this.accountManager.externalChain
    }

    get addressesInBlocks() {
      return this.accountManager.getAddressesInBlocks(this.rewardAddressHex)
    }

    getChangeAddress(addressMode: Wallet.AddressMode): string {
      // SA mode uses only externalChain index 0
      if (addressMode === 'single') return this.externalChain.addresses[0]

      const candidateAddresses = this.internalChain.addresses
      const unseen = candidateAddresses.filter((addr) => !this.isUsedAddress(addr))
      assert(unseen.length > 0, 'Cannot find change address')
      const changeAddress = _.first(unseen)
      if (!changeAddress) throwLoggedError('CardanoWallet: getChangeAddress unable to resolve change address')
      return changeAddress
    }

    private getAddressedChangeAddress(addressMode: Wallet.AddressMode): {
      address: string
      addressing: CardanoTypes.Addressing
    } {
      const changeAddr = this.getChangeAddress(addressMode)
      const addressing = this.getAddressing(changeAddr)
      const result = {
        address: changeAddr,
        addressing,
      }

      return result
    }

    // -- account -- legacy
    generateNewReceiveAddress() {
      const {canIncrease} = this.receiveAddressInfo
      if (!canIncrease) return false
      this.externalChain.increaseVisualIndex()
      this.accountManager.save()

      this.notify({type: 'addresses', addresses: this.receiveAddresses})

      return true
    }

    getAddressing(address: string) {
      const startLevel = cardanoConfig.derivation.keyLevel.purpose

      if (this.internalChain.isMyAddress(address)) {
        const path = [
          implementationConfig.derivations.base.harden.purpose,
          implementationConfig.derivations.base.harden.coinType,
          this.accountVisual + cardanoConfig.derivation.hardStart,
          implementationConfig.derivations.base.roles.internal,
          this.internalChain.getIndexOfAddress(address),
        ]
        return {
          path,
          startLevel,
        }
      }

      if (this.externalChain.isMyAddress(address)) {
        const path = [
          implementationConfig.derivations.base.harden.purpose,
          implementationConfig.derivations.base.harden.coinType,
          this.accountVisual + cardanoConfig.derivation.hardStart,
          implementationConfig.derivations.base.roles.external,
          this.externalChain.getIndexOfAddress(address),
        ]
        return {
          path,
          startLevel,
        }
      }

      throwLoggedError(`ShelleyWallet: getAddressing missing address info for: ${address} `)
    }

    async getFirstPaymentAddress() {
      const externalAddress = this.externalAddresses[0]
      const addr = await Cardano.Wasm.Address.fromBech32(externalAddress)
      const address = await Cardano.Wasm.BaseAddress.fromAddress(addr)
      if (!address) throwLoggedError('ShelleyWallet: getFirstPaymentAddress invalid address')
      return address
    }

    get receiveAddresses(): Addresses {
      return this.externalAddresses
    }

    get receiveAddressInfo() {
      return this.externalChain.info
    }
    // end of account

    // staking
    public async getStakingKey() {
      if (implementationConfig.features.staking) {
        const derivation = implementationConfig.features.staking.derivation

        const accountPubKey = await CardanoMobile.Bip32PublicKey.fromBytes(Buffer.from(this.publicKeyHex, 'hex'))
        const stakingKey = await accountPubKey
          .derive(derivation.role)
          .then((key) => key.derive(derivation.index))
          .then((key) => key.toRawKey())

        return stakingKey
      }

      throwLoggedError('getStakingKey staking not supported')
    }

    private async getRewardAddress() {
      if (implementationConfig.features.staking) {
        const baseAddr = await this.getFirstPaymentAddress()
        if (!baseAddr) throwLoggedError('getRewardAddress invalid address')
        return baseAddr.toAddress()
      }

      throwLoggedError('getRewardAddress staking not supported')
    }

    async createDelegationTx({
      poolId,
      delegatedAmount,
      addressMode,
    }: {
      poolId: string | undefined
      delegatedAmount: BigNumber
      addressMode: Wallet.AddressMode
    }) {
      if (implementationConfig.features.staking) {
        const time = await this.checkServerStatus()
          .then(({serverTime}) => serverTime || Date.now())
          .catch(() => Date.now())
        const primaryTokenId = this.portfolioPrimaryTokenInfo.id

        const absSlotNumber = new BigNumber(getTime(time).absoluteSlot)
        const changeAddr = this.getAddressedChangeAddress(addressMode)
        const addressedUtxos = await this.getAddressedUtxos()
        const registrationStatus = this.getDelegationStatus().isRegistered
        const stakingKey = await this.getStakingKey()
        const delegationType = registrationStatus
          ? RegistrationStatus.DelegateOnly
          : RegistrationStatus.RegisterAndDelegate
        const delegatedAmountMT = {
          values: [
            {
              identifier: this.portfolioPrimaryTokenInfo.id,
              amount: delegatedAmount,
              networkId: this.networkManager.chainId,
            },
          ],
          defaults: toLibToken(this.portfolioPrimaryTokenInfo),
        }

        const {coinsPerUtxoByte, keyDeposit, linearFee, poolDeposit} = this.protocolParams

        const unsignedTx = await Cardano.createUnsignedDelegationTx(
          absSlotNumber,
          addressedUtxos,
          stakingKey,
          delegationType,
          poolId || null, // empty pool means deregistration
          changeAddr,
          delegatedAmountMT,
          toLibToken(this.portfolioPrimaryTokenInfo),
          {},
          {
            keyDeposit,
            linearFee,
            minimumUtxoVal: cardanoConfig.params.minUtxoValue.toString(),
            coinsPerUtxoByte,
            poolDeposit,
            networkId: this.networkManager.chainId,
          },
        )

        return yoroiUnsignedTx({unsignedTx, networkManager, addressedUtxos, primaryTokenId, keyDeposit})
      }

      throwLoggedError('createDelegationTx staking not supported')
    }

    async createVotingRegTx({
      supportsCIP36,
      addressMode,
      catalystKeyHex,
    }: {
      pin: string
      supportsCIP36: boolean
      addressMode: Wallet.AddressMode
      catalystKeyHex: string
    }) {
      if (implementationConfig.features.staking) {
        const primaryTokenId = this.portfolioPrimaryTokenInfo.id

        try {
          const time = await this.checkServerStatus()
            .then(({serverTime}) => serverTime || Date.now())
            .catch(() => Date.now())

          const absSlotNumber = new BigNumber(getTime(time).absoluteSlot)
          const votingPublicKey = await Promise.resolve(Buffer.from(catalystKeyHex, 'hex'))
            .then((bytes) => CardanoMobile.PrivateKey.fromExtendedBytes(bytes))
            .then((key) => key.toPublic())
          const stakingPublicKey = await this.getStakingKey()
          const changeAddr = this.getAddressedChangeAddress(addressMode)

          const {coinsPerUtxoByte, keyDeposit, linearFee, poolDeposit} = this.protocolParams

          const config = {
            keyDeposit,
            linearFee,
            minimumUtxoVal: cardanoConfig.params.minUtxoValue.toString(),
            coinsPerUtxoByte,
            poolDeposit,
            networkId: this.networkManager.chainId,
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
            Array.from(implementationConfig.features.staking.addressing),
            stakingPublicKey,
            addressedUtxos,
            changeAddr,
            config,
            txOptions,
            nonce,
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

          return {
            votingRegTx: await yoroiUnsignedTx({
              unsignedTx,
              networkManager: this.networkManager,
              votingRegistration,
              addressedUtxos,
              primaryTokenId,
              keyDeposit,
            }),
          }
        } catch (e) {
          if (e instanceof LocalizableError || e instanceof Error) throw e
          throw new App.Errors.LibraryError((e as Error).message)
        }
      }

      throwLoggedError('createVotingRegTx staking not supported')
    }

    async createWithdrawalTx({
      shouldDeregister,
      addressMode,
    }: {
      shouldDeregister: boolean
      addressMode: Wallet.AddressMode
    }): Promise<YoroiUnsignedTx> {
      if (implementationConfig.features.staking) {
        const time = await this.checkServerStatus()
          .then(({serverTime}) => serverTime || Date.now())
          .catch(() => Date.now())
        const primaryTokenId = this.portfolioPrimaryTokenInfo.id

        const absSlotNumber = new BigNumber(getTime(time).absoluteSlot)
        const changeAddr = this.getAddressedChangeAddress(addressMode)
        const addressedUtxos = await this.getAddressedUtxos()
        const accountState = await legacyApi.getAccountState(
          {addresses: [this.rewardAddressHex]},
          networkManager.legacyApiBaseUrl,
        )

        const {coinsPerUtxoByte, keyDeposit, linearFee, poolDeposit} = this.protocolParams

        const withdrawalTx = await Cardano.createUnsignedWithdrawalTx(
          accountState,
          PRIMARY_TOKEN,
          absSlotNumber,
          addressedUtxos,
          [
            {
              addressing: {
                path: Array.from(implementationConfig.features.staking.addressing),
                startLevel: cardanoConfig.derivation.keyLevel.purpose,
              },
              rewardAddress: this.rewardAddressHex,
              shouldDeregister,
            },
          ],
          changeAddr,
          {
            linearFee,
            minimumUtxoVal: cardanoConfig.params.minUtxoValue.toString(),
            coinsPerUtxoByte,
            poolDeposit,
            keyDeposit,
            networkId: this.networkManager.chainId,
          },
          {metadata: undefined},
        )

        return yoroiUnsignedTx({
          unsignedTx: withdrawalTx,
          networkManager: this.networkManager,
          addressedUtxos,
          primaryTokenId,
          keyDeposit,
        })
      }

      throwLoggedError('createWithdrawalTx staking not supported')
    }

    async createUnsignedGovernanceTx({
      votingCertificates,
      addressMode,
    }: {
      votingCertificates: CardanoTypes.Certificate[]
      addressMode: Wallet.AddressMode
    }) {
      const time = await this.checkServerStatus()
        .then(({serverTime}) => serverTime || Date.now())
        .catch(() => Date.now())
      const primaryTokenId = this.portfolioPrimaryTokenInfo.id
      const absSlotNumber = new BigNumber(getTime(time).absoluteSlot)
      const changeAddr = this.getAddressedChangeAddress(addressMode)
      const addressedUtxos = await this.getAddressedUtxos()

      const {coinsPerUtxoByte, keyDeposit, linearFee, poolDeposit} = this.protocolParams

      try {
        const unsignedTx = await Cardano.createUnsignedTx(
          absSlotNumber,
          addressedUtxos,
          [],
          changeAddr,
          {
            keyDeposit,
            linearFee,
            minimumUtxoVal: cardanoConfig.params.minUtxoValue.toString(),
            coinsPerUtxoByte,
            poolDeposit,
            networkId: this.networkManager.chainId,
          },
          toLibToken(this.portfolioPrimaryTokenInfo),
          {},
          votingCertificates,
        )

        return yoroiUnsignedTx({
          unsignedTx,
          networkManager: this.networkManager,
          addressedUtxos,
          entries: [],
          governance: true,
          primaryTokenId,
          keyDeposit,
        })
      } catch (e) {
        if (e instanceof NotEnoughMoneyToSendError || e instanceof NoOutputsError) throw e
        throw new App.Errors.LibraryError((e as Error).message)
      }
    }

    async getAllUtxosForKey() {
      if (implementationConfig.features.staking) {
        return filterAddressesByStakingKey(
          await CardanoMobile.Credential.fromKeyhash(await (await this.getStakingKey()).hash()),
          await this.getAddressedUtxos(),
          false,
        )
      }
      throwLoggedError('getAllUtxosForKey staking not supported')
    }

    getDelegationStatus() {
      if (implementationConfig.features.staking) {
        const certsForKey = this.transactionManager.perRewardAddressCertificates[this.rewardAddressHex]
        return getDelegationStatus(this.rewardAddressHex, certsForKey)
      }

      throwLoggedError('getDelegationStatus staking not supported')
    }

    async getStakingInfo(): Promise<StakingInfo> {
      if (implementationConfig.features.staking) {
        const stakingStatus = this.getDelegationStatus()
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

      throwLoggedError('getStakingInfo staking not supported')
    }
    // end of staking

    // portfolio
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

    async clear() {
      // TODO: missing accounts clear (it wasnt reseting it before, so 🤷‍♂️)
      this.balanceManager.clear()
      await this.transactionManager.clear()
      this.transactionManager.resetState()
      await this.utxoManager.clear()
    }

    saveMemo(txId: string, memo: string): Promise<void> {
      return this.memosManager.saveMemo(txId, memo)
    }

    // sync
    async sync({isForced = false}: {isForced?: boolean} = {}) {
      if (!this.isInitialized) {
        logger.error('ShelleyWallet: sync wallet not initialized', {id: this.id})
        return Promise.resolve()
      }

      await this.accountManager.discoverAddresses()

      await Promise.all([
        this.syncUtxos({isForced}),
        this.transactionManager.doSync(this.addressesInBlocks, networkManager.legacyApiBaseUrl),
      ])
    }

    async resync() {
      await this.clear()
      return this.sync()
    }
    // end sync

    public async signRawTx(txHex: string, pKeys: CSL.PrivateKey[]) {
      return signRawTransaction(CardanoMobile, txHex, pKeys)
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

    async createUnsignedTx({
      entries,
      addressMode,
      metadata,
    }: {
      entries: YoroiEntry[]
      addressMode: Wallet.AddressMode
      metadata?: Array<CardanoTypes.TxMetadata>
    }) {
      const time = await this.checkServerStatus()
        .then(({serverTime}) => serverTime || Date.now())
        .catch(() => Date.now())
      const primaryTokenId = this.portfolioPrimaryTokenInfo.id
      const absSlotNumber = new BigNumber(getTime(time).absoluteSlot)
      const changeAddr = this.getAddressedChangeAddress(addressMode)
      const addressedUtxos = await this.getAddressedUtxos()

      const recipients = await toRecipients(entries, this.portfolioPrimaryTokenInfo)

      const containsDatum = recipients.some((recipient) => recipient.datum)

      const {
        coinsPerUtxoByte,
        keyDeposit,
        linearFee: {coefficient, constant},
        poolDeposit,
      } = this.protocolParams

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
            minimumUtxoVal: cardanoConfig.params.minUtxoValue.toString(),
            coinsPerUtxoByte,
            poolDeposit,
            networkId: this.networkManager.chainId,
          },
          toLibToken(this.portfolioPrimaryTokenInfo),
          {metadata},
        )

        return yoroiUnsignedTx({
          unsignedTx,
          networkManager: this.networkManager,
          addressedUtxos,
          entries,
          primaryTokenId,
          keyDeposit,
        })
      } catch (e) {
        if (e instanceof NotEnoughMoneyToSendError || e instanceof NoOutputsError) throw e
        throwLoggedError(new App.Errors.LibraryError((e as Error).message))
      }
    }

    async signTx(unsignedTx: YoroiUnsignedTx, decryptedMasterKey: string) {
      const masterKey = await CardanoMobile.Bip32PrivateKey.fromBytes(Buffer.from(decryptedMasterKey, 'hex'))
      const accountPrivateKey = await masterKey
        .derive(implementationConfig.derivations.base.harden.purpose)
        .then((key) => key.derive(implementationConfig.derivations.base.harden.coinType))
        .then((key) => key.derive(this.accountVisual + cardanoConfig.derivation.hardStart))
      const accountPrivateKeyHex = await accountPrivateKey.asBytes().then(toHex)

      let stakingPrivateKey
      if (implementationConfig.features.staking) {
        const derivation = implementationConfig.features.staking.derivation
        stakingPrivateKey = await accountPrivateKey
          .derive(derivation.role)
          .then((key) => key.derive(derivation.index))
          .then((key) => key.toRawKey())
      }

      const needsStakingKey =
        isNonEmpty(unsignedTx.staking.delegations) ||
        isNonEmpty(unsignedTx.staking.registrations) ||
        isNonEmpty(unsignedTx.staking.deregistrations) ||
        isNonEmpty(unsignedTx.staking.withdrawals) ||
        unsignedTx.governance

      if (needsStakingKey && !stakingPrivateKey) {
        throwLoggedError('CardanoWallet: signTx required staking key but not supported')
      }

      const stakingKeys = needsStakingKey && stakingPrivateKey ? [stakingPrivateKey] : undefined

      const datumDatas = unsignedTx.entries
        .map((entry) => entry.datum)
        .filter(isNonNullable)
        .filter((datum): datum is Exclude<Datum, {hash: string}> => 'data' in datum)

      if (datumDatas.length > 0) {
        const signedTx = await unsignedTx.unsignedTx.sign(
          cardanoConfig.derivation.keyLevel.account,
          accountPrivateKeyHex,
          new Set<string>(),
          [],
          undefined,
          datumDatas,
        )

        return yoroiSignedTx({unsignedTx, signedTx})
      }

      const signedTx = await unsignedTx.unsignedTx.sign(
        cardanoConfig.derivation.keyLevel.account,
        accountPrivateKeyHex,
        new Set<string>(),
        stakingKeys,
        stakingPrivateKey,
      )

      return yoroiSignedTx({unsignedTx, signedTx})
    }

    async ledgerSupportsCIP36(useUSB: boolean, hwDeviceInfo: HW.DeviceInfo): Promise<boolean> {
      if (!hwDeviceInfo) throw new Error('Invalid wallet state')
      return doesCardanoAppVersionSupportCIP36(await getCardanoAppMajorVersion(hwDeviceInfo, useUSB))
    }

    async ledgerSupportsCIP1694(useUSB: boolean, hwDeviceInfo: HW.DeviceInfo): Promise<boolean> {
      if (!hwDeviceInfo) throw new Error('Invalid wallet state')
      return doesCardanoAppVersionSupportCIP1694(await getCardanoAppMajorVersion(hwDeviceInfo, useUSB))
    }

    async signSwapCancellationWithLedger(cbor: string, useUSB: boolean, hwDeviceInfo: HW.DeviceInfo): Promise<void> {
      const stakeVkeyHash = await this.getStakingKey().then((key) => key.hash())
      const payload = await createSwapCancellationLedgerPayload(
        cbor,
        this,
        this.networkManager.chainId,
        this.networkManager.protocolMagic,
        (address: string) => this.getAddressing(address),
        stakeVkeyHash,
      )

      const signedLedgerTx = await signTxWithLedger(payload, hwDeviceInfo, useUSB)

      const bytes = await createSignedLedgerTxFromCbor(
        CardanoMobile,
        cbor,
        signedLedgerTx.witnesses,
        implementationConfig.derivations.base.harden.purpose,
        this.publicKeyHex,
      )

      const base64 = Buffer.from(bytes).toString('base64')
      await this.submitTransaction(base64)
    }

    async signTxWithLedger(
      unsignedTx: YoroiUnsignedTx,
      useUSB: boolean,
      hwDeviceInfo: HW.DeviceInfo,
    ): Promise<YoroiSignedTx> {
      const appAdaVersion = await getCardanoAppMajorVersion(hwDeviceInfo, useUSB)

      if (!doesCardanoAppVersionSupportCIP36(appAdaVersion) && unsignedTx.voting.registration) {
        if (implementationConfig.features.staking) {
          logger.info('ShelleyWallet: signTxWithLedger ledger app version <= 5, no CIP-36 support', {appAdaVersion})
          const ledgerPayload = await Cardano.buildVotingLedgerPayloadV5(
            unsignedTx.unsignedTx,
            this.networkManager.chainId,
            this.networkManager.protocolMagic,
            Array.from(implementationConfig.features.staking.addressing),
          )

          const signedLedgerTx = await signTxWithLedger(ledgerPayload, hwDeviceInfo, useUSB)

          const signedTx = await Cardano.buildLedgerSignedTx(
            unsignedTx.unsignedTx,
            signedLedgerTx,
            implementationConfig.derivations.base.harden.purpose,
            this.publicKeyHex,
            false,
          )

          return yoroiSignedTx({unsignedTx, signedTx})
        }

        throwLoggedError('signTxWithLedger voting registration staking not supported')
      }

      logger.info('ShelleyWallet: signTxWithLedger ledger app version > 5, using CIP-36', {appAdaVersion})

      let stakingAddressing
      if (implementationConfig.features.staking) {
        stakingAddressing = Array.from(implementationConfig.features.staking.addressing)
      }
      const ledgerPayload = await Cardano.buildLedgerPayload(
        unsignedTx.unsignedTx,
        this.networkManager.chainId,
        this.networkManager.protocolMagic,
        stakingAddressing,
      )

      const signedLedgerTx = await signTxWithLedger(ledgerPayload, hwDeviceInfo, useUSB)

      const datumDatas = unsignedTx.entries
        .map((entry) => entry.datum)
        .filter(isNonNullable)
        .filter((datum): datum is Exclude<Datum, {hash: string}> => 'data' in datum)

      const signedTx = await Cardano.buildLedgerSignedTx(
        unsignedTx.unsignedTx,
        signedLedgerTx,
        implementationConfig.derivations.base.harden.purpose,
        this.publicKeyHex,
        true,
        datumDatas.length > 0 ? datumDatas : undefined,
      )

      return yoroiSignedTx({unsignedTx, signedTx})
    }

    // =================== backend API =================== //

    async checkServerStatus() {
      return legacyApi.checkServerStatus(networkManager.legacyApiBaseUrl)
    }

    async submitTransaction(base64SignedTx: string) {
      await legacyApi.submitTransaction(base64SignedTx, networkManager.legacyApiBaseUrl)
    }

    private async syncUtxos({isForced = false}: {isForced?: boolean} = {}) {
      const addresses = [...this.internalAddresses, ...this.externalAddresses]

      await this.utxoManager.sync(addresses)
      const newUtxos = await this.utxoManager.getCachedUtxos()

      // NOTE: wallet is not aware of utxos state
      // if it crashes, the utxo manager will be out of sync with wallet
      if (this.didUtxosUpdate(this._utxos, newUtxos) || isForced) {
        // NOTE: recalc locked deposit should happen also when epoch changes after conway
        const lockedAsStorageCost = await calcLockedDeposit({
          rawUtxos: newUtxos,
          coinsPerUtxoByteStr: this.protocolParams.coinsPerUtxoByte,
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
      const quantity =
        collateralUtxo?.amount !== undefined && !isEmptyString(collateralUtxo.amount)
          ? BigInt(collateralUtxo?.amount)
          : 0n
      const collateralTxId = collateralId ? collateralId.split(':')[0] : null
      const isConfirmed = !!collateralTxId && Object.values(this.transactions).some((tx) => tx.id === collateralTxId)

      return freeze({
        utxo: collateralUtxo,
        amount: {quantity, info: this.portfolioPrimaryTokenInfo},
        collateralId,
        isConfirmed,
      })
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
      return legacyApi.bulkGetAccountState([this.rewardAddressHex], networkManager.legacyApiBaseUrl)
    }

    async fetchPoolInfo(request: PoolInfoRequest) {
      return legacyApi.getPoolInfo(request, networkManager.legacyApiBaseUrl)
    }

    async fetchFundInfo(): Promise<FundInfoResponse> {
      return legacyApi.getFundInfo(networkManager.legacyApiBaseUrl, this.isMainnet)
    }

    async fetchTxStatus(request: TxStatusRequest): Promise<TxStatusResponse> {
      return legacyApi.fetchTxStatus(request, networkManager.legacyApiBaseUrl)
    }

    async fetchTipStatus(): Promise<TipStatusResponse> {
      return legacyApi.getTipStatus(networkManager.legacyApiBaseUrl)
    }

    private isInitialized = false

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

    get transactions() {
      const memos = this.memosManager.getMemos()
      return _.mapValues(this.transactionManager.transactions, (tx: Transaction) => {
        return processTxHistoryData(
          tx,
          this.rewardAddressHex != ''
            ? [...this.internalAddresses, ...this.externalAddresses, ...[this.rewardAddressHex]]
            : [...this.internalAddresses, ...this.externalAddresses],
          this.confirmationCounts[tx.id] || 0,
          memos[tx.id] ?? null,
          this.portfolioPrimaryTokenInfo,
        )
      })
    }

    get confirmationCounts() {
      return this.transactionManager.confirmationCounts
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

    private isUsedAddress(address: string) {
      const perAddressTxs = this.transactionManager.perAddressTxs
      return !!perAddressTxs[address] && perAddressTxs[address].length > 0
    }
  }
}

const toHex = (bytes: Uint8Array) => Buffer.from(bytes).toString('hex')

const isNonEmpty = (arr: unknown[] | undefined) => {
  return arr && arr.length > 0
}
