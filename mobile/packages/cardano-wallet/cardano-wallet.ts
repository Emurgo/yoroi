import type {
  AccountStateResponse,
  FundInfoResponse,
  RawUtxo,
  TipStatusResponse,
  TxStatusRequest,
  TxStatusResponse,
} from '@yoroi/api'
import {AppApi} from '@yoroi/api'
import {cardanoConfig} from '@yoroi/blockchains'
import {getLogger, isNonNullable, throwLoggedError} from '@yoroi/common'
import {StakePoolInfoRequest, StakingInfo, StakingStatus} from '@yoroi/staking'
import type {Datum, ModernUtxo, UnsignedTransaction} from '@yoroi/tx'
import {
  adaptToLedgerUnsignedTx,
  buildLedgerPayload,
  buildLedgerSignedTx,
  buildVotingLedgerPayloadV5,
  createSignedLedgerTxFromCbor,
  modernUtxosToCardanoAddressedUtxos,
  signRawTransaction,
} from '@yoroi/tx'
import {
  Address,
  Api,
  App,
  Branded,
  HW,
  KeyHash,
  Network,
  Portfolio,
  PublicKeyHex,
  ScriptCbor,
  TransactionCborBase64,
  Wallet,
  WalletTransaction,
} from '@yoroi/types'

import type {SignedTransactionData} from '@cardano-foundation/ledgerjs-hw-app-cardano'
import {walletChecksum} from '@emurgo/cip4-js'
import * as CSL from '@emurgo/cross-csl-core'
import {Buffer} from 'buffer'
import {freeze} from 'immer'
import {defaultMemoize} from 'reselect'

import {
  AccountManager,
  accountManagerMaker,
} from './account-manager/account-manager'
import {
  MultisigAccountManager,
  createMultisigAccountManager,
} from './account-manager/multisig-account-manager'
import {
  ReadOnlyAccountManager,
  readOnlyAccountManagerMaker,
} from './account-manager/read-only-account-manager'
import * as legacyApi from './api/api'
import {
  extractPaymentKeyHashes,
  getWalletRegistrationData,
} from './api/wallet-registration'
import {calcLockedDeposit} from './assetUtils'
import type {
  CardanoWalletDependencies,
  MemosManager,
  WalletEncryptedStorage,
} from './dependencies'
import {
  doesCardanoAppVersionSupportCIP36,
  doesCardanoAppVersionSupportCIP1694,
  getCardanoAppMajorVersion,
  signTxWithLedger as signTxWithLedgerHW,
} from './hw/hw'
import {keyManager} from './key-manager/key-manager'
import {
  generateNewReceiveAddress as generateNewReceiveAddressOp,
  getAddressing as getAddressingOp,
  getChangeAddress as getChangeAddressOp,
  getFirstPaymentAddress as getFirstPaymentAddressOp,
} from './operations/address-operations'
import {signWalletTransaction as signWalletTransactionOp} from './operations/signing-operations'
import {
  getStakingKey as getStakingKeyOp,
  getWalletDelegationStatus as getWalletDelegationStatusOp,
  getWalletStakingInfo as getWalletStakingInfoOp,
} from './operations/staking-operations'
import {
  didUtxosUpdate as didUtxosUpdateOp,
  getAddressedUtxos as getAddressedUtxosOp,
  getSpendableUtxos as getSpendableUtxosOp,
} from './operations/utxo-operations'
import {
  type TransactionManager,
  createTransactionManager,
} from './transactionManager/transactionManager'
import {
  CardanoTypes,
  ServerStatus,
  WalletEvent,
  WalletSubscription,
  YoroiWallet,
  isYoroiWallet,
} from './types'
import {
  deriveRewardAddressFromAddress,
  deriveRewardAddressHex,
  getHexAddressingMap,
} from './utils'
import {UtxoManager, makeUtxoManager} from './utxoManager/utxoManager'
import {utxosMaker} from './utxoManager/utxos'
import {CardanoMobileWrapped} from './wrappedCsl'

type WalletState = {
  id: string
  publicKeyHex: string
  rewardAddressHex: string
  accountManager: AccountManager | ReadOnlyAccountManager
  accountVisual: number
  utxoManager: UtxoManager
  utxos: RawUtxo[]
  collateralId: string
  transactionManager: TransactionManager
  memosManager: MemosManager
  balanceManager: Readonly<Portfolio.Manager.Balance>
  portfolioPrimaryTokenInfo: Readonly<Portfolio.Token.Info>
  protocolParams: Api.Cardano.ProtocolParams
  encryptedStorage: WalletEncryptedStorage
  isInitialized: boolean
  subscriptions: Array<WalletSubscription>
  onTxHistoryUpdateSubscriptions: Array<(wallet: YoroiWallet) => void>
  dependencies: Pick<
    CardanoWalletDependencies,
    'toLedgerSignRequest' | 'toBalanceManagerSyncArgs' | 'createCollateralEntry'
  >
}

const _getUtxos = defaultMemoize((utxos: RawUtxo[], collateralId: string) => {
  // If collateral ID is explicitly set, filter that UTXO out
  if (collateralId.length > 0) {
    return utxos.filter((utxo) => utxo.utxo_id !== collateralId)
  }

  // If no collateral ID is set, find the first UTXO matching collateral criteria
  // and filter only that one out (protects potential collateral without blocking all 5 ADA UTXOs)
  const utxosList = utxosMaker(utxos)
  const potentialCollateralId = utxosList.drawnCollateral()

  if (potentialCollateralId) {
    // Filter out only the first matching collateral candidate
    return utxos.filter((utxo) => utxo.utxo_id !== potentialCollateralId)
  }

  // No collateral candidate found, return all UTXOs
  return utxos
})

const _isUsedAddressIndexSelector = defaultMemoize((perAddressTxs) =>
  Object.fromEntries(
    Object.entries(perAddressTxs).map(([address, txs]) => [
      address,
      (txs as Array<string>).length > 0,
    ]),
  ),
)

export const makeCardanoWallet = (
  networkManager: Network.Manager,
  implementation: Wallet.Implementation,
  dependencies: CardanoWalletDependencies,
) => {
  const {
    rootStorage,
    makeWalletEncryptedStorage,
    buildPortfolioBalanceManager,
    toBalanceManagerSyncArgs: toBalanceManagerSyncArgsFn,
    makeMemosManager,
    toLedgerSignRequest: toLedgerSignRequestFn,
    createCollateralEntry,
  } = dependencies
  const implementationConfig = cardanoConfig.implementations[implementation]
  const appApi = AppApi.appApiMaker({baseUrl: networkManager.legacyApiBaseUrl})

  // Store dependencies in variables accessible to closures
  const toBalanceManagerSyncArgs = toBalanceManagerSyncArgsFn
  const toLedgerSignRequest = toLedgerSignRequestFn

  const build = async ({
    id,
    accountPubKeyHex,
    accountVisual,
    readOnlyAddresses,
    rewardAddressHex,
    multisigMeta,
  }: {
    id: YoroiWallet['id']
    accountPubKeyHex?: string
    accountVisual: number
    readOnlyAddresses?: {
      knownAddress?: string
      internal?: string[]
      external?: string[]
      rewardAddressHex?: string
      enableDiscovery?: boolean
    }
    rewardAddressHex?: string
    multisigMeta?: Wallet.MultisigWalletMeta
  }) => {
    const {
      rootStorage: networkRootStorage,
      primaryTokenInfo,
      chainId,
      legacyApiBaseUrl,
      tokenManager,
    } = networkManager
    // Use global rootStorage instead of legacyRootStorage from networkManager
    // Path matches legacy storage structure: /legacy/${network}/v1/${id}/
    const {network} = networkManager
    const walletRootStorage = rootStorage.join(`legacy/${network}/v1/${id}/`)
    const accountStorage = walletRootStorage.join(`accounts/${accountVisual}/`)

    // Determine which manager to use
    let accountManager:
      | AccountManager
      | ReadOnlyAccountManager
      | MultisigAccountManager
    let finalRewardAddressHex: string

    // Handle multisig wallets (script-based)
    if (multisigMeta) {
      if (!multisigMeta.paymentScriptCbor || !multisigMeta.stakingScriptCbor) {
        throw new Error('Multisig wallet missing script CBORs')
      }

      accountManager = createMultisigAccountManager({
        paymentScriptCbor: multisigMeta.paymentScriptCbor as ScriptCbor,
        stakingScriptCbor: multisigMeta.stakingScriptCbor as ScriptCbor,
        chainId,
      })

      finalRewardAddressHex = accountManager.rewardAddressHex
    } else if (readOnlyAddresses) {
      // Read-only mode
      if (
        !readOnlyAddresses.knownAddress &&
        (!readOnlyAddresses.internal ||
          readOnlyAddresses.internal.length === 0) &&
        (!readOnlyAddresses.external || readOnlyAddresses.external.length === 0)
      ) {
        throw new Error(
          'Read-only wallet requires at least one known address or address list',
        )
      }

      accountManager = await readOnlyAccountManagerMaker({
        chainId,
        knownAddress: readOnlyAddresses.knownAddress,
        internalAddresses: readOnlyAddresses.internal || [],
        externalAddresses: readOnlyAddresses.external || [],
        rewardAddressHex:
          readOnlyAddresses.rewardAddressHex || rewardAddressHex,
        storage: accountStorage,
        baseApiUrl: legacyApiBaseUrl,
        enableDiscovery: readOnlyAddresses.enableDiscovery ?? false,
      })

      // Helper: Validate Cardano address
      const isValidCardanoAddress = (address: string): boolean => {
        if (!address || typeof address !== 'string') return false
        const trimmed = address.trim()
        return (
          trimmed.startsWith('addr') ||
          trimmed.startsWith('stake') ||
          trimmed.startsWith('Ae2') ||
          trimmed.startsWith('DdzFF') ||
          /^[0-9a-fA-F]{64,}$/.test(trimmed)
        )
      }

      // Get reward address from manager or derive it
      if (readOnlyAddresses.rewardAddressHex) {
        finalRewardAddressHex = readOnlyAddresses.rewardAddressHex
      } else if (
        readOnlyAddresses.external &&
        readOnlyAddresses.external.length > 0 &&
        readOnlyAddresses.external[0]
      ) {
        const externalAddr = readOnlyAddresses.external[0]!
        // Validate address before attempting derivation
        if (!isValidCardanoAddress(externalAddr)) {
          getLogger().warn(
            'Skipping reward address derivation: invalid external address',
            {
              address: externalAddr,
              addressLength: externalAddr.length,
            },
          )
          finalRewardAddressHex = ''
        } else {
          try {
            getLogger().debug('Deriving reward address from external address', {
              externalAddress: externalAddr.substring(0, 20) + '...',
              chainId,
            })
            const rewardAddressBech32 = deriveRewardAddressFromAddress(
              externalAddr,
              chainId,
            )
            finalRewardAddressHex = CardanoMobileWrapped.cslScope((csl) => {
              const addr = csl.Address.fromBech32(rewardAddressBech32)
              return Buffer.from(addr.toBytes()).toString('hex')
            })
          } catch (error) {
            getLogger().warn(
              'Failed to derive reward address for read-only wallet',
              {
                error,
                externalAddress: externalAddr,
                chainId,
              },
            )
            finalRewardAddressHex = ''
          }
        }
      } else if (readOnlyAddresses.knownAddress) {
        const knownAddr = readOnlyAddresses.knownAddress
        // Validate address before attempting derivation
        if (!isValidCardanoAddress(knownAddr)) {
          getLogger().warn(
            'Skipping reward address derivation: invalid known address',
            {
              address: knownAddr,
              addressLength: knownAddr.length,
            },
          )
          finalRewardAddressHex = ''
        } else {
          try {
            getLogger().debug('Deriving reward address from known address', {
              knownAddress: knownAddr.substring(0, 20) + '...',
              chainId,
            })
            const rewardAddressBech32 = deriveRewardAddressFromAddress(
              knownAddr,
              chainId,
            )
            finalRewardAddressHex = CardanoMobileWrapped.cslScope((csl) => {
              const addr = csl.Address.fromBech32(rewardAddressBech32)
              return Buffer.from(addr.toBytes()).toString('hex')
            })
          } catch (error) {
            getLogger().warn(
              'Failed to derive reward address for read-only wallet',
              {
                error,
                knownAddress: knownAddr,
                chainId,
              },
            )
            finalRewardAddressHex = ''
          }
        }
      } else {
        finalRewardAddressHex = ''
      }
    } else {
      // Full wallet mode (existing logic)
      if (!accountPubKeyHex) {
        throw new Error('accountPubKeyHex required for full wallet')
      }

      accountManager = await accountManagerMaker({
        storage: accountStorage,
        accountPubKeyHex,
        chainId,
        implementation,
        baseApiUrl: legacyApiBaseUrl,
      })

      finalRewardAddressHex = implementationConfig.features.staking
        ? deriveRewardAddressHex(
            accountPubKeyHex,
            chainId,
            implementationConfig.features.staking.derivation.role,
            implementationConfig.features.staking.derivation.index,
          )
        : ''
    }

    const utxoManager = await makeUtxoManager({
      storage: accountStorage.join('utxos/'),
      apiUrl: legacyApiBaseUrl,
    })

    const transactionManager = await createTransactionManager(
      accountStorage.join('txs/'),
    )
    // TODO: revisit memos should be per network and shouldn't be cleared on wallet clear (unless user selects it)
    const memosManager = await makeMemosManager(accountStorage.join('memos/'))
    const {balanceManager} = buildPortfolioBalanceManager({
      primaryTokenInfo,
      tokenManager,
      networkRootStorage,
    })(id)
    // TODO: protocolParams needs update when epoch changes, this also should trigger
    // the calculation of locked deposit, since the cost can change
    const protocolParams = await networkManager.api.protocolParams()

    const state: WalletState = {
      id,
      publicKeyHex: accountPubKeyHex || '', // Empty for read-only and multisig wallets
      rewardAddressHex: finalRewardAddressHex,
      accountManager,
      utxoManager,
      utxos: utxoManager.initialUtxos,
      collateralId: utxoManager.initialCollateralId,
      transactionManager,
      memosManager,
      balanceManager,
      portfolioPrimaryTokenInfo: primaryTokenInfo,
      accountVisual,
      protocolParams,
      encryptedStorage: makeWalletEncryptedStorage(id),
      isInitialized: false,
      subscriptions: [],
      onTxHistoryUpdateSubscriptions: [],
      dependencies: {
        toLedgerSignRequest,
        toBalanceManagerSyncArgs,
        createCollateralEntry,
      },
      ...(multisigMeta !== undefined && {multisigMeta}),
    }

    const wallet = createWalletObject(
      state,
      networkManager,
      implementationConfig,
      appApi,
      implementation,
    )

    if (!isYoroiWallet(wallet))
      throwLoggedError(getLogger())('ShelleyWallet: build invalid wallet')

    state.isInitialized = true
    notifyWallet(state, {type: 'initialize'})

    return wallet
  }

  return {
    build,
    calcChecksum: walletChecksum,
    implementation,
    makeKeys: keyManager(implementation),
  }
}

function createWalletObject(
  state: WalletState,
  networkManager: Network.Manager,
  implementationConfig: (typeof cardanoConfig.implementations)[Wallet.Implementation],
  appApi: App.Api,
  implementation: Wallet.Implementation,
): YoroiWallet {
  const notify = (event: WalletEvent) => {
    state.subscriptions.forEach((handler) => handler(event))
  }

  const notifyOnTxHistoryUpdate = (wallet: YoroiWallet) => {
    state.onTxHistoryUpdateSubscriptions.forEach((handler) => handler(wallet))
  }

  const setupSubscriptions = (walletInstance: YoroiWallet) => {
    state.transactionManager.subscribe(() => notify({type: 'transactions'}))
    state.transactionManager.subscribe(() =>
      notifyOnTxHistoryUpdate(walletInstance),
    )
    // Only set up chain subscriptions for regular account managers
    if ('internalChain' in state.accountManager) {
      state.accountManager.internalChain.addSubscriberToNewAddresses(() =>
        notify({type: 'addresses', addresses: internalAddresses()}),
      )
      state.accountManager.externalChain.addSubscriberToNewAddresses(() =>
        notify({type: 'addresses', addresses: externalAddresses()}),
      )
    }
    // Multisig wallets use fixed script addresses, so no need for address subscriptions
  }

  // account
  const internalChain = () => {
    // Multisig account manager doesn't have chains, return a mock chain
    if ('internalChain' in state.accountManager) {
      return state.accountManager.internalChain
    }
    // For multisig wallets, return a mock chain that provides addresses
    return {
      addresses: state.accountManager.internalAddresses(),
      info: {
        lastUsedIndex: 0,
        lastUsedIndexVisual: 0,
        canIncrease: false,
      },
      addSubscriberToNewAddresses: () => {},
    } as AccountManager['internalChain']
  }
  const externalChain = () => {
    // Multisig account manager doesn't have chains, return a mock chain
    if ('externalChain' in state.accountManager) {
      return state.accountManager.externalChain
    }
    // For multisig wallets, return a mock chain that provides addresses
    return {
      addresses: state.accountManager.externalAddresses(),
      info: {
        lastUsedIndex: 0,
        lastUsedIndexVisual: 0,
        canIncrease: false,
      },
      addSubscriberToNewAddresses: () => {},
    } as AccountManager['externalChain']
  }
  const addressesInBlocks = () => {
    if ('getAddressesInBlocks' in state.accountManager) {
      return state.accountManager.getAddressesInBlocks(state.rewardAddressHex)
    }
    // For multisig wallets, return empty array (addresses don't change)
    return []
  }

  const getChangeAddress = (addressMode: Wallet.AddressMode): string => {
    // Multisig wallets use script addresses - return the base address
    if ('getChangeAddress' in state.accountManager) {
      return state.accountManager.getChangeAddress()
    }
    // For regular wallets, use the existing logic
    return getChangeAddressOp(
      {
        externalChain: externalChain(),
        internalChain: internalChain(),
        isUsedAddress: (addr) => isUsedAddress(addr),
      },
      addressMode,
    )
  }

  // -- account -- legacy
  const generateNewReceiveAddress = () => {
    // Multisig wallets use fixed script addresses
    if ('generateNewReceiveAddress' in state.accountManager) {
      return state.accountManager.generateNewReceiveAddress()
    }
    // For regular wallets, use the existing logic
    return generateNewReceiveAddressOp({
      publicKeyHex: state.publicKeyHex,
      externalChain: externalChain(),
      receiveAddressInfo: receiveAddressInfo,
      accountManager: state.accountManager as AccountManager,
      notify: (event) => notify(event),
      receiveAddresses: receiveAddresses,
    })
  }

  const getAddressing = (address: string) => {
    return getAddressingOp(
      address,
      {
        publicKeyHex: state.publicKeyHex,
        accountVisual: state.accountVisual,
        internalChain: internalChain(),
        externalChain: externalChain(),
      },
      implementation,
    )
  }

  const getFirstPaymentAddress = () => {
    return getFirstPaymentAddressOp(externalAddresses())
  }

  const receiveAddresses = (): Address[] => {
    // Multisig wallets have their own receiveAddresses method
    if ('receiveAddresses' in state.accountManager) {
      return state.accountManager.receiveAddresses()
    }
    return externalAddresses()
  }

  const receiveAddressInfo = () => {
    return externalChain().info
  }
  // end of account

  // staking
  const getStakingKey = () => {
    return getStakingKeyOp(
      {
        publicKeyHex: state.publicKeyHex,
        accountVisual: state.accountVisual,
        externalAddresses: externalAddresses(),
        internalAddresses: internalAddresses(),
      },
      implementation,
      networkManager.chainId,
    )
  }

  const getAllUtxosForKey = (): Array<CardanoTypes.CardanoAddressedUtxo> => {
    if (implementationConfig.features.staking) {
      const modernUtxos = getAddressedUtxos()
      const addressedUtxos = modernUtxosToCardanoAddressedUtxos(modernUtxos)
      // Filter synchronously by checking if address contains the staking key
      const stakingKeyHashHex = getStakingKey().hash().toHex()
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
    throwLoggedError(getLogger())('getAllUtxosForKey staking not supported')
    return []
  }

  const getDelegationStatus = (): StakingStatus => {
    if (implementationConfig.features.staking) {
      return getWalletDelegationStatusOp(
        state.rewardAddressHex,
        state.transactionManager.perRewardAddressCertificates,
      )
    }

    throwLoggedError(getLogger())('getDelegationStatus staking not supported')
    return {isRegistered: false}
  }

  const getStakingInfo = async (): Promise<StakingInfo> => {
    if (implementationConfig.features.staking) {
      return getWalletStakingInfoOp({
        rewardAddressHex: state.rewardAddressHex,
        getAllUtxosForKey: () => getAllUtxosForKey(),
        fetchAccountState: () => fetchAccountState(),
        balanceManager: state.balanceManager,
        portfolioPrimaryTokenInfo: state.portfolioPrimaryTokenInfo,
        getDelegationStatus: () => getDelegationStatus(),
      })
    }

    throwLoggedError(getLogger())('getStakingInfo staking not supported')
    return {status: 'not-registered'}
  }
  // end of staking

  // portfolio
  const balances = () => {
    return state.balanceManager.getBalances()
  }

  const primaryBalance = () => {
    return state.balanceManager.getPrimaryBalance()
  }

  const primaryBreakdown = () => {
    return state.balanceManager.getPrimaryBreakdown()
  }

  const hasOnlyPrimary = () => {
    return state.balanceManager.getHasOnlyPrimary()
  }

  const isEmpty = () => {
    return state.balanceManager.getIsEmpty()
  }
  // end of portfolio

  const clear = async () => {
    // Note: The ideal implementation would follow these steps:
    // 1st) Pausing all fetches (all background syncing) utxo/used addresses/token infos
    //      This requires implementing pause/resume mechanisms in utxoManager, transactionManager,
    //      and accountManager to prevent data inconsistency during clearing
    // 2nd) Clearing all data (current implementation)
    // 3rd) Marking all caches as stale (queries etc) - may require query client invalidation
    // 4th) Resuming all syncs
    // NOTE: There is room for data inconsistency here without proper sync pausing

    // NOTE: this will invalidate all tokens for that network which means other wallets will be affected too
    networkManager.tokenManager.clear({
      sourceId: `resync-wallet-${state.id}`,
    })

    // Note: Account clearing would require iterating through all accounts and clearing their data
    // Currently, accountManager doesn't have a clear() method, and accounts are managed per accountVisual
    // This would need to be implemented if multi-account support is added
    state.balanceManager.clear()
    await state.transactionManager.clear()
    state.transactionManager.resetState()
    await state.utxoManager.clear()
  }

  const saveMemo = (txId: string, memo: string): Promise<void> => {
    return state.memosManager.saveMemo(txId, memo)
  }

  // sync
  const sync = async ({
    isForced = false,
    tipStatus,
  }: {
    isForced?: boolean
    tipStatus?: TipStatusResponse | null
  } = {}) => {
    if (!state.isInitialized) {
      getLogger().error('ShelleyWallet: sync wallet not initialized', {
        id: state.id,
      })
      return Promise.resolve()
    }

    const walletContext = getWalletContext()
    // Multisig account managers don't need address discovery (fixed script addresses)
    if ('discoverAddresses' in state.accountManager) {
      await state.accountManager.discoverAddresses(walletContext)
    }

    await Promise.all([
      syncUtxos({isForced}),
      state.transactionManager.doSync(
        addressesInBlocks(),
        networkManager.legacyApiBaseUrl,
        walletContext,
        tipStatus,
        isForced,
      ),
    ])
  }

  /**
   * Quick sync that only fetches the first page of transactions.
   * Used during wallet preparation to make the wallet usable quickly.
   * Full sync will continue in the background.
   */
  const quickSync = async ({
    isForced = false,
    tipStatus,
  }: {
    isForced?: boolean
    tipStatus?: TipStatusResponse | null
  } = {}) => {
    if (!state.isInitialized) {
      getLogger().error('ShelleyWallet: quickSync wallet not initialized', {
        id: state.id,
      })
      return Promise.resolve()
    }

    const walletContext = getWalletContext()
    // Multisig account managers don't need address discovery (fixed script addresses)
    if ('discoverAddresses' in state.accountManager) {
      await state.accountManager.discoverAddresses(walletContext)
    }

    await Promise.all([
      syncUtxos({isForced}),
      state.transactionManager.doQuickSync(
        addressesInBlocks(),
        networkManager.legacyApiBaseUrl,
        walletContext,
        tipStatus,
      ),
    ])
  }

  const resync = async () => {
    getLogger().info('resync', {
      walletId: state.id,
      origin: 'CardanoWallet',
    })
    await clear()
    return sync({isForced: true})
  }
  // end sync

  const signRawTx = async (txHex: string, pKeys: CSL.PrivateKey[]) => {
    return signRawTransaction(txHex, pKeys)
  }

  const getAddressedUtxos = (): ModernUtxo[] => {
    // For multisig wallets, we need to use script addresses for addressing
    // Multisig wallets don't have traditional addressing paths
    if (state.multisigMeta) {
      // Multisig wallets use script addresses - all UTXOs belong to the base address
      const baseAddress =
        'baseAddress' in state.accountManager
          ? state.accountManager.baseAddress
          : (externalAddresses()[0] ?? internalAddresses()[0])
      if (!baseAddress) {
        return []
      }
      return utxos().map((utxo) => ({
        ...utxo,
        receiver: baseAddress,
        addressing: {
          path: [],
          startLevel: 0,
        },
      }))
    }
    // Regular wallets use the existing logic
    return getAddressedUtxosOp(
      utxos(),
      {
        publicKeyHex: state.publicKeyHex,
        accountVisual: state.accountVisual,
        internalChain: internalChain(),
        externalChain: externalChain(),
        getAddressing: (address) => getAddressing(address),
      },
      state.portfolioPrimaryTokenInfo.id,
      implementation,
    )
  }

  const signTx = async (
    unsignedTx: UnsignedTransaction,
    decryptedMasterKey: string,
  ) => {
    return signWalletTransactionOp(
      unsignedTx,
      decryptedMasterKey,
      state.accountVisual,
      implementation,
    )
  }

  const ledgerSupportsCIP36 = async (
    useUSB: boolean,
    hwDeviceInfo: HW.DeviceInfo,
  ): Promise<boolean> => {
    if (!hwDeviceInfo) throw new Error('Invalid wallet state')
    return doesCardanoAppVersionSupportCIP36(
      await getCardanoAppMajorVersion(hwDeviceInfo, useUSB),
    )
  }

  const ledgerSupportsCIP1694 = async (
    useUSB: boolean,
    hwDeviceInfo: HW.DeviceInfo,
  ): Promise<boolean> => {
    if (!hwDeviceInfo) throw new Error('Invalid wallet state')
    return doesCardanoAppVersionSupportCIP1694(
      await getCardanoAppMajorVersion(hwDeviceInfo, useUSB),
    )
  }

  const signRawTxWithLedger = async (
    cbor: string,
    useUSB: boolean,
    hwDeviceInfo: HW.DeviceInfo,
  ): Promise<void> => {
    let stakingAddressing: number[] | undefined
    if (implementationConfig.features.staking) {
      stakingAddressing = Array.from(
        implementationConfig.features.staking.addressing,
      ) as number[]
    }

    const addressingMap = await getHexAddressingMap(wallet)
    const payload = await CardanoMobileWrapped.cslScope(async (csl) => {
      return await state.dependencies.toLedgerSignRequest(
        csl,
        cbor,
        networkManager.chainId,
        networkManager.protocolMagic,
        addressingMap,
        addressingMap,
        modernUtxosToCardanoAddressedUtxos(getAddressedUtxos()),
        [],
        stakingAddressing,
      )
    })

    const signedLedgerTx = await signTxWithLedgerHW(
      payload,
      hwDeviceInfo,
      useUSB,
    )

    const bytes = await createSignedLedgerTxFromCbor(
      cbor,
      signedLedgerTx as SignedTransactionData,
      implementationConfig.derivations.base.harden.purpose,
      state.publicKeyHex,
    )

    const base64 = Branded.asTransactionCborBase64(
      Buffer.from(bytes).toString('base64'),
    )
    await submitTransaction(base64)
  }

  const signTxWithLedger = async (
    unsignedTx: UnsignedTransaction,
    useUSB: boolean,
    hwDeviceInfo: HW.DeviceInfo,
  ): Promise<CSL.Transaction> => {
    if (!unsignedTx.cbor) {
      throw new Error('UnsignedTransaction must have CBOR to sign with Ledger')
    }

    const appAdaVersion = await getCardanoAppMajorVersion(hwDeviceInfo, useUSB)

    // Check for voting registration in metadata (label 61284 = CatalystLabels.DATA)
    const hasVotingRegistration = unsignedTx.metadata?.some(
      (meta) => String(meta.label) === '61284' || Number(meta.label) === 61284,
    )

    if (
      !doesCardanoAppVersionSupportCIP36(appAdaVersion) &&
      hasVotingRegistration
    ) {
      if (implementationConfig.features.staking) {
        getLogger().info(
          'ShelleyWallet: signTxWithLedger ledger app version <= 5, no CIP-36 support',
          {appAdaVersion},
        )

        const stakingConfig = implementationConfig.features.staking

        // Get change address from UnsignedTransaction options or use default
        const changeAddress =
          unsignedTx.options.changeAddress || getChangeAddress('multiple')
        const addressing = getAddressing(changeAddress)
        const changeAddr = {
          address:
            typeof changeAddress === 'string'
              ? Branded.asAddress(changeAddress)
              : changeAddress,
          addressing,
        }

        // Convert UnsignedTransaction to LedgerUnsignedTx format
        return CardanoMobileWrapped.cslScope(async (csl) => {
          const ledgerUnsignedTx = adaptToLedgerUnsignedTx(csl, unsignedTx, [
            changeAddr,
          ])

          const ledgerPayload = await buildVotingLedgerPayloadV5(
            csl,
            ledgerUnsignedTx,
            networkManager.chainId,
            networkManager.protocolMagic,
            Array.from(stakingConfig.addressing),
          )

          const signedLedgerTx = await signTxWithLedgerHW(
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
              originalTxCbor: unsignedTx.cbor, // Preserve native scripts for multisig
            },
            signedLedgerTx,
            implementationConfig.derivations.base.harden.purpose,
            state.publicKeyHex,
            false,
          )

          // Convert signed transaction bytes to Transaction object
          const signedTx = await CardanoMobileWrapped.cslScope(async (csl) => {
            return await csl.Transaction.fromBytes(signedTxResult.encodedTx)
          })

          return signedTx
        })
      }

      throwLoggedError(getLogger())(
        'signTxWithLedger voting registration staking not supported',
      )
    }

    getLogger().info(
      'ShelleyWallet: signTxWithLedger ledger app version > 5, using CIP-36',
      {appAdaVersion},
    )

    // Get change address from UnsignedTransaction options or use default
    const changeAddress =
      unsignedTx.options.changeAddress || getChangeAddress('multiple')
    const addressing = getAddressing(changeAddress)
    const changeAddr = {
      address:
        typeof changeAddress === 'string'
          ? Branded.asAddress(changeAddress)
          : changeAddress,
      addressing,
    }

    // Convert UnsignedTransaction to LedgerUnsignedTx format
    return CardanoMobileWrapped.cslScope(async (csl) => {
      const ledgerUnsignedTx = adaptToLedgerUnsignedTx(csl, unsignedTx, [
        changeAddr,
      ])

      let stakingAddressing: number[] | undefined
      if (implementationConfig.features.staking) {
        stakingAddressing = Array.from(
          implementationConfig.features.staking.addressing,
        ) as number[]
      }

      const ledgerPayload = await buildLedgerPayload(
        csl,
        ledgerUnsignedTx,
        networkManager.chainId,
        networkManager.protocolMagic,
        stakingAddressing,
      )

      const signedLedgerTx = await signTxWithLedgerHW(
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
          originalTxCbor: unsignedTx.cbor, // Preserve native scripts for multisig
        },
        signedLedgerTx,
        implementationConfig.derivations.base.harden.purpose,
        state.publicKeyHex,
        true,
        datumDatas.length > 0 ? datumDatas : undefined,
      )

      // Convert signed transaction bytes to Transaction object
      const signedTx = await CardanoMobileWrapped.cslScope(async (csl) => {
        return await csl.Transaction.fromBytes(signedTxResult.encodedTx)
      })

      return signedTx
    })
  }

  // =================== backend API =================== //

  const checkServerStatus = async (): Promise<ServerStatus> => {
    const result = await legacyApi.checkServerStatus(
      networkManager.legacyApiBaseUrl,
    )
    return {
      ...result,
      isMaintenance: false,
    }
  }

  const submitTransaction = async (base64SignedTx: TransactionCborBase64) => {
    await legacyApi.submitTransaction(
      base64SignedTx,
      networkManager.legacyApiBaseUrl,
    )
  }

  const syncUtxos = async ({isForced = false}: {isForced?: boolean} = {}) => {
    const addresses = [...internalAddresses(), ...externalAddresses()]

    await state.utxoManager.sync(addresses)
    const newUtxos = await state.utxoManager.getCachedUtxos()

    // Auto-detect and save collateral ID if not set but a matching UTXO exists
    // This handles the case where a wallet is restored with an existing collateral UTXO
    if (state.collateralId.length === 0) {
      const utxosList = utxosMaker(newUtxos)
      const potentialCollateralId = utxosList.drawnCollateral()
      if (potentialCollateralId) {
        const collateralIdBranded = Branded.asUtxoId(potentialCollateralId)
        await state.utxoManager.setCollateralId(collateralIdBranded)
        state.collateralId = potentialCollateralId
        notify({type: 'collateral-id', collateralId: collateralIdBranded})
        getLogger().info('syncUtxos: Auto-detected and saved collateral ID', {
          collateralId: potentialCollateralId,
        })
      }
    }

    // NOTE: wallet is not aware of utxos state
    // if it crashes, the utxo manager will be out of sync with wallet
    if (didUtxosUpdate(state.utxos, newUtxos) || isForced) {
      // Exclude collateral UTXO from locked deposit calculation
      // Collateral is not a storage cost, it's locked for DApp transactions
      const spendableUtxos = getSpendableUtxosOp(newUtxos, state.collateralId)

      // NOTE: recalc locked deposit should happen also when epoch changes after conway
      // Only calculate locked deposit for spendable UTXOs (exclude collateral)
      const lockedAsStorageCost = await calcLockedDeposit({
        rawUtxos: spendableUtxos,
        coinsPerUtxoByteStr: state.protocolParams.coinsPerUtxoByte,
      })

      // Include all UTXOs (including collateral) in total balance
      // Collateral is owned by the wallet and should appear in total balance
      const balancesToSync = state.dependencies.toBalanceManagerSyncArgs(
        newUtxos,
        BigInt(lockedAsStorageCost.toString()),
      )

      state.balanceManager.syncBalances(balancesToSync)

      state.utxos = newUtxos
      notify({type: 'utxos', utxos: utxos()})
      return true
    }
    return false
  }

  const utxos = (): Array<RawUtxo> => {
    return _getUtxos(state.utxos, state.collateralId)
  }

  const allUtxos = (): Array<RawUtxo> => {
    return state.utxos
  }

  const collateralId = (): string => {
    return state.collateralId
  }

  const getCollateralInfo = () => {
    const utxosList = utxosMaker(state.utxos)
    const collateralIdValue = collateralId()
    const collateralIdBranded = Branded.asUtxoId(collateralIdValue)
    const collateralUtxo = utxosList.findById(collateralIdBranded)
    const quantity =
      collateralUtxo?.amount !== undefined && !(collateralUtxo.amount === '')
        ? BigInt(collateralUtxo?.amount)
        : 0n
    const collateralTxId = collateralIdValue
      ? Branded.asTransactionHash(collateralIdValue.split(':')[0]!)
      : null
    const isConfirmed =
      !!collateralTxId && getRawTransaction(collateralTxId) !== undefined

    return freeze({
      utxo: collateralUtxo,
      amount: {
        quantity,
        info: state.portfolioPrimaryTokenInfo,
      } as Portfolio.Token.Amount,
      collateralId: collateralIdBranded,
      isConfirmed,
    })
  }

  const setCollateralId = async (id: RawUtxo['utxo_id']): Promise<void> => {
    const idBranded = Branded.asUtxoId(id)
    await state.utxoManager.setCollateralId(idBranded)
    state.collateralId = id
    notify({type: 'collateral-id', collateralId: idBranded})
  }

  const didUtxosUpdate = (
    oldUtxos: RawUtxo[],
    newUtxos: RawUtxo[],
  ): boolean => {
    return didUtxosUpdateOp(oldUtxos, newUtxos)
  }

  /**
   * Get wallet context for backend-zero registration
   * Returns undefined if wallet cannot be registered
   * Public method to allow transaction recipes to pass context to API calls
   */
  const getWalletContext = ():
    | {
        walletId: string
        publicKeyHex?: string
        accountPubKeyHex?: string
        paymentKeyHashes: string[]
        rewardAddresses: string[]
      }
    | undefined => {
    const registrationData = getWalletRegistrationData({
      id: state.id,
      publicKeyHex: state.publicKeyHex,
      accountPubKeyHex: state.publicKeyHex, // accountPubKeyHex is same as publicKeyHex for CardanoWallet
      externalAddresses: externalAddresses(),
      internalAddresses: internalAddresses(),
      rewardAddressHex: state.rewardAddressHex,
    })

    if (!registrationData) return undefined

    return {
      walletId: registrationData.id,
      publicKeyHex: state.publicKeyHex,
      accountPubKeyHex: state.publicKeyHex, // accountPubKeyHex is same as publicKeyHex for CardanoWallet
      paymentKeyHashes: registrationData.paymentKeyHashes,
      rewardAddresses: registrationData.rewardAddresses,
    }
  }

  const fetchAccountState = async (): Promise<AccountStateResponse> => {
    // Extract payment key hashes from wallet addresses for wallet registration
    const allAddresses = [...externalAddresses(), ...internalAddresses()]
    const paymentKeyHashes = extractPaymentKeyHashes(allAddresses) as KeyHash[]
    const rewardAddresses = [Branded.asAddress(state.rewardAddressHex)]

    return legacyApi.bulkGetAccountState(
      [Branded.asAddress(state.rewardAddressHex)],
      networkManager.legacyApiBaseUrl,
      {
        walletId: state.id,
        publicKeyHex: state.publicKeyHex as PublicKeyHex,
        accountPubKeyHex: state.publicKeyHex as PublicKeyHex,
        paymentKeyHashes,
        rewardAddresses,
      },
    )
  }

  const fetchPoolInfo = async (request: StakePoolInfoRequest) => {
    return legacyApi.getPoolInfo(request, networkManager.legacyApiBaseUrl)
  }

  const fetchFundInfo = async (): Promise<FundInfoResponse> => {
    return legacyApi.getFundInfo(networkManager.legacyApiBaseUrl)
  }

  const fetchTxStatus = async (
    request: TxStatusRequest,
  ): Promise<TxStatusResponse> => {
    return legacyApi.fetchTxStatus(request, networkManager.legacyApiBaseUrl)
  }

  // =================== getters =================== //
  const internalAddresses = (): Address[] => {
    // Multisig account manager has its own internalAddresses method
    if ('internalAddresses' in state.accountManager) {
      return state.accountManager.internalAddresses()
    }
    return internalChain().addresses
  }

  const externalAddresses = (): Address[] => {
    // Multisig account manager has its own externalAddresses method
    if ('externalAddresses' in state.accountManager) {
      return state.accountManager.externalAddresses()
    }
    return externalChain().addresses
  }

  const isUsedAddressIndex = (): Record<string, boolean> => {
    return _isUsedAddressIndexSelector(state.transactionManager.perAddressTxs)
  }

  const confirmationCounts = (): Record<string, null | number> => {
    return state.transactionManager.confirmationCounts
  }

  const getRawTransaction = (txId: string): WalletTransaction | undefined => {
    return state.transactionManager.transactions[
      Branded.asTransactionHash(txId)
    ]
  }

  const getRawTransactions = (): Record<string, WalletTransaction> => {
    return state.transactionManager.transactions
  }

  const addOptimisticTransaction = (tx: WalletTransaction): void => {
    state.transactionManager.addOptimisticTransaction(tx)
  }

  // =================== subscriptions =================== //
  const subscribe = (subscription: WalletSubscription) => {
    state.subscriptions.push(subscription)

    return () => {
      state.subscriptions = state.subscriptions.filter(
        (sub) => sub !== subscription,
      )
    }
  }

  const subscribeOnTxHistoryUpdate = (subscription: () => void) => {
    state.onTxHistoryUpdateSubscriptions.push(subscription)

    return () => {
      state.onTxHistoryUpdateSubscriptions =
        state.onTxHistoryUpdateSubscriptions.filter(
          (sub) => sub !== subscription,
        )
    }
  }

  const isUsedAddress = (address: string) => {
    const perAddressTxs = state.transactionManager.perAddressTxs
    const txs = perAddressTxs[Branded.asAddress(address)]
    return !!txs && txs.length > 0
  }

  const wallet: YoroiWallet & {
    _dependencies: Pick<
      CardanoWalletDependencies,
      | 'toLedgerSignRequest'
      | 'toBalanceManagerSyncArgs'
      | 'createCollateralEntry'
    >
  } = {
    id: state.id,
    publicKeyHex: state.publicKeyHex,
    protocolParams: state.protocolParams,
    portfolioPrimaryTokenInfo: state.portfolioPrimaryTokenInfo,
    networkManager: networkManager,
    isMainnet: networkManager.isMainnet,
    balanceManager: state.balanceManager,
    balance$: state.balanceManager.observable$,
    accountVisual: state.accountVisual,
    api: appApi,
    rewardAddressHex: state.rewardAddressHex,
    encryptedStorage: state.encryptedStorage,
    _dependencies: state.dependencies,
    // account chains - exposed directly
    externalChain: externalChain(),
    internalChain: internalChain(),
    // portfolio functions
    balances,
    primaryBalance,
    primaryBreakdown,
    isEmpty,
    hasOnlyPrimary,
    // sync functions
    resync,
    clear,
    sync,
    quickSync,
    // account functions
    receiveAddressInfo,
    signRawTx,
    getAddressing,
    signTx,
    submitTransaction,
    // ledger functions
    signTxWithLedger,
    ledgerSupportsCIP36,
    ledgerSupportsCIP1694,
    signRawTxWithLedger,
    // voting functions
    fetchFundInfo,
    // staking functions
    getDelegationStatus,
    getAllUtxosForKey,
    getStakingInfo,
    fetchAccountState,
    fetchPoolInfo,
    getStakingKey,
    // address functions
    externalAddresses,
    internalAddresses,
    isUsedAddressIndex,
    receiveAddresses,
    generateNewReceiveAddress,
    getChangeAddress,
    // transaction functions
    saveMemo,
    getRawTransaction,
    getRawTransactions,
    confirmationCounts,
    fetchTxStatus,
    addOptimisticTransaction,
    // utxo functions
    utxos,
    allUtxos,
    collateralId,
    getCollateralInfo,
    setCollateralId,
    // other functions
    subscribe,
    subscribeOnTxHistoryUpdate,
    checkServerStatus,
    getFirstPaymentAddress,
    getWalletContext,
  }

  setupSubscriptions(wallet)

  return wallet
}

function notifyWallet(state: WalletState, event: WalletEvent) {
  state.subscriptions.forEach((handler) => handler(event))
}
