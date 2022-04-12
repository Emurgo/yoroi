/* eslint-disable @typescript-eslint/no-explicit-any */
import {BigNumber} from 'bignumber.js'
import type {Dispatch} from 'redux'

import {Logger} from '../legacy/logging'
import {walletManager} from '../yoroi-wallets'
import {ObjectValues} from './flow'
import type {State} from './state'

// start fetching account balance
const _startFetching = () => ({
  type: 'START_FETCHING_ACCOUNT_STATE',
  path: ['accountState', 'isFetching'],
  payload: null,
  reducer: (_state, _isFetching) => true,
})

const _endFetching = () => ({
  type: 'END_FETCHING_ACCOUNT_STATE',
  path: ['accountState', 'isFetching'],
  payload: null,
  reducer: (_state, _isFetching) => false,
})

const _setAccountValue = (value) => ({
  type: 'SET_ACCOUNT_VALUE',
  path: ['accountState', 'value'],
  payload: value,
  reducer: (state, value) => value,
})

const _setAccountPool = (poolOperator) => ({
  type: 'SET_ACCOUNT_POOLS',
  path: ['accountState', 'poolOperator'],
  payload: poolOperator,
  reducer: (state, poolOperator) => poolOperator,
})

const _setAccountDelegationStatus = (isDelegating) => ({
  type: 'SET_ACCOUNT_DELEGATION_STATUS',
  path: ['accountState', 'isDelegating'],
  payload: isDelegating,
  reducer: (state, isDelegating) => isDelegating,
})

const _setAccountTotalDelegated = (value) => ({
  type: 'SET_ACCOUNT_TOTAL_DELEGATED',
  path: ['accountState', 'totalDelegated'],
  payload: value,
  reducer: (state, value) => value,
})

const _clearAccountState = () => ({
  type: 'CLEAR_ACCOUNT_STATE',
  path: ['accountState'],
  payload: null,
  reducer: (_state) => {
    return {
      isFetching: false,
      lastFetchingError: null,
      totalDelegated: new BigNumber(0),
      value: new BigNumber(0),
      poolOperator: null,
    }
  },
})

const _setLastError = (error) => ({
  type: 'SET_LAST_FETCHING_ERROR',
  path: ['accountState', 'lastFetchingError'],
  payload: error,
  reducer: (state, error) => error,
})

export const fetchAccountState = () => async (dispatch: Dispatch<any>, getState: () => State) => {
  if (getState().accountState.isFetching) {
    return
  }

  dispatch(_clearAccountState())
  dispatch(_startFetching())

  try {
    const status = await walletManager.getDelegationStatus()
    Logger.debug('account actions::getDelegationStatus', status)
    dispatch(_setAccountPool((status as any).poolKeyHash))
    dispatch(_setAccountDelegationStatus(status.isRegistered))
    const accountStateResp = await walletManager.fetchAccountState()
    const accountState = ObjectValues(accountStateResp)[0]
    const value = accountState?.remainingAmount || '0'
    const utxos = getState().balance.utxos

    if (utxos != null) {
      const utxosForKey = await walletManager.getAllUtxosForKey(utxos)
      const amountToDelegate =
        utxosForKey != null && status.isRegistered
          ? utxosForKey
              .map((utxo) => utxo.amount)
              .reduce((x: BigNumber, y) => x.plus(new BigNumber(y || 0)), new BigNumber(0))
          : (BigNumber as any)(0)
      dispatch(_setAccountTotalDelegated(amountToDelegate.plus(new BigNumber(value))))
    }

    dispatch(_setAccountValue(new BigNumber(value)))
    dispatch(_setLastError(null))
  } catch (err) {
    Logger.warn(err as any)
    dispatch(_setLastError(err))
  } finally {
    dispatch(_endFetching())
  }
}
export const clearAccountState = () => (dispatch: Dispatch<any>) => {
  dispatch(_clearAccountState())
}
