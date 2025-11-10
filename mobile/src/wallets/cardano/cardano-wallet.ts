import {AppApi} from '@yoroi/api'
import {
  cardanoConfig,
  derivationConfig,
  protocolParamsPlaceholder,
} from '@yoroi/blockchains'
import {isNonNullable} from '@yoroi/common'
import type {CardanoHaskellConfig, Datum, ModernUtxo} from '@yoroi/tx'
import {
  TransactionBuilder,
  adaptUnsignedTransaction,
  buildLedgerPayload,
  buildLedgerSignedTx,
  buildVotingLedgerPayloadV5,
  createCIP15VotingMetadata,
  createCIP36VotingMetadata,
  createSignedLedgerTxFromCbor,
  createStakeDelegationCertificate,
  createStakeDeregistrationCertificate,
  createStakeRegistrationCertificate,
  modernUtxosToCardanoAddressedUtxos,
  rawUtxoToModernUtxo,
  signRawTransaction,
} from '@yoroi/tx'
import {Api, App, Balance, HW, Network, Portfolio, Wallet} from '@yoroi/types'

import {walletChecksum} from '@emurgo/cip4-js'
import * as CSL from '@emurgo/cross-csl-core'
import {BigNumber} from 'bignumber.js'
import {Buffer} from 'buffer'
import {freeze} from 'immer'
import {defaultMemoize} from 'reselect'
import {Observable} from 'rxjs'

import {toLedgerSignRequest} from '~/features/Discover/common/ledger'
import {buildPortfolioBalanceManager} from '~/features/Portfolio/common/helpers/build-balance-manager'
import {toBalanceManagerSyncArgs} from '~/features/Portfolio/common/transformers/toBalanceManagerSyncArgs'
import {
  MemosManager,
  makeMemosManager,
} from '~/features/Transactions/common/memos/memosManager'
import {LocalizableError} from '~/kernel/i18n/LocalizableError'
import {throwLoggedError} from '~/kernel/logger/helpers/throw-logged-error'
import {logger} from '~/kernel/logger/logger'
import {
  WalletEncryptedStorage,
  makeWalletEncryptedStorage,
} from '~/kernel/storage/EncryptedStorage'

import type {
  AccountStateResponse,
  FundInfoResponse,
  PoolInfoRequest,
  RawUtxo,
  TxStatusRequest,
  TxStatusResponse,
} from '../types/other'
import {StakingInfo} from '../types/staking'
import {YoroiEntry, YoroiSignedTx, YoroiUnsignedTx} from '../types/yoroi'
import {Quantities} from '../utils/utils'
import {CardanoMobile} from '../wallets'
import {
  AccountManager,
  Addresses,
  accountManagerMaker,
} from './account-manager/account-manager'
import * as legacyApi from './api/api'
import {calcLockedDeposit} from './assetUtils'
import {
  filterAddressesByStakingKey,
  getDelegationStatus,
} from './delegationUtils'
import {
  doesCardanoAppVersionSupportCIP36,
  doesCardanoAppVersionSupportCIP1694,
  getCardanoAppMajorVersion,
  signTxWithLedger,
} from './hw/hw'
import {keyManager} from './key-manager/key-manager'
import {processTxHistoryData} from './processTransactions/processTransactions'
import {yoroiSignedTx} from './signedTx'
import {TransactionManager} from './transactionManager/transactionManager'
import {toLibToken} from './transformers/to-lib-token'
import {
  CardanoTypes,
  NoOutputsError,
  NotEnoughMoneyToSendError,
  RegistrationStatus,
  WalletEvent,
  WalletSubscription,
  YoroiWallet,
  isYoroiWallet,
} from './types'
import {yoroiUnsignedTx} from './unsignedTx/unsignedTx'
import {
  deriveRewardAddressHex,
  getAddressedUtxos,
  getHexAddressingMap,
} from './utils'
import {UtxoManager, makeUtxoManager} from './utxoManager/utxoManager'
import {utxosMaker} from './utxoManager/utxos'

export const makeCardanoWallet = (
  networkManager: Network.Manager,
  implementation: Wallet.Implementation,
) => {
  const implementationConfig = cardanoConfig.implementations[implementation]

  const appApi = AppApi.appApiMaker({baseUrl: networkManager.legacyApiBaseUrl})

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
      const accountStorage = walletRootStorage.join(
        `accounts/${accountVisual}/`,
      )

      // TODO: revisit it should be part of staking manager (when staking is supported/desired)
      const rewardAddressHex = implementationConfig.features.staking
        ? deriveRewardAddressHex(
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

      const transactionManager = await TransactionManager.create(
        accountStorage.join('txs/'),
      )
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
      if (!isYoroiWallet(wallet))
        throwLoggedError('ShelleyWallet: build invalid wallet')

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
      const externalAddress = this.externalChain.addresses[0]
      if (!externalAddress)
        throw new App.Errors.InvalidState('No External Address')

      // SA mode uses only externalChain index 0
      if (addressMode === 'single') return externalAddress

      const candidateAddresses = this.internalChain.addresses
      const unseen = candidateAddresses.filter(
        (addr) => !this.isUsedAddress(addr),
      )
      const [changeAddress] = unseen
      if (!changeAddress)
        throwLoggedError(
          'CardanoWallet: getChangeAddress unable to resolve change address',
        )
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
      const startLevel = derivationConfig.keyLevel.purpose

      if (this.internalChain.isMyAddress(address)) {
        const path = [
          implementationConfig.derivations.base.harden.purpose,
          implementationConfig.derivations.base.harden.coinType,
          this.accountVisual + derivationConfig.hardStart,
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
          this.accountVisual + derivationConfig.hardStart,
          implementationConfig.derivations.base.roles.external,
          this.externalChain.getIndexOfAddress(address),
        ]
        return {
          path,
          startLevel,
        }
      }

      throwLoggedError(
        `ShelleyWallet: getAddressing missing address info for: ${address} `,
      )
    }

    getFirstPaymentAddress() {
      const externalAddress = this.externalAddresses[0]
      if (!externalAddress)
        throw new App.Errors.InvalidState('No External Address')
      const addr = CardanoMobile.Address.fromBech32(externalAddress)
      const address = CardanoMobile.BaseAddress.fromAddress(addr)
      if (!address)
        throwLoggedError(
          'ShelleyWallet: getFirstPaymentAddress invalid address',
        )
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
    public getStakingKey() {
      if (implementationConfig.features.staking) {
        const derivation = implementationConfig.features.staking.derivation

        const accountPubKey = CardanoMobile.Bip32PublicKey.fromBytes(
          new Uint8Array(Buffer.from(this.publicKeyHex, 'hex')),
        )
        const stakingKey = accountPubKey
          .derive(derivation.role)
          .derive(derivation.index)
          .toRawKey()

        return stakingKey
      }

      throwLoggedError('getStakingKey staking not supported')
    }

    private getRewardAddress() {
      if (implementationConfig.features.staking) {
        const baseAddr = this.getFirstPaymentAddress()
        if (!baseAddr) throwLoggedError('getRewardAddress invalid address')
        return baseAddr.toAddress()
      }

      throwLoggedError('getRewardAddress staking not supported')
    }

    async createDelegationTx({
      poolId,
      delegatedAmount: _delegatedAmount,
      addressMode,
    }: {
      poolId: string | undefined
      delegatedAmount: BigNumber
      addressMode: Wallet.AddressMode
    }) {
      if (implementationConfig.features.staking) {
        const primaryTokenId = this.portfolioPrimaryTokenInfo.id

        const absSlotNumber = await this.getAbsoluteSlotNumber()
        const changeAddr = this.getAddressedChangeAddress(addressMode)
        const modernUtxos = this.getAddressedUtxos()
        const addressedUtxos = modernUtxosToCardanoAddressedUtxos(modernUtxos)
        const registrationStatus = this.getDelegationStatus().isRegistered
        const stakingKey = this.getStakingKey()
        const delegationType = registrationStatus
          ? RegistrationStatus.DelegateOnly
          : RegistrationStatus.RegisterAndDelegate
        const {coinsPerUtxoByte, keyDeposit, linearFee, poolDeposit} =
          this.protocolParams

        const protocolParams: CardanoHaskellConfig = {
          keyDeposit,
          linearFee,
          minimumUtxoVal: cardanoConfig.params.minUtxoValue.toString(),
          coinsPerUtxoByte,
          poolDeposit,
          networkId: this.networkManager.chainId,
        }

        // Build transaction using TransactionBuilder
        const builder = new TransactionBuilder()

        // Add all UTXOs as inputs
        for (const utxo of modernUtxos) {
          builder.addInput(utxo)
        }

        // Add certificates based on delegation type
        if (delegationType === RegistrationStatus.RegisterAndDelegate) {
          // Register staking key first
          const regCert = createStakeRegistrationCertificate(
            CardanoMobile,
            stakingKey,
          )
          builder.addCertificate(regCert)
        }

        if (poolId) {
          // Delegate to pool
          const delegCert = createStakeDelegationCertificate(
            CardanoMobile,
            stakingKey,
            poolId,
          )
          builder.addCertificate(delegCert)
        } else {
          // Deregister (no pool means deregistration)
          const deregCert = createStakeDeregistrationCertificate(
            CardanoMobile,
            stakingKey,
          )
          builder.addCertificate(deregCert)
        }

        // Set change address
        builder.setChangeAddress(changeAddr.address)

        // Set TTL
        builder.setTTL(absSlotNumber.toNumber())

        // Set protocol parameters
        builder.setProtocolParams(protocolParams)

        // Build the transaction
        const unsignedTx = await builder.build(
          CardanoMobile,
          protocolParams,
          primaryTokenId,
        )

        // Convert to legacy format for yoroiUnsignedTx
        const legacyUnsignedTx = await adaptUnsignedTransaction(
          CardanoMobile,
          unsignedTx,
          toLibToken(this.portfolioPrimaryTokenInfo),
        )

        return yoroiUnsignedTx({
          unsignedTx: legacyUnsignedTx as unknown as CardanoTypes.UnsignedTx,
          networkManager: this.networkManager,
          addressedUtxos,
          primaryTokenId,
          keyDeposit,
        })
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
          const absSlotNumber = await this.getAbsoluteSlotNumber()
          const votingPublicKey = CardanoMobile.PrivateKey.fromExtendedBytes(
            new Uint8Array(Buffer.from(catalystKeyHex, 'hex')),
          ).toPublic()
          const stakingPublicKey = this.getStakingKey()
          const changeAddr = this.getAddressedChangeAddress(addressMode)

          const {coinsPerUtxoByte, keyDeposit, linearFee, poolDeposit} =
            this.protocolParams

          const protocolParams: CardanoHaskellConfig = {
            keyDeposit,
            linearFee,
            minimumUtxoVal: cardanoConfig.params.minUtxoValue.toString(),
            coinsPerUtxoByte,
            poolDeposit,
            networkId: this.networkManager.chainId,
          }

          const nonce = absSlotNumber.toNumber()

          const modernUtxos = this.getAddressedUtxos()
          const addressedUtxos = modernUtxosToCardanoAddressedUtxos(modernUtxos)

          const baseAddr = this.getFirstPaymentAddress()
          const paymentAddressCIP36 = baseAddr.toAddress().toBech32(undefined)

          const rewardAddress = this.getRewardAddress().toBech32(undefined)

          // Build transaction using TransactionBuilder
          const builder = new TransactionBuilder()

          // Add all UTXOs as inputs
          for (const utxo of modernUtxos) {
            builder.addInput(utxo)
          }

          // Create and add voting metadata
          const votingMetadata = supportsCIP36
            ? createCIP36VotingMetadata(
                votingPublicKey.toBech32(),
                stakingPublicKey.toBech32(),
                rewardAddress,
                nonce,
                paymentAddressCIP36,
              )
            : createCIP15VotingMetadata(
                votingPublicKey.toBech32(),
                stakingPublicKey.toBech32(),
                rewardAddress,
                nonce,
              )

          builder.addMetadata(String(votingMetadata.label), votingMetadata.data)

          // Set change address
          builder.setChangeAddress(changeAddr.address)

          // Set TTL
          builder.setTTL(absSlotNumber.toNumber())

          // Set protocol parameters
          builder.setProtocolParams(protocolParams)

          // Build the transaction
          const unsignedTx = await builder.build(
            CardanoMobile,
            protocolParams,
            primaryTokenId,
          )

          // Convert to legacy format for yoroiUnsignedTx
          const legacyUnsignedTx = await adaptUnsignedTransaction(
            CardanoMobile,
            unsignedTx,
            toLibToken(this.portfolioPrimaryTokenInfo),
          )

          const votingRegistration: {
            votingPublicKey: string
            stakingPublicKey: string
            rewardAddress: string
            nonce: number
          } = {
            votingPublicKey: votingPublicKey.toBech32(),
            stakingPublicKey: stakingPublicKey.toBech32(),
            rewardAddress,
            nonce,
          }

          return {
            votingRegTx: yoroiUnsignedTx({
              unsignedTx:
                legacyUnsignedTx as unknown as CardanoTypes.UnsignedTx,
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
        const primaryTokenId = this.portfolioPrimaryTokenInfo.id

        const absSlotNumber = await this.getAbsoluteSlotNumber()
        const changeAddr = this.getAddressedChangeAddress(addressMode)
        const modernUtxos = this.getAddressedUtxos()
        const addressedUtxos = modernUtxosToCardanoAddressedUtxos(modernUtxos)
        const accountState = await legacyApi.getAccountState(
          {addresses: [this.rewardAddressHex]},
          networkManager.legacyApiBaseUrl,
        )

        const {coinsPerUtxoByte, keyDeposit, linearFee, poolDeposit} =
          this.protocolParams

        const protocolParams: CardanoHaskellConfig = {
          keyDeposit,
          linearFee,
          minimumUtxoVal: cardanoConfig.params.minUtxoValue.toString(),
          coinsPerUtxoByte,
          poolDeposit,
          networkId: this.networkManager.chainId,
        }

        // Get withdrawal amount from account state
        const rewardAddress = this.rewardAddressHex
        const rewards = accountState[rewardAddress]?.rewards || '0'

        // Build transaction using TransactionBuilder
        const builder = new TransactionBuilder()

        // Add all UTXOs as inputs
        for (const utxo of modernUtxos) {
          builder.addInput(utxo)
        }

        // Add withdrawal
        if (BigInt(rewards) > 0n) {
          builder.addWithdrawal(rewardAddress, rewards)
        }

        // Add deregistration certificate if needed
        if (shouldDeregister) {
          const stakingKey = this.getStakingKey()
          const deregCert = createStakeDeregistrationCertificate(
            CardanoMobile,
            stakingKey,
          )
          builder.addCertificate(deregCert)
        }

        // Set change address
        builder.setChangeAddress(changeAddr.address)

        // Set TTL
        builder.setTTL(absSlotNumber.toNumber())

        // Set protocol parameters
        builder.setProtocolParams(protocolParams)

        // Build the transaction
        const unsignedTx = await builder.build(
          CardanoMobile,
          protocolParams,
          primaryTokenId,
        )

        // Convert to legacy format for yoroiUnsignedTx
        const legacyUnsignedTx = await adaptUnsignedTransaction(
          CardanoMobile,
          unsignedTx,
          toLibToken(this.portfolioPrimaryTokenInfo),
        )

        return yoroiUnsignedTx({
          unsignedTx: legacyUnsignedTx as unknown as CardanoTypes.UnsignedTx,
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
      const primaryTokenId = this.portfolioPrimaryTokenInfo.id
      const absSlotNumber = await this.getAbsoluteSlotNumber()
      const changeAddr = this.getAddressedChangeAddress(addressMode)
      const modernUtxos = this.getAddressedUtxos()
      const addressedUtxos = modernUtxosToCardanoAddressedUtxos(modernUtxos)

      const {coinsPerUtxoByte, keyDeposit, linearFee, poolDeposit} =
        this.protocolParams

      const protocolParams: CardanoHaskellConfig = {
        keyDeposit,
        linearFee,
        minimumUtxoVal: cardanoConfig.params.minUtxoValue.toString(),
        coinsPerUtxoByte,
        poolDeposit,
        networkId: this.networkManager.chainId,
      }

      try {
        // Build transaction using TransactionBuilder
        const builder = new TransactionBuilder()

        // Add all UTXOs as inputs
        for (const utxo of modernUtxos) {
          builder.addInput(utxo)
        }

        // Add voting certificates
        for (const cert of votingCertificates) {
          builder.addCertificate(cert)
        }

        // Set change address
        builder.setChangeAddress(changeAddr.address)

        // Set TTL
        builder.setTTL(absSlotNumber.toNumber())

        // Set protocol parameters
        builder.setProtocolParams(protocolParams)

        // Build the transaction
        const unsignedTx = await builder.build(
          CardanoMobile,
          protocolParams,
          primaryTokenId,
        )

        // Convert to legacy format for yoroiUnsignedTx
        const legacyUnsignedTx = await adaptUnsignedTransaction(
          CardanoMobile,
          unsignedTx,
          toLibToken(this.portfolioPrimaryTokenInfo),
        )

        return yoroiUnsignedTx({
          unsignedTx: legacyUnsignedTx as unknown as CardanoTypes.UnsignedTx,
          networkManager: this.networkManager,
          addressedUtxos,
          entries: [],
          governance: true,
          primaryTokenId,
          keyDeposit,
        })
      } catch (e) {
        if (
          e instanceof NotEnoughMoneyToSendError ||
          e instanceof NoOutputsError
        )
          throw e
        throw new App.Errors.LibraryError((e as Error).message)
      }
    }

    getAllUtxosForKey() {
      if (implementationConfig.features.staking) {
        const modernUtxos = this.getAddressedUtxos()
        const addressedUtxos = modernUtxosToCardanoAddressedUtxos(modernUtxos)
        return filterAddressesByStakingKey(
          CardanoMobile.Credential.fromKeyhash(this.getStakingKey().hash()),
          addressedUtxos,
          false,
        )
      }
      throwLoggedError('getAllUtxosForKey staking not supported')
    }

    getDelegationStatus() {
      if (implementationConfig.features.staking) {
        const certsForKey =
          this.transactionManager.perRewardAddressCertificates[
            this.rewardAddressHex
          ]
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

        const stakingUtxos = this.getAllUtxosForKey()
        const amount = Quantities.sum([
          ...stakingUtxos.map((utxo) => utxo.amount as Balance.Quantity),
          accountState.remainingAmount as Balance.Quantity,
        ])

        this.balanceManager.updatePrimaryDerived({
          availableRewards: BigInt(accountState.remainingAmount),
        })

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
      // TODO: the correct way would be following these steps:
      // 1st) pausing all fetches (all background syncing) utxo/used addresses/token infos
      // 2nd) clearing all data
      // 3rd) marking all caches as stale (queries etc)
      // 4th) resuming all syncs
      // NOTE: there is room for data inconsistency here

      // NOTE: this will invalidate all tokens for that network which means other wallets will be affected too
      this.networkManager.tokenManager.clear({
        sourceId: `resync-wallet-${this.id}`,
      })

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
        logger.error('ShelleyWallet: sync wallet not initialized', {
          id: this.id,
        })
        return Promise.resolve()
      }

      await this.accountManager.discoverAddresses()

      await Promise.all([
        this.syncUtxos({isForced}),
        this.transactionManager.doSync(
          this.addressesInBlocks,
          this.networkManager.legacyApiBaseUrl,
        ),
      ])
    }

    async resync() {
      logger.info('resync', {
        walletId: this.id,
        origin: 'CardanoWallet',
      })
      await this.clear()
      return this.sync({isForced: true})
    }
    // end sync

    public async signRawTx(txHex: string, pKeys: CSL.PrivateKey[]) {
      return signRawTransaction(CardanoMobile, txHex, pKeys)
    }

    private getAddressedUtxos(): ModernUtxo[] {
      const primaryTokenId = this.portfolioPrimaryTokenInfo.id

      return this.utxos.map((utxo: RawUtxo): ModernUtxo => {
        const addressing = this.getAddressing(utxo.receiver)

        return rawUtxoToModernUtxo(
          utxo,
          addressing,
          undefined, // derivationPath - can be added later if needed for display
          primaryTokenId,
        )
      })
    }

    private async getAbsoluteSlotNumber() {
      const time = await this.checkServerStatus()
        .then(({serverTime}) => serverTime || Date.now())
        .catch(() => Date.now())
      return new BigNumber(
        this.networkManager.epoch.progress(new Date(time)).absoluteSlot,
      )
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
      const primaryTokenId = this.portfolioPrimaryTokenInfo.id
      const absSlotNumber = await this.getAbsoluteSlotNumber()

      const changeAddr = this.getAddressedChangeAddress(addressMode)
      const modernUtxos = this.getAddressedUtxos()

      const {
        coinsPerUtxoByte,
        keyDeposit,
        linearFee: {coefficient, constant},
        poolDeposit,
      } = this.protocolParams

      const protocolParams: CardanoHaskellConfig = {
        keyDeposit,
        linearFee: {
          coefficient,
          constant,
        },
        minimumUtxoVal: cardanoConfig.params.minUtxoValue.toString(),
        coinsPerUtxoByte,
        poolDeposit,
        networkId: this.networkManager.chainId,
      }

      try {
        // Build transaction using TransactionBuilder
        const builder = new TransactionBuilder()

        // Add all UTXOs as inputs (TransactionBuilder will handle selection)
        // For now, we add all UTXOs - in the future, we can add smart selection
        for (const utxo of modernUtxos) {
          builder.addInput(utxo)
        }

        // Add outputs from entries
        for (const entry of entries) {
          builder.addOutput(entry.address, entry.amounts, entry.datum)
        }

        // Set change address
        builder.setChangeAddress(changeAddr.address)

        // Set TTL
        builder.setTTL(absSlotNumber.toNumber())

        // Add metadata if present
        if (metadata && metadata.length > 0) {
          for (const meta of metadata) {
            const label = String(meta.label)
            builder.addMetadata(label, meta.data)
          }
        }

        // Set protocol parameters
        builder.setProtocolParams(protocolParams)

        // Build the transaction
        const unsignedTx = await builder.build(
          CardanoMobile,
          protocolParams,
          primaryTokenId,
        )

        // Convert to legacy format for yoroiUnsignedTx
        const legacyUnsignedTx = await adaptUnsignedTransaction(
          CardanoMobile,
          unsignedTx,
          toLibToken(this.portfolioPrimaryTokenInfo),
        )

        const addressedUtxos = modernUtxosToCardanoAddressedUtxos(modernUtxos)

        return yoroiUnsignedTx({
          unsignedTx: legacyUnsignedTx as unknown as CardanoTypes.UnsignedTx,
          networkManager: this.networkManager,
          addressedUtxos,
          entries,
          primaryTokenId,
          keyDeposit,
        })
      } catch (e) {
        if (
          e instanceof NotEnoughMoneyToSendError ||
          e instanceof NoOutputsError
        )
          throw e
        throwLoggedError(new App.Errors.LibraryError((e as Error).message))
      }
    }

    async signTx(unsignedTx: YoroiUnsignedTx, decryptedMasterKey: string) {
      const masterKey = CardanoMobile.Bip32PrivateKey.fromBytes(
        new Uint8Array(Buffer.from(decryptedMasterKey, 'hex')),
      )
      const accountPrivateKey = masterKey
        .derive(implementationConfig.derivations.base.harden.purpose)
        .derive(implementationConfig.derivations.base.harden.coinType)
        .derive(this.accountVisual + derivationConfig.hardStart)

      const accountPrivateKeyHex = Buffer.from(
        accountPrivateKey.asBytes(),
      ).toString('hex')

      let stakingPrivateKey
      if (implementationConfig.features.staking) {
        const derivation = implementationConfig.features.staking.derivation
        stakingPrivateKey = accountPrivateKey
          .derive(derivation.role)
          .derive(derivation.index)
          .toRawKey()
      }

      const needsStakingKey =
        isNonEmpty(unsignedTx.staking.delegations) ||
        isNonEmpty(unsignedTx.staking.registrations) ||
        isNonEmpty(unsignedTx.staking.deregistrations) ||
        isNonEmpty(unsignedTx.staking.withdrawals) ||
        unsignedTx.governance

      if (needsStakingKey && !stakingPrivateKey) {
        throwLoggedError(
          'CardanoWallet: signTx required staking key but not supported',
        )
      }

      const stakingKeys =
        needsStakingKey && stakingPrivateKey ? [stakingPrivateKey] : undefined

      const datumDatas = unsignedTx.entries
        .map((entry: YoroiEntry) => entry.datum)
        .filter(isNonNullable)
        .filter(
          (datum: Datum): datum is Exclude<Datum, {hash: string}> =>
            'data' in datum,
        )

      if (datumDatas.length > 0) {
        const signedTx = unsignedTx.unsignedTx.sign(
          derivationConfig.keyLevel.account,
          accountPrivateKeyHex,
          new Set<string>(),
          [],
          undefined,
          datumDatas,
        )

        return yoroiSignedTx({unsignedTx, signedTx})
      }

      const signedTx = unsignedTx.unsignedTx.sign(
        derivationConfig.keyLevel.account,
        accountPrivateKeyHex,
        new Set<string>(),
        stakingKeys,
        stakingPrivateKey,
      )

      return yoroiSignedTx({unsignedTx, signedTx})
    }

    async ledgerSupportsCIP36(
      useUSB: boolean,
      hwDeviceInfo: HW.DeviceInfo,
    ): Promise<boolean> {
      if (!hwDeviceInfo) throw new Error('Invalid wallet state')
      return doesCardanoAppVersionSupportCIP36(
        await getCardanoAppMajorVersion(hwDeviceInfo, useUSB),
      )
    }

    async ledgerSupportsCIP1694(
      useUSB: boolean,
      hwDeviceInfo: HW.DeviceInfo,
    ): Promise<boolean> {
      if (!hwDeviceInfo) throw new Error('Invalid wallet state')
      return doesCardanoAppVersionSupportCIP1694(
        await getCardanoAppMajorVersion(hwDeviceInfo, useUSB),
      )
    }

    async signRawTxWithLedger(
      cbor: string,
      useUSB: boolean,
      hwDeviceInfo: HW.DeviceInfo,
    ): Promise<void> {
      let stakingAddressing
      if (implementationConfig.features.staking) {
        stakingAddressing = Array.from(
          implementationConfig.features.staking.addressing,
        )
      }

      const payload = await toLedgerSignRequest(
        CardanoMobile,
        cbor,
        this.networkManager.chainId,
        this.networkManager.protocolMagic,
        getHexAddressingMap(CardanoMobile, this),
        getHexAddressingMap(CardanoMobile, this),
        getAddressedUtxos(this),
        [],
        stakingAddressing,
      )

      const signedLedgerTx = await signTxWithLedger(
        payload,
        hwDeviceInfo,
        useUSB,
      )

      const bytes = await createSignedLedgerTxFromCbor(
        CardanoMobile,
        cbor,
        signedLedgerTx,
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
      const appAdaVersion = await getCardanoAppMajorVersion(
        hwDeviceInfo,
        useUSB,
      )

      if (
        !doesCardanoAppVersionSupportCIP36(appAdaVersion) &&
        unsignedTx.voting.registration
      ) {
        if (implementationConfig.features.staking) {
          logger.info(
            'ShelleyWallet: signTxWithLedger ledger app version <= 5, no CIP-36 support',
            {appAdaVersion},
          )
          const ledgerPayload = await buildVotingLedgerPayloadV5(
            unsignedTx.unsignedTx as any, // TODO: Fix type when TransactionBuilder is complete
            this.networkManager.chainId,
            this.networkManager.protocolMagic,
            Array.from(implementationConfig.features.staking.addressing),
          )

          const signedLedgerTx = await signTxWithLedger(
            ledgerPayload,
            hwDeviceInfo,
            useUSB,
          )

          const signedTx = await buildLedgerSignedTx(
            CardanoMobile,
            unsignedTx.unsignedTx as any, // TODO: Fix type when TransactionBuilder is complete
            signedLedgerTx,
            implementationConfig.derivations.base.harden.purpose,
            this.publicKeyHex,
            false,
          )

          return yoroiSignedTx({unsignedTx, signedTx})
        }

        throwLoggedError(
          'signTxWithLedger voting registration staking not supported',
        )
      }

      logger.info(
        'ShelleyWallet: signTxWithLedger ledger app version > 5, using CIP-36',
        {appAdaVersion},
      )

      let stakingAddressing
      if (implementationConfig.features.staking) {
        stakingAddressing = Array.from(
          implementationConfig.features.staking.addressing,
        )
      }
      const ledgerPayload = await buildLedgerPayload(
        unsignedTx.unsignedTx as any, // TODO: Fix type when TransactionBuilder is complete
        this.networkManager.chainId,
        this.networkManager.protocolMagic,
        stakingAddressing,
      )

      const signedLedgerTx = await signTxWithLedger(
        ledgerPayload,
        hwDeviceInfo,
        useUSB,
      )

      const datumDatas = unsignedTx.entries
        .map((entry: YoroiEntry) => entry.datum)
        .filter(isNonNullable)
        .filter(
          (datum: Datum): datum is Exclude<Datum, {hash: string}> =>
            'data' in datum,
        )

      const signedTx = await buildLedgerSignedTx(
        CardanoMobile,
        unsignedTx.unsignedTx as any, // TODO: Fix type when TransactionBuilder is complete
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
      return legacyApi.checkServerStatus(this.networkManager.legacyApiBaseUrl)
    }

    async submitTransaction(base64SignedTx: string) {
      await legacyApi.submitTransaction(
        base64SignedTx,
        this.networkManager.legacyApiBaseUrl,
      )
    }

    private async syncUtxos({isForced = false}: {isForced?: boolean} = {}) {
      const addresses = [...this.internalAddresses, ...this.externalAddresses]

      await this.utxoManager.sync(addresses)
      const newUtxos = await this.utxoManager.getCachedUtxos()

      // NOTE: wallet is not aware of utxos state
      // if it crashes, the utxo manager will be out of sync with wallet
      if (this.didUtxosUpdate(this._utxos, newUtxos) || isForced) {
        // NOTE: recalc locked deposit should happen also when epoch changes after conway
        const lockedAsStorageCost = calcLockedDeposit({
          rawUtxos: newUtxos,
          coinsPerUtxoByteStr: this.protocolParams.coinsPerUtxoByte,
        })

        const balancesToSync = toBalanceManagerSyncArgs(
          newUtxos,
          BigInt(lockedAsStorageCost.toString()),
        )

        this.balanceManager.syncBalances(balancesToSync)

        this._utxos = newUtxos
        this.notify({type: 'utxos', utxos: this.utxos})
        return true
      }
      return false
    }

    private _getUtxos = defaultMemoize(
      (utxos: RawUtxo[], collateralId: string) => {
        return collateralId.length > 0
          ? utxos.filter((utxo) => utxo.utxo_id !== collateralId)
          : utxos
      },
    )

    get utxos() {
      return this._getUtxos(this._utxos, this._collateralId)
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
        collateralUtxo?.amount !== undefined && !(collateralUtxo.amount === '')
          ? BigInt(collateralUtxo?.amount)
          : 0n
      const collateralTxId = collateralId ? collateralId.split(':')[0] : null
      const isConfirmed =
        !!collateralTxId &&
        Object.values(this.transactions).some((tx) => tx.id === collateralTxId)

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
      return legacyApi.bulkGetAccountState(
        [this.rewardAddressHex],
        this.networkManager.legacyApiBaseUrl,
      )
    }

    async fetchPoolInfo(request: PoolInfoRequest) {
      return legacyApi.getPoolInfo(
        request,
        this.networkManager.legacyApiBaseUrl,
      )
    }

    async fetchFundInfo(): Promise<FundInfoResponse> {
      return legacyApi.getFundInfo(
        this.networkManager.legacyApiBaseUrl,
        this.isMainnet,
      )
    }

    async fetchTxStatus(request: TxStatusRequest): Promise<TxStatusResponse> {
      return legacyApi.fetchTxStatus(
        request,
        this.networkManager.legacyApiBaseUrl,
      )
    }

    private isInitialized = false

    private subscriptions: Array<WalletSubscription> = []

    private _onTxHistoryUpdateSubscriptions: Array<
      (wallet: YoroiWallet) => void
    > = []

    private _isUsedAddressIndexSelector = defaultMemoize((perAddressTxs) =>
      Object.fromEntries(
        Object.entries(perAddressTxs).map(([address, txs]) => [
          address,
          (txs as Array<string>).length > 0,
        ]),
      ),
    )

    // =================== getters =================== //
    get internalAddresses() {
      return this.internalChain.addresses
    }

    get externalAddresses() {
      return this.externalChain.addresses
    }

    get isUsedAddressIndex() {
      return this._isUsedAddressIndexSelector(
        this.transactionManager.perAddressTxs,
      )
    }

    get transactions() {
      const memos = this.memosManager.getMemos()

      return parseTransactionsMemoized(
        memos,
        this.internalAddresses,
        this.externalAddresses,
        this.rewardAddressHex,
        this.confirmationCounts,
        this.transactionManager.transactions,
        this.portfolioPrimaryTokenInfo,
      )
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
        this.subscriptions = this.subscriptions.filter(
          (sub) => sub !== subscription,
        )
      }
    }

    private notifyOnTxHistoryUpdate = () => {
      this._onTxHistoryUpdateSubscriptions.forEach((handler) => handler(this))
    }

    subscribeOnTxHistoryUpdate(subscription: () => void) {
      this._onTxHistoryUpdateSubscriptions.push(subscription)

      return () => {
        this._onTxHistoryUpdateSubscriptions =
          this._onTxHistoryUpdateSubscriptions.filter(
            (sub) => sub !== subscription,
          )
      }
    }

    private setupSubscriptions() {
      this.transactionManager.subscribe(() =>
        this.notify({type: 'transactions', transactions: this.transactions}),
      )
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
      const txs = perAddressTxs[address]
      return !!txs && txs.length > 0
    }
  }
}

const isNonEmpty = (arr: unknown[] | undefined) => {
  return arr && arr.length > 0
}

const parseTransactions = (
  memos: Record<string, string>,
  internalAddresses: string[],
  externalAddresses: string[],
  rewardAddressHex: string,
  confirmationCounts: Record<string, number | null>,
  transactions: TransactionManager['transactions'],
  primaryTokenInfo: Portfolio.Token.Info,
) => {
  const addresses =
    rewardAddressHex !== ''
      ? [...internalAddresses, ...externalAddresses, rewardAddressHex]
      : [...internalAddresses, ...externalAddresses]

  return Object.fromEntries(
    Object.entries(transactions).map(([txId, tx]) => [
      txId,
      processTxHistoryData(
        tx,
        addresses,
        confirmationCounts[tx.id] || 0,
        memos[tx.id] ?? null,
        primaryTokenInfo,
      ),
    ]),
  )
}

const parseTransactionsMemoized = defaultMemoize(parseTransactions)
