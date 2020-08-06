// @flow
import type {Dispatch} from 'redux'

import walletManager from '../crypto/walletManager'
import type {State} from '../state'

const _startFetching = () => ({
  type: 'START_FETCHING_POOL_INFO',
  path: ['poolInfo', 'isFetching'],
  payload: null,
  reducer: (state, isFetching) => true,
})

const _endFetching = () => ({
  type: 'END_FETCHING_POOL_INFO',
  path: ['poolInfo', 'isFetching'],
  payload: null,
  reducer: (state, isFetching) => false,
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
  reducer: (state) => {
    return {
      isFetching: false,
      lastFetchingError: null,
      meta: null,
    }
  },
})

const _setLastError = (error) => ({
  type: 'SET_LAST_FETCHING_ERROR',
  path: ['accountState', 'lastFetchingError'],
  payload: error,
  reducer: (state, error) => error,
})

export const fetchPoolInfo = () => async (
  dispatch: Dispatch<any>,
  getState: () => State,
) => {
  if (getState().poolInfo.isFetching) {
    return
  } else if (getState().accountState.delegation.pools.length === 0) {
    dispatch(_clearPoolInfo())
    return
  }
  dispatch(_clearPoolInfo())
  dispatch(_startFetching())
  try {
    const pools = getState().accountState.delegation.pools
    const poolInfoResp = await walletManager.fetchPoolInfo({
      ids: pools.map((pool) => pool[0]),
    })
    const poolInfo = Object.keys(poolInfoResp).map(
      (key) => poolInfoResp[key],
    )[0]
    if (poolInfo.error != null) throw new Error(poolInfo.error)
    dispatch(_setPoolInfo(poolInfo))
    dispatch(_setLastError(null))
  } catch (err) {
    dispatch(_setLastError(err))
  } finally {
    dispatch(_endFetching())
  }
}
