// @flow
import {processTxHistoryData} from './utils/transactions'

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

export const isOnlineSelector = (state: State) => state.isOnline
export const isFetchingHistorySelector = (state: State): boolean => state.transactions.isFetching
