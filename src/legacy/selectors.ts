/* eslint-disable @typescript-eslint/no-explicit-any */
import {BigNumber} from 'bignumber.js'
import {fromPairs, mapValues} from 'lodash'
import {createSelector} from 'reselect'

import type {State} from '../legacy/state'
import {getDefaultNetworkTokenEntry, MultiToken} from '../yoroi-wallets'
import {DefaultAsset, Token} from '../yoroi-wallets/types'
import {RawUtxo, Transaction, TRANSACTION_DIRECTION, TransactionInfo} from '../yoroi-wallets/types/other'
import {NetworkId, TRANSACTION_STATUS} from '../yoroi-wallets/types/other'
import {NETWORK_REGISTRY} from '../yoroi-wallets/types/other'
import {getCardanoDefaultAsset, getDefaultAssets} from './config'
import {ObjectValues} from './flow'
import {processTxHistoryData} from './processTransactions'

export const transactionsInfoSelector: (state: State) => Record<string, TransactionInfo> = createSelector(
  (state: State) => state.wallet,
  (wallet) =>
    mapValues(wallet.transactions, (tx: Transaction) => {
      if (!wallet.networkId) throw new Error('invalid state')
      return processTxHistoryData(
        tx,
        wallet.rewardAddressHex != null
          ? [...wallet.internalAddresses, ...wallet.externalAddresses, ...[wallet.rewardAddressHex]]
          : [...wallet.internalAddresses, ...wallet.externalAddresses],
        wallet.confirmationCounts[tx.id] || 0,
        wallet.networkId,
      )
    }),
)

const _initAssetsRegistry = (networkId: NetworkId): Record<string, DefaultAsset> =>
  fromPairs(
    getDefaultAssets()
      .filter((asset) => asset.networkId === networkId)
      .map((asset) => [asset.identifier, asset]),
  )

export const availableAssetsSelector: (state: State) => Record<string, Token> = createSelector(
  transactionsInfoSelector,
  (state: State) => state.wallet.networkId,
  (txs, networkId) => {
    if (networkId === NETWORK_REGISTRY.UNDEFINED) {
      const defaultAsset = getCardanoDefaultAsset()
      return {
        [defaultAsset.identifier]: defaultAsset,
      }
    }

    if (!networkId) throw new Error('invalid state')

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

export const internalAddressIndexSelector: (state: State) => Record<string, number> = createSelector(
  (state: State) => state.wallet.internalAddresses,
  (addresses) => fromPairs(addresses.map((addr, i) => [addr, i])),
)
export const externalAddressIndexSelector: (state: State) => Record<string, number> = createSelector(
  (state: State) => state.wallet.externalAddresses,
  (addresses) => fromPairs(addresses.map((addr, i) => [addr, i])),
)
export const isUsedAddressIndexSelector = (state: State) => state.wallet.isUsedAddressIndex

export const tokenBalanceSelector: (state: State) => MultiToken = createSelector(
  transactionsInfoSelector,
  (state: State) => state.wallet,
  (transactions, wallet) => {
    if (wallet.networkId === NETWORK_REGISTRY.UNDEFINED) {
      const defaultAsset = getCardanoDefaultAsset()
      return new MultiToken([], {
        defaultNetworkId: defaultAsset.networkId,
        defaultIdentifier: defaultAsset.identifier,
      })
    }

    if (!wallet.networkId) throw new Error('invalid state')

    const processed = ObjectValues(transactions).filter((tx) => tx.status === TRANSACTION_STATUS.SUCCESSFUL)
    const rawBalance = processed
      .map((tx) => MultiToken.fromArray(tx.delta))
      .reduce(
        (acc, curr) => acc.joinAddMutable(curr),
        new MultiToken([], getDefaultNetworkTokenEntry(wallet.networkId)),
      )
    const positiveBalance = rawBalance.asArray().filter((value) => {
      if (value.isDefault) return true // keep ADA or any other default asset

      return new BigNumber(value.amount).gt(0)
    })
    return MultiToken.fromArray(positiveBalance)
  },
)
export const receiveAddressesSelector: (state: State) => Array<string> = createSelector(
  (state: State) => state.wallet.externalAddresses,
  (state: State) => state.wallet.numReceiveAddresses,
  (addresses, count) => addresses.slice(0, count),
)
export const canGenerateNewReceiveAddressSelector = (state: State) => state.wallet.canGenerateNewReceiveAddress
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
export const sendCrashReportsSelector = (state: State): boolean => state.appSettings.sendCrashReports
export const hasPendingOutgoingTransactionSelector: (state: State) => boolean = createSelector(
  transactionsInfoSelector,
  (transactions) =>
    ObjectValues(transactions).some(
      (tx) => tx.status === TRANSACTION_STATUS.PENDING && tx.direction !== TRANSACTION_DIRECTION.RECEIVED,
    ),
)
export const isAppInitializedSelector = (state: State): boolean => state.isAppInitialized
export const installationIdSelector = (state: State) => state.appSettings.installationId
export const isMaintenanceSelector = (state: State): boolean => state.serverStatus.isMaintenance

export const isTosAcceptedSelector = (state: State): boolean => state.appSettings.acceptedTos
