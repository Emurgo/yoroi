// @flow
import {processTxHistoryData} from './utils/transactions'
import {TRANSACTION_STATUS} from './types/HistoryTransaction'
import {ObjectValues} from './utils/flow'

import type {Dict, State} from './state'
import type {HistoryTransaction} from './types/HistoryTransaction'

import _ from 'lodash'

// TODO(ppershing): memoize/reselect
export const transactionsSelector = (state: State): Dict<HistoryTransaction> => {
  // TODO(ppershing): are these all of my receive addresses?
  const ownAddresses = state.receiveAddresses
  return _.mapValues(
    state.transactions.data,
    (tr) => processTxHistoryData(tr, ownAddresses)
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

export const isOnlineSelector = (state: State) => state.isOnline

export const isFetchingHistorySelector = (state: State): boolean => state.transactions.isFetching
