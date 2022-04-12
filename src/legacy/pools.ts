/* eslint-disable @typescript-eslint/no-explicit-any */
import type {Dispatch} from 'redux'

import {Logger} from '../legacy/logging'
import {walletManager} from '../yoroi-wallets'
import type {State} from './state'
import type {PoolInfoRequest} from './types'

const _startFetching = () => ({
  type: 'START_FETCHING_POOL_INFO',
  path: ['poolInfo', 'isFetching'],
  payload: null,
  reducer: (_state, _isFetching) => true,
})

const _endFetching = () => ({
  type: 'END_FETCHING_POOL_INFO',
  path: ['poolInfo', 'isFetching'],
  payload: null,
  reducer: (_state, _isFetching) => false,
})

const _setPoolInfo = (poolInfo) => ({
  type: 'SET_POOL_INFO',
  path: ['poolInfo', 'meta'],
  payload: poolInfo,
  reducer: (state, value) => value,
})

const _clearPoolInfo = () => ({
  type: 'CLEAR_POOL_INFO',
  path: ['poolInfo'],
  payload: null,
  reducer: (_state) => {
    return {
      isFetching: false,
      lastFetchingError: null,
      meta: null,
    }
  },
})

const _setLastError = (error) => ({
  type: 'SET_LAST_FETCHING_ERROR',
  path: ['poolInfo', 'lastFetchingError'],
  payload: error,
  reducer: (state, error) => error,
})

export const fetchPoolInfo = () => async (dispatch: Dispatch<any>, getState: () => State) => {
  if (getState().poolInfo.isFetching) {
    return
  } else if (getState().accountState.poolOperator == null) {
    dispatch(_clearPoolInfo())
    return
  }

  dispatch(_clearPoolInfo())
  dispatch(_startFetching())

  try {
    const poolOperator = getState().accountState.poolOperator

    if (poolOperator == null) {
      throw new Error('fetchPoolInfo::poolOperator is null, should never happen')
    }

    const poolInfoResp = await walletManager.fetchPoolInfo({
      poolIds: [poolOperator],
    } as PoolInfoRequest)
    const poolInfo = Object.keys(poolInfoResp).map((key) => poolInfoResp[key])[0]
    if ((poolInfo as any).error != null) throw new Error((poolInfo as any).error)
    dispatch(_setPoolInfo(poolInfo))
    dispatch(_setLastError(null))
  } catch (err) {
    Logger.warn(err as any)
    dispatch(_setLastError(err))
  } finally {
    dispatch(_endFetching())
  }
}
