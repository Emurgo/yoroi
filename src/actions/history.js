// @flow
import walletManager from '../crypto/wallet'
import {Logger} from '../utils/logging'

import {type Dispatch} from 'redux'

const _startFetch = () => ({
  type: 'Fetch transaction history',
  path: ['txHistory', 'isSynchronizing'],
  payload: null,
  reducer: (state, payload) => true,
})

const _endFetch = () => ({
  type: 'Finished fetching transaction history',
  path: ['txHistory', 'isSynchronizing'],
  payload: null,
  reducer: (state, payload) => false,
})

const _setSyncError = (error: any): any => ({
  type: 'Set history sync error',
  path: ['txHistory', 'lastSyncError'],
  payload: error,
  reducer: (state, payload) => payload,
})

export const setBackgroundSyncError = _setSyncError

export const updateHistory = () => async (dispatch: Dispatch<any>) => {
  // TODO(ppershing): abort previous request if still fetching
  dispatch(_startFetch())
  try {
    await walletManager.doFullSync()
    dispatch(_setSyncError(null))
  } catch (e) {
    // TODO(ppershing): should we set error object or just
    // some message code?
    Logger.error(e)
    dispatch(_setSyncError(e))
  } finally {
    dispatch(_endFetch())
  }
}

export const mirrorTxHistory = () => (dispatch: Dispatch<any>) => {
  const isInitialized = walletManager.isInitialized
  const transactions = walletManager.transactions
  const ownAddresses = walletManager.ownAddresses
  const confirmationCounts = walletManager.confirmationCounts
  const generatedReceiveAddresses = walletManager.receiveAddresses

  dispatch({
    type: 'Mirror walletManager TxHistory',
    path: ['wallet'],
    payload: {
      isInitialized,
      transactions,
      ownAddresses,
      confirmationCounts,
      generatedReceiveAddresses,
    },
    reducer: (state, payload) => payload,
  })
}
