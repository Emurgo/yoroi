import type {Dispatch} from 'redux'

import type {TokenInfoRequest, TokenInfoResponse} from '../../legacy/api/types'
import type {State} from '../../legacy/state'
import type {Token} from '../../legacy/types/HistoryTransaction'
import {ObjectValues} from '../../legacy/utils/flow'
import {Logger} from '../../legacy/utils/logging'
import {availableAssetsSelector, tokenBalanceSelector} from '../legacy/selectors'
import {MultiToken, walletManager} from '../yoroi-wallets'

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

const _setLastError = (error) => ({
  type: 'SET_LAST_FETCHING_ERROR',
  path: ['tokenInfo', 'lastFetchingError'],
  payload: error,
  reducer: (state, error) => error,
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fetchTokenInfo = () => async (dispatch: Dispatch<any>, getState: () => State) => {
  const state = getState()

  if (state.tokenInfo.isFetching) {
    return
  }

  dispatch(_setTokenInfo(availableAssetsSelector(state)))
  dispatch(_startFetching())

  try {
    const availableAssets: Record<string, Token> = availableAssetsSelector(state)
    const assetsBalance: MultiToken = tokenBalanceSelector(state)
    // subject -> identifier
    const subjectDict = ObjectValues(availableAssets)
      .filter((asset) => {
        const assetValue = assetsBalance.get(asset.identifier)
        return assetValue && assetValue.gt(0)
      })
      .reduce((acc, curr: Token): Record<string, string> => {
        if (curr.identifier === '') return acc
        acc[`${curr.metadata.policyId}${curr.metadata.assetName}`] = curr.identifier
        return acc
      }, {} as Record<string, string>)
    const tokenIds = Object.keys(subjectDict)
    const tokenInfo: TokenInfoResponse = await walletManager.fetchTokenInfo({
      tokenIds,
    } as TokenInfoRequest)
    const tokens = {...availableAssets}

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

    Logger.info('saving token info in state....', tokens)
    dispatch(_setTokenInfo(tokens))
    dispatch(_setLastError(null))
  } catch (err) {
    Logger.warn('actions:tokenInfo::fetchTokenInfo', err)
    dispatch(_setLastError(err))
  } finally {
    dispatch(_endFetching())
  }
}
