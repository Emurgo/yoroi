import walletManager from '../crypto/wallet'
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

const _setSyncError = (error) => ({
  type: 'Set history sync error',
  path: ['txHistory', 'lastSyncError'],
  payload: error,
  reducer: (state, payload) => payload,
})

export const updateHistory = () => async (dispatch: Dispatch<any>) => {
  // TODO(ppershing): abort previous request if still fetching
  dispatch(_startFetch())
  try {
    await walletManager.__initTestWalletIfNeeded()
    await walletManager.doFullSync()
    dispatch(_setSyncError(null))
  } catch (e) {
    // TODO(ppershing): should we set error object or just
    // some message code?
    dispatch(_setSyncError(e))
  } finally {
    dispatch(_endFetch())
  }
}

export const updateHistoryInBackground = () => async (
  dispatch: Dispatch<any>,
) => {
  try {
    await walletManager.__initTestWalletIfNeeded()
    await walletManager.tryDoFullSync()
    dispatch(_setSyncError(null))
  } catch (e) {
    // TODO(ppershing): should we set error object or just
    // some message code?
    dispatch(_setSyncError(e))
  }
}
