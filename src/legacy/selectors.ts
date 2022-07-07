/* eslint-disable @typescript-eslint/no-explicit-any */
import {BigNumber} from 'bignumber.js'
import {fromPairs, mapValues} from 'lodash'
import {createSelector} from 'reselect'

import type {State, WalletMeta} from '../legacy/state'
import {getDefaultNetworkTokenEntry, MultiToken} from '../yoroi-wallets'
import {getCardanoDefaultAsset, getDefaultAssetByNetworkId, getDefaultAssets} from './config'
import {ObjectValues} from './flow'
import type {DefaultAsset, Token, Transaction, TransactionInfo} from './HistoryTransaction'
import {TRANSACTION_DIRECTION, TRANSACTION_STATUS} from './HistoryTransaction'
import type {HWDeviceInfo} from './ledgerUtils'
import {processTxHistoryData} from './processTransactions'
import type {NetworkId} from './types'
import type {RawUtxo} from './types'
import {NETWORK_REGISTRY} from './types'

export const transactionsInfoSelector: (arg0: State) => Record<string, TransactionInfo> = createSelector(
  (state: State) => state.wallet.transactions,
  (state: State) => state.wallet.internalAddresses,
  (state: State) => state.wallet.externalAddresses,
  (state: State) => state.wallet.rewardAddressHex,
  (state: State) => state.wallet.confirmationCounts,
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  (state: State) => state.wallet.networkId!,
  (transactions, internalAddresses, externalAddresses, rewardAddressHex, confirmationCounts, networkId) =>
    mapValues(transactions, (tx: Transaction) =>
      processTxHistoryData(
        tx,
        rewardAddressHex != null
          ? [...internalAddresses, ...externalAddresses, ...[rewardAddressHex]]
          : [...internalAddresses, ...externalAddresses],
        confirmationCounts[tx.id] || 0,
        networkId,
      ),
    ),
)

const _initAssetsRegistry = (networkId: NetworkId): Record<string, DefaultAsset> =>
  fromPairs(
    getDefaultAssets()
      .filter((asset) => asset.networkId === networkId)
      .map((asset) => [asset.identifier, asset]),
  )

export const availableAssetsSelector: (state: State) => Record<string, Token> = createSelector(
  transactionsInfoSelector,
  (state) => state.wallet.networkId,
  (txs, networkId) => {
    if (networkId === NETWORK_REGISTRY.UNDEFINED) {
      const defaultAsset = getCardanoDefaultAsset()
      return {
        [defaultAsset.identifier]: defaultAsset,
      }
    }

    const tokens: Record<string, Token> = fromPairs(
      ObjectValues(_initAssetsRegistry(networkId)).map((asset) => [
        asset.identifier,
        {
          ...asset,
          metadata: {...asset.metadata, ticker: asset.metadata.ticker},
        },
      ]),
    )
    ObjectValues(txs).forEach((tx: any) => {
      ObjectValues(tx.tokens).forEach((token: any) => {
        if (tokens[token.identifier] == null) {
          tokens[token.identifier] = token
        }
      })
    })
    return tokens
  },
)
export const defaultNetworkAssetSelector: (state: State) => DefaultAsset = createSelector(
  (state) => state.wallet.networkId,
  (networkId) => {
    if (networkId === NETWORK_REGISTRY.UNDEFINED) {
      return getCardanoDefaultAsset()
    }

    return getDefaultAssetByNetworkId(networkId)
  },
)
export const internalAddressIndexSelector: (state: State) => Record<string, number> = createSelector(
  (state: State) => state.wallet.internalAddresses,
  (addresses) => fromPairs(addresses.map((addr, i) => [addr, i])),
)
export const externalAddressIndexSelector: (state: State) => Record<string, number> = createSelector(
  (state: State) => state.wallet.externalAddresses,
  (addresses) => fromPairs(addresses.map((addr, i) => [addr, i])),
)
export const isUsedAddressIndexSelector = (state: State) => state.wallet.isUsedAddressIndex
export const isHWSelector = (state: State): boolean => state.wallet.isHW
export const hwDeviceInfoSelector = (state: State): HWDeviceInfo | null | undefined => state.wallet.hwDeviceInfo
export const isReadOnlySelector = (state: State) => state.wallet.isReadOnly
export const walletMetaSelector = (state: State): WalletMeta =>
  ({
    id: state.wallet.id,
    name: state.wallet.name,
    networkId: state.wallet.networkId,
    walletImplementationId: state.wallet.walletImplementationId,
    provider: state.wallet.provider,
    isHW: state.wallet.isHW,
    isEasyConfirmationEnabled: state.wallet.isEasyConfirmationEnabled,
    checksum: state.wallet.checksum,
  } as unknown as WalletMeta)

export const tokenBalanceSelector: (state: State) => MultiToken = createSelector(
  transactionsInfoSelector,
  walletMetaSelector,
  (transactions, walletMeta) => {
    if (walletMeta.networkId === NETWORK_REGISTRY.UNDEFINED) {
      const defaultAsset = getCardanoDefaultAsset()
      return new MultiToken([], {
        defaultNetworkId: defaultAsset.networkId,
        defaultIdentifier: defaultAsset.identifier,
      })
    }

    const processed = ObjectValues(transactions).filter((tx) => tx.status === TRANSACTION_STATUS.SUCCESSFUL)
    const rawBalance = processed
      .map((tx) => MultiToken.fromArray(tx.delta))
      .reduce(
        (acc, curr) => acc.joinAddMutable(curr),
        new MultiToken([], getDefaultNetworkTokenEntry(walletMeta.networkId)),
      )
    const positiveBalance = rawBalance.asArray().filter((value) => {
      if (value.isDefault) return true // keep ADA or any other default asset

      return new BigNumber(value.amount).gt(0)
    })
    return MultiToken.fromArray(positiveBalance)
  },
)
export const receiveAddressesSelector: (state: State) => Array<string> = createSelector(
  (state) => state.wallet.externalAddresses,
  (state) => state.wallet.numReceiveAddresses,
  (addresses, count) => addresses.slice(0, count),
)
export const canGenerateNewReceiveAddressSelector = (state: State) => state.wallet.canGenerateNewReceiveAddress
export const isOnlineSelector = (state: State): boolean => state.isOnline
export const isSynchronizingHistorySelector = (state: State): boolean => state.txHistory.isSynchronizing
export const lastHistorySyncErrorSelector = (state: State) => state.txHistory.lastSyncError
// accountState
export const isFetchingAccountStateSelector = (state: State): boolean => state.accountState.isFetching
export const isDelegatingSelector = (state: State): boolean => state.accountState.isDelegating
export const lastAccountStateFetchErrorSelector = (state: State) => state.accountState.lastFetchingError
export const accountBalanceSelector = (state: State): BigNumber | null | undefined =>
  state.accountState.isFetching ? null : state.accountState.value
export const poolOperatorSelector = (state: State) =>
  state.accountState.isFetching ? null : state.accountState.poolOperator
// TokenInfo
export const walletIsInitializedSelector = (state: State): boolean => state.wallet.isInitialized
export const isFetchingUtxosSelector = (state: State): boolean => state.balance.isFetching
export const lastUtxosFetchErrorSelector = (state: State) => state.balance.lastFetchingError
export const utxosSelector = (state: State): Array<RawUtxo> | null | undefined => state.balance.utxos
// app-related selectors
export const biometricHwSupportSelector = (state: State): boolean => state.appSettings.isBiometricHardwareSupported
export const canEnableBiometricSelector = (state: State): boolean => state.appSettings.canEnableBiometricEncryption
export const isSystemAuthEnabledSelector = (state: State): boolean => state.appSettings.isSystemAuthEnabled
export const sendCrashReportsSelector = (state: State): boolean => state.appSettings.sendCrashReports
export const hasPendingOutgoingTransactionSelector: (state: State) => boolean = createSelector(
  transactionsInfoSelector,
  (transactions) =>
    ObjectValues(transactions).some(
      (tx) => tx.status === TRANSACTION_STATUS.PENDING && tx.direction !== TRANSACTION_DIRECTION.RECEIVED,
    ),
)
export const easyConfirmationSelector = (state: State): boolean => state.wallet.isEasyConfirmationEnabled
export const customPinHashSelector = (state: State) => state.appSettings.customPinHash
export const isAppInitializedSelector = (state: State): boolean => state.isAppInitialized
export const isAuthenticatedSelector = (state: State): boolean => state.isAuthenticated
export const installationIdSelector = (state: State) => state.appSettings.installationId
export const tosSelector = (state: State): boolean => state.appSettings.acceptedTos
export const isMaintenanceSelector = (state: State): boolean => state.serverStatus.isMaintenance
export const serverStatusSelector = (state: State) => state.serverStatus

/**
 * Before users can actually create a wallet, 3 steps must be completed:
 * - language selection (though en-US is set by default)
 * - Terms of service acceptance
 * - Authentication system setup (based on pin or biometrics)
 */
export const isAppSetupCompleteSelector: (state: State) => boolean = createSelector(
  tosSelector,
  isSystemAuthEnabledSelector,
  customPinHashSelector,
  (acceptedTos, isSystemAuthEnabled, customPinHash) => acceptedTos && (isSystemAuthEnabled || customPinHash != null),
)
