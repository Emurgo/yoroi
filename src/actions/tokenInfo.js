// @flow
import type {Dispatch} from 'redux'

import walletManager from '../crypto/walletManager'
import {availableAssetsSelector, tokenBalanceSelector} from '../selectors'
import {ObjectValues} from '../utils/flow'
import {Logger} from '../utils/logging'

import type {State} from '../state'
import type {Token} from '../types/HistoryTransaction'
import type {MultiToken} from '../crypto/MultiToken'
import type {TokenInfoRequest, TokenInfoResponse} from '../api/types'

const _startFetching = () => ({
  type: 'START_FETCHING_TOKEN_INFO',
  path: ['tokenInfo', 'isFetching'],
  payload: null,
  reducer: (_state, _isFetching) => true,
})

const _endFetching = () => ({
  type: 'END_FETCHING_TOKEN_INFO',
  path: ['tokenInfo', 'isFetching'],
  payload: null,
  reducer: (_state, _isFetching) => false,
})

const _setTokenInfo = (tokenInfo) => ({
  type: 'SET_TOKEN_INFO',
  path: ['tokenInfo', 'tokens'],
  payload: tokenInfo,
  reducer: (state, value) => value,
})

const _clearTokenInfo = () => ({
  type: 'CLEAR_TOKEN_INFO',
  path: ['tokenInfo'],
  payload: null,
  reducer: (_state) => {
    return {
      isFetching: false,
      lastFetchingError: null,
      tokens: {},
    }
  },
})

const _setLastError = (error) => ({
  type: 'SET_LAST_FETCHING_ERROR',
  path: ['tokenInfo', 'lastFetchingError'],
  payload: error,
  reducer: (state, error) => error,
})

export const fetchTokenInfo = () => async (
  dispatch: Dispatch<any>,
  getState: () => State,
) => {
  const state = getState()
  if (state.tokenInfo.isFetching) {
    return
  }
  dispatch(_clearTokenInfo())
  dispatch(_startFetching())
  try {
    const availableAssets: Dict<Token> = availableAssetsSelector(state)
    const assetsBalance: MultiToken = tokenBalanceSelector(state)

    // subject -> identifier
    const subjectDict = ObjectValues(availableAssets)
      .filter((asset) => {
        const assetValue = assetsBalance.get(asset.identifier)
        return assetValue && assetValue.gte(0)
      })
      .reduce((acc, curr: Token): Dict<string> => {
        if (curr.identifier === '') return acc
        acc[`${curr.metadata.policyId}${curr.metadata.assetName}`] =
          curr.identifier
        return acc
      }, ({}: Dict<string>))

    const tokenIds = Object.keys(subjectDict)
    const tokenInfo: TokenInfoResponse = await walletManager.fetchTokenInfo(
      ({
        tokenIds,
      }: TokenInfoRequest),
    )

    const tokens = availableAssets
    for (const key of Object.keys(tokenInfo)) {
      const _token = tokens[subjectDict[key]]
      const newInfo = tokenInfo[key]
      if (newInfo == null) continue
      tokens[subjectDict[key]] = {
        ..._token,
        metadata: {
          ..._token.metadata,
          longName: newInfo.name || null,
          numberOfDecimals: newInfo.decimals || 0,
        },
      }
    }
    Logger.warn('saving token info in state....', tokens)
    dispatch(_setTokenInfo(tokens))
    dispatch(_setLastError(null))
  } catch (err) {
    Logger.warn('actions:tokenInfo::fetchTokenInfo', err)
    dispatch(_setLastError(err))
  } finally {
    dispatch(_endFetching())
  }
}

export const clearTokenInfo = () => (dispatch: Dispatch<any>) => {
  dispatch(_clearTokenInfo())
}
