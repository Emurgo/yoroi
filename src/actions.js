// @flow

import api from './api'
import walletManager from './crypto/wallet'
import {Logger} from './utils/logging'

import {type Dispatch} from 'redux'

const _updateTransactions = (rawTransactions) => ({
  type: 'Update transactions',
  path: ['transactions', 'data'],
  payload: rawTransactions,
  reducer: (state, payload) => payload,
})

const _startFetch = () => ({
  type: 'Fetch transaction history',
  path: ['transactions', 'isFetching'],
  payload: null,
  reducer: (state, payload) => true,
})

const _endFetch = () => ({
  type: 'Finished fetching transaction history',
  path: ['transactions', 'isFetching'],
  payload: null,
  reducer: (state, payload) => false,
})

const _setOnline = (isOnline: boolean) => (dispatch, getState) => {
  const state = getState()
  if (state.isOnline === isOnline) return // avoid useless state updates
  dispatch({
    type: 'Set isOnline',
    path: ['isOnline'],
    payload: isOnline,
    reducer: (state, payload) => payload,
  })
}

export const setupApiOnlineTracking = () => (dispatch: Dispatch<any>) => {
  Logger.debug('setting up api isOnline callback')
  api.setIsOnlineCallback((isOnline) => dispatch(_setOnline(isOnline)))
}

export const updateHistory = () => async (dispatch: Dispatch<any>) => {
  // TODO(ppershing): abort previous request if still fetching
  dispatch(_startFetch())
  try {
    walletManager.__initTestWalletIfNeeded()
    const response = await walletManager.doFullSync()
    dispatch(_updateTransactions(response))
  } catch (e) {
    Logger.error('Update history error', e)
  } finally {
    dispatch(_endFetch())
  }
}
