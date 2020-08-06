// @flow

import walletManager from '../crypto/walletManager'

import type {Dispatch} from 'redux'

import type {State} from '../state'

// start fetching utxo
const _startFetching = () => ({
  type: 'START_FETCHING_BALANCE',
  path: ['balance', 'isFetching'],
  payload: null,
  reducer: (state, isFetching) => true,
})

const _endFetching = () => ({
  type: 'END_FETCHING_BALANCE',
  path: ['balance', 'isFetching'],
  payload: null,
  reducer: (state, isFetching) => false,
})

const _setUTXOs = (rawUTXOs) => ({
  type: 'SET_UTXOS',
  path: ['balance', 'utxos'],
  payload: rawUTXOs,
  reducer: (state, rawUTXOs) => rawUTXOs,
})

const _clearUTXOs = () => ({
  type: 'CLEAR_UTXOS',
  path: ['balance', 'utxos'],
  payload: null,
  reducer: (state, utxos) => null,
})

const _setLastError = (error) => ({
  type: 'SET_LAST_FETCHING_ERROR',
  path: ['balance', 'lastFetchingError'],
  payload: error,
  reducer: (state, error) => error,
})

export const fetchUTXOs = () => async (
  dispatch: Dispatch<any>,
  getState: () => State,
) => {
  if (getState().balance.isFetching) {
    return
  }

  dispatch(_startFetching())
  dispatch(_clearUTXOs())
  try {
    const utxos = await walletManager.fetchUTXOs()
    dispatch(_setUTXOs(utxos))
    dispatch(_setLastError(null))
  } catch (err) {
    dispatch(_setLastError(err))
  } finally {
    dispatch(_endFetching())
  }
}
