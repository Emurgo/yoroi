import {AppApi} from '@yoroi/api'
import {
  cardanoConfig,
  derivationConfig,
  protocolParamsPlaceholder,
} from '@yoroi/blockchains'
import {isNonNullable} from '@yoroi/common'
import {StakePoolInfoRequest} from '@yoroi/staking'
import type {Datum, ModernUtxo, UnsignedTransaction} from '@yoroi/tx'
import {
  adaptToLedgerUnsignedTx,
  buildLedgerPayload,
  buildLedgerSignedTx,
  buildVotingLedgerPayloadV5,
  createSignedLedgerTxFromCbor,
  modernUtxosToCardanoAddressedUtxos,
  rawUtxoToModernUtxo,
  signRawTransaction,
  signTransaction,
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
  RawUtxo,
  TxStatusRequest,
  TxStatusResponse,
  WalletTransaction,
} from '../types/other'
import {StakingInfo} from '../types/staking'
import {Quantities} from '../utils/utils'
import {CardanoMobile} from '../wallets'
import {
  AccountManager,
  Addresses,
  accountManagerMaker,
} from './account-manager/account-manager'
import * as legacyApi from './api/api'
import {calcLockedDeposit} from './assetUtils'
import {getDelegationStatus} from './delegationUtils'
import {
  doesCardanoAppVersionSupportCIP36,
  doesCardanoAppVersionSupportCIP1694,
  getCardanoAppMajorVersion,
  signTxWithLedger,
} from './hw/hw'
import {keyManager} from './key-manager/key-manager'
import {processTxHistoryData} from './processTransactions/processTransactions'
import {
  createDelegationTx,
  createUnsignedGovernanceTx,
  createUtxoConsolidationTx,
  createVotingRegTx,
  createWithdrawalTx,
} from './transaction-recipes'
import {TransactionManager} from './transactionManager/transactionManager'
import {
  CardanoTypes,
  WalletEvent,
  WalletSubscription,
  YoroiWallet,
  isYoroiWallet,
} from './types'
import {
  deriveRewardAddressHex,
  getAddressedUtxos,
  getHexAddressingMap,
} from './utils'
import {UtxoManager, makeUtxoManager} from './utxoManager/utxoManager'
import {utxosMaker} from './utxoManager/utxos'
import {CardanoMobileWrapped} from './wrappedCsl'

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

    async createDelegationTx({
      poolId,
      delegatedAmount: _delegatedAmount,
      addressMode,
    }: {
      poolId: string | undefined
      delegatedAmount: BigNumber
      addressMode: Wallet.AddressMode
    }): Promise<{cbor: string}> {
      if (implementationConfig.features.staking) {
        return createDelegationTx({
          utxos: this.getAddressedUtxos(),
          primaryTokenId: this.portfolioPrimaryTokenInfo.id,
          protocolParams: this.protocolParams,
          networkId: this.networkManager.chainId,
          getAbsoluteSlotNumber: () => this.getAbsoluteSlotNumber(),
          getChangeAddress: (mode: Wallet.AddressMode) =>
            this.getChangeAddress(mode),
          getStakingKey: () => this.getStakingKey(),
          getDelegationStatus: () => this.getDelegationStatus(),
          poolId,
          addressMode,
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
        try {
          return await createVotingRegTx({
            utxos: this.getAddressedUtxos(),
            primaryTokenId: this.portfolioPrimaryTokenInfo.id,
            protocolParams: this.protocolParams,
            networkId: this.networkManager.chainId,
            getAbsoluteSlotNumber: () => this.getAbsoluteSlotNumber(),
            getChangeAddress: (mode) => this.getChangeAddress(mode),
            getStakingKey: () => this.getStakingKey(),
            getFirstPaymentAddress: () => this.getFirstPaymentAddress(),
            supportsCIP36,
            catalystKeyHex,
            addressMode,
          })
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
    }): Promise<{cbor: string}> {
      if (implementationConfig.features.staking) {
        return createWithdrawalTx({
          utxos: this.getAddressedUtxos(),
          rewardAddressHex: this.rewardAddressHex,
          primaryTokenId: this.portfolioPrimaryTokenInfo.id,
          protocolParams: this.protocolParams,
          networkId: this.networkManager.chainId,
          getAbsoluteSlotNumber: () => this.getAbsoluteSlotNumber(),
          getChangeAddress: (mode: Wallet.AddressMode) =>
            this.getChangeAddress(mode),
          getStakingKey: () => this.getStakingKey(),
          getAccountState: (addresses: string[]) =>
            legacyApi.getAccountState(
              {addresses},
              networkManager.legacyApiBaseUrl,
            ),
          getDelegationStatus: () => this.getDelegationStatus(),
          shouldDeregister,
          addressMode,
        })
      }

      throwLoggedError('createWithdrawalTx staking not supported')
    }

    async createUtxoConsolidationTx({
      addressMode,
    }: {
      addressMode: Wallet.AddressMode
    }): Promise<{cbor: string}> {
      return createUtxoConsolidationTx({
        utxos: this.getAddressedUtxos(),
        externalAddresses: this.externalAddresses,
        primaryTokenId: this.portfolioPrimaryTokenInfo.id,
        protocolParams: this.protocolParams,
        networkId: this.networkManager.chainId,
        getAbsoluteSlotNumber: () => this.getAbsoluteSlotNumber(),
        getChangeAddress: (mode) => this.getChangeAddress(mode),
        addressMode,
      })
    }

    async createUnsignedGovernanceTx({
      votingCertificates,
      addressMode,
    }: {
      votingCertificates: CardanoTypes.Certificate[]
      addressMode: Wallet.AddressMode
    }): Promise<{cbor: string}> {
      return createUnsignedGovernanceTx({
        utxos: this.getAddressedUtxos(),
        primaryTokenId: this.portfolioPrimaryTokenInfo.id,
        protocolParams: this.protocolParams,
        networkId: this.networkManager.chainId,
        getAbsoluteSlotNumber: () => this.getAbsoluteSlotNumber(),
        getChangeAddress: (mode) => this.getChangeAddress(mode),
        votingCertificates,
        addressMode,
      })
    }

    getAllUtxosForKey(): Array<CardanoTypes.CardanoAddressedUtxo> {
      if (implementationConfig.features.staking) {
        const modernUtxos = this.getAddressedUtxos()
        const addressedUtxos = modernUtxosToCardanoAddressedUtxos(modernUtxos)
        // Filter synchronously by checking if address contains the staking key
        const stakingKeyHashHex = this.getStakingKey().hash().toHex()
        return addressedUtxos.filter((utxo) => {
          try {
            return CardanoMobileWrapped.cslScope((csl) => {
              const addr = csl.Address.fromBech32(utxo.receiver)
              if (!addr) return false
              const baseAddr = csl.BaseAddress.fromAddress(addr)
              if (!baseAddr) return false
              const stakeCred = baseAddr.stakeCred()
              const keyHash = stakeCred.toKeyhash()
              if (!keyHash) return false
              return keyHash.toHex() === stakingKeyHashHex
            })
          } catch {
            return false
          }
        })
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
      // Note: The ideal implementation would follow these steps:
      // 1st) Pausing all fetches (all background syncing) utxo/used addresses/token infos
      //      This requires implementing pause/resume mechanisms in utxoManager, transactionManager,
      //      and accountManager to prevent data inconsistency during clearing
      // 2nd) Clearing all data (current implementation)
      // 3rd) Marking all caches as stale (queries etc) - may require query client invalidation
      // 4th) Resuming all syncs
      // NOTE: There is room for data inconsistency here without proper sync pausing

      // NOTE: this will invalidate all tokens for that network which means other wallets will be affected too
      this.networkManager.tokenManager.clear({
        sourceId: `resync-wallet-${this.id}`,
      })

      // Note: Account clearing would require iterating through all accounts and clearing their data
      // Currently, accountManager doesn't have a clear() method, and accounts are managed per accountVisual
      // This would need to be implemented if multi-account support is added
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
      return signRawTransaction(txHex, pKeys)
    }

    private getAddressedUtxos(): ModernUtxo[] {
      const primaryTokenId = this.portfolioPrimaryTokenInfo.id

      return this.utxos.map((utxo: RawUtxo): ModernUtxo => {
        const addressing = this.getAddressing(utxo.receiver)

        // Type assertion to help TypeScript understand the compatible types
        // Both RawUtxo types have the same structure (tokenId), just from different modules
        return rawUtxoToModernUtxo(
          utxo as unknown as Parameters<typeof rawUtxoToModernUtxo>[0],
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

    async signTx(unsignedTx: UnsignedTransaction, decryptedMasterKey: string) {
      if (!unsignedTx.cbor) {
        throw new Error('UnsignedTransaction must have CBOR to sign')
      }

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

      // Derive staking key requirements from certificates and withdrawals
      let needsStakingKey = false
      if (
        unsignedTx.certificates.length > 0 ||
        unsignedTx.withdrawals.length > 0
      ) {
        needsStakingKey = true
      }

      // Check for governance-related certificates (vote delegation, etc.)
      // Certificates are now data objects, not CSL objects
      for (const certData of unsignedTx.certificates) {
        const certKind = 'kind' in certData ? certData.kind : 'unknown'
        if (
          certKind === 'VoteDelegation' ||
          certKind === 'StakeAndVoteDelegation' ||
          certKind === 'StakeVoteRegistrationAndDelegation' ||
          certKind === 'VoteRegistrationAndDelegation'
        ) {
          needsStakingKey = true
          break
        }
      }

      if (needsStakingKey && !stakingPrivateKey) {
        throwLoggedError(
          'CardanoWallet: signTx required staking key but not supported',
        )
      }

      const stakingKeys =
        needsStakingKey && stakingPrivateKey ? [stakingPrivateKey] : undefined

      // Extract datum data from outputs
      const datumDatas = unsignedTx.outputs
        .map((output) => output.datum)
        .filter(isNonNullable)
        .filter(
          (datum: Datum): datum is Exclude<Datum, {hash: string}> =>
            'data' in datum,
        )

      // Prepare staking keys for signing
      const stakingKeysForSigning =
        stakingKeys && stakingPrivateKey
          ? [
              {
                keyHex: Buffer.from(stakingPrivateKey.asBytes()).toString(
                  'hex',
                ),
              },
            ]
          : undefined

      // Sign the transaction using the new signing function
      return CardanoMobileWrapped.cslScope((csl) => {
        const signedTx = signTransaction(
          csl,
          unsignedTx,
          accountPrivateKeyHex,
          stakingKeysForSigning,
          datumDatas.length > 0
            ? datumDatas.map((d) => ({data: d.data}))
            : undefined,
        )

        return signedTx
      })
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

      const addressingMap = await getHexAddressingMap(this)
      const payload = await toLedgerSignRequest(
        CardanoMobile,
        cbor,
        this.networkManager.chainId,
        this.networkManager.protocolMagic,
        addressingMap,
        addressingMap,
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
        cbor,
        signedLedgerTx,
        implementationConfig.derivations.base.harden.purpose,
        this.publicKeyHex,
      )

      const base64 = Buffer.from(bytes).toString('base64')
      await this.submitTransaction(base64)
    }

    async signTxWithLedger(
      unsignedTx: UnsignedTransaction,
      useUSB: boolean,
      hwDeviceInfo: HW.DeviceInfo,
    ): Promise<CSL.Transaction> {
      if (!unsignedTx.cbor) {
        throw new Error(
          'UnsignedTransaction must have CBOR to sign with Ledger',
        )
      }

      const appAdaVersion = await getCardanoAppMajorVersion(
        hwDeviceInfo,
        useUSB,
      )

      // Check for voting registration in metadata (label 61284 = CatalystLabels.DATA)
      const hasVotingRegistration = unsignedTx.metadata?.some(
        (meta) =>
          String(meta.label) === '61284' || Number(meta.label) === 61284,
      )

      if (
        !doesCardanoAppVersionSupportCIP36(appAdaVersion) &&
        hasVotingRegistration
      ) {
        if (implementationConfig.features.staking) {
          logger.info(
            'ShelleyWallet: signTxWithLedger ledger app version <= 5, no CIP-36 support',
            {appAdaVersion},
          )

          const stakingConfig = implementationConfig.features.staking

          // Get change address from UnsignedTransaction options or use default
          const changeAddress =
            unsignedTx.options.changeAddress ||
            this.getChangeAddress('multiple')
          const addressing = this.getAddressing(changeAddress)
          const changeAddr = {address: changeAddress, addressing}

          // Convert UnsignedTransaction to LedgerUnsignedTx format
          return CardanoMobileWrapped.cslScope(async (csl) => {
            const ledgerUnsignedTx = adaptToLedgerUnsignedTx(csl, unsignedTx, [
              changeAddr,
            ])

            const ledgerPayload = await buildVotingLedgerPayloadV5(
              csl,
              ledgerUnsignedTx,
              this.networkManager.chainId,
              this.networkManager.protocolMagic,
              Array.from(stakingConfig.addressing),
            )

            const signedLedgerTx = await signTxWithLedger(
              ledgerPayload,
              hwDeviceInfo,
              useUSB,
            )

            const signedTxResult = await buildLedgerSignedTx(
              csl,
              {
                senderUtxos: ledgerUnsignedTx.senderUtxos,
                txBuilder: ledgerUnsignedTx.txBuilder,
                auxiliaryData: ledgerUnsignedTx.auxiliaryData,
              },
              signedLedgerTx,
              implementationConfig.derivations.base.harden.purpose,
              this.publicKeyHex,
              false,
            )

            // Convert signed transaction bytes to Transaction object
            const signedTx = await CardanoMobile.Transaction.fromBytes(
              signedTxResult.encodedTx,
            )

            return signedTx
          })
        }

        throwLoggedError(
          'signTxWithLedger voting registration staking not supported',
        )
      }

      logger.info(
        'ShelleyWallet: signTxWithLedger ledger app version > 5, using CIP-36',
        {appAdaVersion},
      )

      // Get change address from UnsignedTransaction options or use default
      const changeAddress =
        unsignedTx.options.changeAddress || this.getChangeAddress('multiple')
      const addressing = this.getAddressing(changeAddress)
      const changeAddr = {address: changeAddress, addressing}

      // Convert UnsignedTransaction to LedgerUnsignedTx format
      return CardanoMobileWrapped.cslScope(async (csl) => {
        const ledgerUnsignedTx = adaptToLedgerUnsignedTx(csl, unsignedTx, [
          changeAddr,
        ])

        let stakingAddressing
        if (implementationConfig.features.staking) {
          stakingAddressing = Array.from(
            implementationConfig.features.staking.addressing,
          )
        }

        const ledgerPayload = await buildLedgerPayload(
          csl,
          ledgerUnsignedTx,
          this.networkManager.chainId,
          this.networkManager.protocolMagic,
          stakingAddressing,
        )

        const signedLedgerTx = await signTxWithLedger(
          ledgerPayload,
          hwDeviceInfo,
          useUSB,
        )

        // Extract datum data from outputs
        const datumDatas = unsignedTx.outputs
          .map((output) => output.datum)
          .filter(isNonNullable)
          .filter(
            (datum: Datum): datum is Exclude<Datum, {hash: string}> =>
              'data' in datum,
          )

        const signedTxResult = await buildLedgerSignedTx(
          csl,
          {
            senderUtxos: ledgerUnsignedTx.senderUtxos,
            txBuilder: ledgerUnsignedTx.txBuilder,
            auxiliaryData: ledgerUnsignedTx.auxiliaryData,
          },
          signedLedgerTx,
          implementationConfig.derivations.base.harden.purpose,
          this.publicKeyHex,
          true,
          datumDatas.length > 0 ? datumDatas : undefined,
        )

        // Convert signed transaction bytes to Transaction object
        const signedTx = await CardanoMobile.Transaction.fromBytes(
          signedTxResult.encodedTx,
        )

        return signedTx
      })
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
        const lockedAsStorageCost = await calcLockedDeposit({
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

    async fetchPoolInfo(request: StakePoolInfoRequest) {
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

    getRawTransaction(txId: string): WalletTransaction | undefined {
      return this.transactionManager.transactions[txId]
    }

    getRawTransactions(): Record<string, WalletTransaction> {
      return this.transactionManager.transactions
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
