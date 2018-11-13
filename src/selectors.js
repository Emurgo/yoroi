// @flow
import _ from 'lodash'
import {BigNumber} from 'bignumber.js'
import {createSelector} from 'reselect'

import {processTxHistoryData} from './crypto/transactionUtils'
import {TRANSACTION_STATUS} from './types/HistoryTransaction'
import {ObjectValues} from './utils/flow'

import type {Dict, State} from './state'
import type {
  Transaction,
  TransactionInfo,
  RawUtxo,
} from './types/HistoryTransaction'

export const transactionsInfoSelector: (State) => Dict<
  TransactionInfo,
> = createSelector(
  (state) => state.wallet.transactions,
  (state) => state.wallet.ownAddresses,
  (state) => state.wallet.confirmationCounts,
  (transactions, ownAddresses, confirmationCounts) =>
    _.mapValues(transactions, (tx: Transaction) =>
      processTxHistoryData(tx, ownAddresses, confirmationCounts[tx.id] || 0),
    ),
)

export const amountPendingSelector = createSelector(
  transactionsInfoSelector,
  (transactions) => {
    const pending = ObjectValues(transactions)
      .filter((tx) => tx.status === TRANSACTION_STATUS.PENDING)
      .map((tx) => tx.bruttoAmount)

    if (!pending.length) return null

    return pending.reduce((x: BigNumber, y) => x.plus(y), new BigNumber(0))
  },
)

const BigNumberSum = (data: Array<BigNumber>): BigNumber =>
  data.reduce((x: BigNumber, y) => x.plus(y), new BigNumber(0))

// TODO: make this using reselect
export const availableAmountSelector = (state: State): ?BigNumber =>
  createSelector(transactionsInfoSelector, (transactions) => {
    const processed = ObjectValues(transactions).filter(
      (tx) => tx.status === TRANSACTION_STATUS.SUCCESSFUL,
    )
    const amounts = processed.map((tx) => tx.bruttoAmount)
    return BigNumberSum(amounts)
  })

export const receiveAddressesSelector = (state: State) =>
  state.wallet.generatedReceiveAddresses

export const canGenerateNewReceiveAddressSelector = (state: State) =>
  state.wallet.canGenerateNewReceiveAddress

export const isOnlineSelector = (state: State): boolean => state.isOnline

export const isSynchronizingHistorySelector = (state: State): boolean =>
  state.txHistory.isSynchronizing

export const lastHistorySyncErrorSelector = (state: State): any =>
  state.txHistory.lastSyncError

export const utxoBalanceSelector = (state: State) => {
  if (state.balance.isFetching || !state.balance.utxos) {
    return null
  }

  return state.balance.utxos.reduce(
    (sum: BigNumber, utxo: RawUtxo) => sum.plus(new BigNumber(utxo.amount)),
    new BigNumber(0),
  )
}

export const walletIsInitializedSelector = (state: State): boolean =>
  state.wallet.isInitialized

export const isFetchingBalanceSelector = (state: State): boolean =>
  state.balance.isFetching

export const lastFetchingErrorSelector = (state: State): any =>
  state.balance.lastFetchingError

export const utxosSelector = (state: State): ?Array<RawUtxo> =>
  state.balance.utxos

export const fingerprintsHwSupportSelector = (state: State): boolean =>
  state.auth.isFingerprintsHardwareSupported

export const systemAuthSupportSelector = (state: State): boolean =>
  state.auth.isSystemAuthEnabled

export const enrolledFingerprintsSelector = (state: State): boolean =>
  state.auth.hasEnrolledFingerprints
