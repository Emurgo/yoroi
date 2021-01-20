// @flow
import {mapValues, isEmpty, fromPairs} from 'lodash'
import {BigNumber} from 'bignumber.js'
import {createSelector} from 'reselect'

import {processTxHistoryData} from './crypto/processTransactions'
import {
  TRANSACTION_STATUS,
  TRANSACTION_DIRECTION,
} from './types/HistoryTransaction'
import {ObjectValues} from './utils/flow'
import {MultiToken, getDefaultNetworkTokenEntry} from './crypto/MultiToken'
import {getDefaultAssets, getDefaultAssetByNetworkId} from './config/config'

import type {State, WalletMeta} from './state'
import type {
  TransactionInfo,
  Transaction,
  Token,
  DefaultAsset,
} from './types/HistoryTransaction'
import type {NetworkId} from './config/types'
import type {RawUtxo} from './api/types'
import type {HWDeviceInfo} from './crypto/shelley/ledgerUtils'

export const transactionsInfoSelector: (State) => Dict<
  TransactionInfo,
> = createSelector(
  (state) => state.wallet.transactions,
  (state) => state.wallet.internalAddresses,
  (state) => state.wallet.externalAddresses,
  (state) => state.wallet.rewardAddressHex,
  (state) => state.wallet.confirmationCounts,
  (state) => state.wallet.networkId,
  (
    transactions,
    internalAddresses,
    externalAddresses,
    rewardAddressHex,
    confirmationCounts,
    networkId,
  ) =>
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

export const hasAnyTransaction = (state: State): boolean =>
  !isEmpty(state.wallet.transactions)

const _initAssetsRegistry = (networkId: NetworkId): Dict<DefaultAsset> =>
  fromPairs(
    getDefaultAssets()
      .filter((asset) => asset.networkId === networkId)
      .map((asset) => [asset.identifier, asset]),
  )

export const availableAssetsSelector: (
  state: State,
) => Dict<Token> = createSelector(
  transactionsInfoSelector,
  (state) => state.wallet.networkId,
  (txs, networkId) => {
    const tokens: Dict<Token> = fromPairs(
      ObjectValues(_initAssetsRegistry(networkId)).map((asset) => [
        asset.identifier,
        {
          ...asset,
          metadata: {
            ...asset.metadata,
            ticker: asset.metadata.ticker,
          },
        },
      ]),
    )
    ObjectValues(txs).forEach((tx) => Object.assign(tokens, tx.tokens))
    return tokens
  },
)

export const defaultNetworkAssetSelector: (
  state: State,
) => DefaultAsset = createSelector(
  (state) => state.wallet.networkId,
  (networkId) => getDefaultAssetByNetworkId(networkId),
)

export const internalAddressIndexSelector: (
  state: State,
) => Object = createSelector(
  (state) => state.wallet.internalAddresses,
  (addresses) => fromPairs(addresses.map((addr, i) => [addr, i])),
)

export const externalAddressIndexSelector: (
  state: State,
) => Object = createSelector(
  (state) => state.wallet.externalAddresses,
  (addresses) => fromPairs(addresses.map((addr, i) => [addr, i])),
)

export const isUsedAddressIndexSelector = (state: State) =>
  state.wallet.isUsedAddressIndex

export const isHWSelector = (state: State): boolean => state.wallet.isHW

export const hwDeviceInfoSelector = (state: State): ?HWDeviceInfo =>
  state.wallet.hwDeviceInfo

export const isReadOnlySelector = (state: State): boolean =>
  state.wallet.isReadOnly

export const walletMetaSelector = (
  state: State,
): $Diff<WalletMeta, {id: string}> => ({
  name: state.wallet.name,
  networkId: state.wallet.networkId,
  walletImplementationId: state.wallet.walletImplementationId,
  isHW: state.wallet.isHW,
  isEasyConfirmationEnabled: state.wallet.isEasyConfirmationEnabled,
  checksum: state.wallet.checksum,
})

const BigNumberSum = (data: Array<BigNumber | string>): BigNumber =>
  data.reduce((x: BigNumber, y) => x.plus(y), new BigNumber(0))

export const tokenBalanceSelector: (
  state: State,
) => MultiToken = createSelector(
  transactionsInfoSelector,
  walletMetaSelector,
  (transactions, walletMeta) => {
    const processed = ObjectValues(transactions).filter(
      (tx) => tx.status === TRANSACTION_STATUS.SUCCESSFUL,
    )
    const result = processed
      .map((tx) => tx.delta)
      .reduce(
        (acc, curr) => acc.joinAddMutable(curr),
        new MultiToken([], getDefaultNetworkTokenEntry(walletMeta.networkId)),
      )
    return result
  },
)

export const receiveAddressesSelector: (
  state: State,
) => Array<string> = createSelector(
  (state) => state.wallet.externalAddresses,
  (state) => state.wallet.numReceiveAddresses,
  (addresses, count) => addresses.slice(0, count),
)

export const canGenerateNewReceiveAddressSelector = (state: State) =>
  state.wallet.canGenerateNewReceiveAddress

export const isOnlineSelector = (state: State): boolean => state.isOnline

export const isSynchronizingHistorySelector = (state: State): boolean =>
  state.txHistory.isSynchronizing

export const lastHistorySyncErrorSelector = (state: State): any =>
  state.txHistory.lastSyncError

export const getUtxoBalance = (utxos: Array<RawUtxo>): BigNumber =>
  BigNumberSum(utxos.map(({amount}) => amount))

export const utxoBalanceSelector = (state: State): ?BigNumber =>
  state.balance.isFetching || !state.balance.utxos
    ? null
    : getUtxoBalance(state.balance.utxos)

// accountState

export const isFetchingAccountStateSelector = (state: State): boolean =>
  state.accountState.isFetching

export const isDelegatingSelector = (state: State): boolean =>
  state.accountState.isDelegating

export const lastAccountStateFetchErrorSelector = (state: State): any =>
  state.accountState.lastFetchingError

export const accountValueSelector = (state: State): BigNumber =>
  state.accountState.value

export const accountBalanceSelector = (state: State): ?BigNumber =>
  state.accountState.isFetching ? null : state.accountState.value

export const totalDelegatedSelector = (state: State): ?BigNumber =>
  state.accountState.isFetching ? null : state.accountState.totalDelegated

export const poolOperatorSelector = (state: State) =>
  state.accountState.isFetching ? null : state.accountState.poolOperator

// PoolInfo

export const isFetchingPoolInfoSelector = (state: State): boolean =>
  state.poolInfo.isFetching

export const lastPoolInfoErrorSelector = (state: State): any =>
  state.poolInfo.lastFetchingError

export const poolInfoSelector = (state: State) =>
  state.poolInfo.isFetching ? null : state.poolInfo.meta

export const walletIsInitializedSelector = (state: State): boolean =>
  state.wallet.isInitialized

export const walletNameSelector = (state: State): string => state.wallet.name

export const walletNamesSelector = (state: State): Array<string> =>
  ObjectValues(state.wallets).map((w) => w.name)

export const isFetchingUtxosSelector = (state: State): boolean =>
  state.balance.isFetching

export const lastUtxosFetchErrorSelector = (state: State): any =>
  state.balance.lastFetchingError

export const utxosSelector = (state: State): ?Array<RawUtxo> =>
  state.balance.utxos

// app-related selectors

export const biometricHwSupportSelector = (state: State): boolean =>
  state.appSettings.isBiometricHardwareSupported

export const isSystemAuthEnabledSelector = (state: State): boolean =>
  state.appSettings.isSystemAuthEnabled

export const sendCrashReportsSelector = (state: State): boolean =>
  state.appSettings.sendCrashReports

export const hasPendingOutgoingTransactionSelector: (
  state: State,
) => boolean = createSelector(transactionsInfoSelector, (transactions) =>
  ObjectValues(transactions).some(
    (tx) =>
      tx.status === TRANSACTION_STATUS.PENDING &&
      tx.direction !== TRANSACTION_DIRECTION.RECEIVED,
  ),
)

export const easyConfirmationSelector = (state: State): boolean =>
  state.wallet.isEasyConfirmationEnabled

export const customPinHashSelector = (state: State): ?string =>
  state.appSettings.customPinHash

export const isAppInitializedSelector = (state: State): boolean =>
  state.isAppInitialized

export const isAuthenticatedSelector = (state: State): boolean =>
  state.isAuthenticated

export const installationIdSelector = (state: State): ?string =>
  state.appSettings.installationId

export const tosSelector = (state: State): boolean =>
  state.appSettings.acceptedTos

export const languageSelector = (state: State): string =>
  state.appSettings.languageCode || ''

export const currentVersionSelector = (state: State): ?string =>
  state.appSettings.currentVersion

export const isKeyboardOpenSelector = (state: State): boolean =>
  state.isKeyboardOpen

export const isFlawedWalletSelector = (state: State): boolean =>
  state.isFlawedWallet

export const isMaintenanceSelector = (state: State): boolean =>
  state.isMaintenance

/**
 * Before users can actually create a wallet, 3 steps must be completed:
 * - language selection (though en-US is set by default)
 * - Terms of service acceptance
 * - Authentication system setup (based on pin or biometrics)
 */
export const isAppSetupCompleteSelector: (
  state: State,
) => boolean = createSelector(
  tosSelector,
  isSystemAuthEnabledSelector,
  customPinHashSelector,
  (acceptedTos, isSystemAuthEnabled, customPinHash) =>
    acceptedTos && (isSystemAuthEnabled || customPinHash != null),
)
