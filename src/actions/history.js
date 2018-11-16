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

const _setSyncError = (message: ?string): any => ({
  type: 'Set history sync error',
  path: ['txHistory', 'lastSyncError'],
  payload: message,
  reducer: (state, message) => message,
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
    dispatch(_setSyncError(e.message))
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
  const canGenerateNewReceiveAddress =
    walletManager.canGenerateNewReceiveAddress
  const name = walletManager.walletName

  dispatch({
    type: 'Mirror walletManager TxHistory',
    path: ['wallet'],
    payload: {
      name,
      isInitialized,
      transactions,
      ownAddresses,
      confirmationCounts,
      generatedReceiveAddresses,
      canGenerateNewReceiveAddress,
    },
    reducer: (state, payload) => payload,
  })
}
