// @flow
import _ from 'lodash'
import {BigNumber} from 'bignumber.js'
import {createSelector} from 'reselect'

import {processTxHistoryData} from './utils/transactions'
import {TRANSACTION_STATUS} from './types/HistoryTransaction'
import {ObjectValues} from './utils/flow'

import type {Dict, State} from './state'
import type {HistoryTransaction, RawUtxo} from './types/HistoryTransaction'

export const transactionsSelector: (State) => Dict<
  HistoryTransaction,
> = createSelector(
  (state) => state.wallet,
  (wallet) => {
    const {transactions, ownAddresses, txsToConfirmations} = wallet
    return _.mapValues(transactions, (tr) =>
      processTxHistoryData(tr, ownAddresses, txsToConfirmations[tr.id] || 0),
    )
  },
)

export const amountPendingSelector = createSelector(
  transactionsSelector,
  (transactions) => {
    const pending = ObjectValues(transactions)
      .filter((t) => t.status === TRANSACTION_STATUS.PENDING)
      .map((t) => t.bruttoAmount)

    if (!pending.length) return null

    return pending.reduce((x: BigNumber, y) => x.plus(y), new BigNumber(0))
  },
)

// TODO: make this using reselect
export const availableAmountSelector = (state: State): ?BigNumber => {
  const transactions = transactionsSelector(state)
  const processed = ObjectValues(transactions).filter(
    (t) => t.status === TRANSACTION_STATUS.SUCCESSFUL,
  )

  if (!processed.length) return new BigNumber(0)

  return processed.reduce(
    (x: BigNumber, y) => x.plus(y.bruttoAmount),
    new BigNumber(0),
  )
}

export const receiveAddressesSelector = (state: State) =>
  state.wallet.generatedReceiveAddresses

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

export const isFetchingBalanceSelector = (state: State): boolean =>
  state.balance.isFetching

export const lastFetchingErrorSelector = (state: State): any =>
  state.balance.lastFetchingError
