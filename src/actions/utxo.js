// @flow

import walletManager from '../crypto/wallet'

import type {RawUtxo} from '../types/HistoryTransaction'

import type {Dispatch} from 'redux'

import type {State} from '../state'

declare type ExtractReturnType = <R>((...arg: any) => R) => R;
declare type ReturnType<Func> = $Call<ExtractReturnType, Func>;

// start fetching utxo
const _startFetching: void => {|
  type: 'START_FETCHING_BALANCE',
  path: ['balance', 'isFetching'],
  payload: null,
  reducer: (State, boolean) => true,
|} = () => ({
  type: 'START_FETCHING_BALANCE',
  path: ['balance', 'isFetching'],
  payload: null,
  reducer: (state, isFetching) => true,
})

const _endFetching: void => {|
  type: 'END_FETCHING_BALANCE',
  path: ['balance', 'isFetching'],
  payload: null,
  reducer: (State, boolean) => false,
|} = () => ({
  type: 'END_FETCHING_BALANCE',
  path: ['balance', 'isFetching'],
  payload: null,
  reducer: (state, isFetching) => false,
})

const _setUTXOs: Array<RawUtxo> => {|
  type: 'SET_UTXOS',
  path: ['balance', 'utxos'],
  payload: Array<RawUtxo>,
  reducer: (State, Array<RawUtxo>) => Array<RawUtxo>,
|} = (rawUTXOs) => ({
  type: 'SET_UTXOS',
  path: ['balance', 'utxos'],
  payload: rawUTXOs,
  reducer: (state, rawUTXOs) => rawUTXOs,
})

const _clearUTXOs: void => {|
  type: 'CLEAR_UTXOS',
  path: ['balance', 'utxos'],
  payload: null,
  reducer: (State, Array<RawUtxo>) => null,
|} = () => ({
  type: 'CLEAR_UTXOS',
  path: ['balance', 'utxos'],
  payload: null,
  reducer: (state, utxos) => null,
})

const _setLastError: any => {|
  type: 'SET_LAST_FETCHING_ERROR',
  path: ['balance', 'lastFetchingError'],
  payload: any,
  reducer: (State, any) => any,
|} = (error) => ({
  type: 'SET_LAST_FETCHING_ERROR',
  path: ['balance', 'lastFetchingError'],
  payload: error,
  reducer: (state, error) => error,
})

export const fetchUTXOs = () => async (
  dispatch: Dispatch<
    ReturnType<typeof _startFetching> |
    ReturnType<typeof _clearUTXOs> |
    ReturnType<typeof _setUTXOs> |
    ReturnType<typeof _setLastError> |
    ReturnType<typeof _endFetching>
  >,
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
