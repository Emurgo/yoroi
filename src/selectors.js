// @flow
import _ from 'lodash'
import {BigNumber} from 'bignumber.js'

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
  return _.mapValues(state.wallet.transactions, (tr) =>
    processTxHistoryData(tr, ownAddresses),
  )
}

export const amountPendingSelector = (state: State): ?number => {
  const transactions = transactionsSelector(state)
  const pending = ObjectValues(transactions)
    .filter((t) => t.status === TRANSACTION_STATUS.PENDING)
    .map((t) => t.bruttoAmount)

  if (!pending.length) return null

  return pending.reduce((x: BigNumber, y) => x.plus(y), new BigNumber(0))
}

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
  state.generatedReceiveAddresses

export const isOnlineSelector = (state: State) => state.isOnline

export const isSynchronizingHistorySelector = (state: State): boolean =>
  state.txHistory.isSynchronizing

export const lastHistorySyncErrorSelector = (state: State): any =>
  state.txHistory.lastSyncError
