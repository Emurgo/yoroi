// @flow
import _ from 'lodash'

import {processTxHistoryData} from './utils/transactions'
import {TRANSACTION_STATUS} from './types/HistoryTransaction'
import {ObjectValues} from './utils/flow'
import WalletManager from './crypto/wallet'

import type {Dict, State} from './state'
import type {HistoryTransaction} from './types/HistoryTransaction'

// TODO(ppershing): memoize/reselect
export const transactionsSelector = (
  state: State,
): Dict<HistoryTransaction> => {
  // TODO(ppershing): store own addresses in redux state (otherwise
  // the transactions might not be re-evaluated if addresses change)
  const ownAddresses = WalletManager.getOwnAddresses()
  return _.mapValues(state.transactions.data, (tr) =>
    processTxHistoryData(tr, ownAddresses),
  )
}

export const amountPendingSelector = (state: State): ?number => {
  const transactions = transactionsSelector(state)
  const pending = ObjectValues(transactions)
    .filter((t) => t.status === TRANSACTION_STATUS.PENDING)
    .map((t) => t.bruttoAmount)

  if (!pending.length) return null

  return pending.reduce((x, y) => x + y)
}

// TODO: make this using reselect
export const availableAmountSelector = (state: State): ?number => {
  const transactions = transactionsSelector(state)
  const processed = ObjectValues(transactions).filter(
    (t) => t.status === TRANSACTION_STATUS.SUCCESSFUL,
  )

  if (!processed.length) return 0

  return processed.reduce((x, y) => x + y.bruttoAmount, 0)
}

export const isOnlineSelector = (state: State) => state.isOnline
export const isFetchingHistorySelector = (state: State): boolean =>
  state.transactions.isFetching
