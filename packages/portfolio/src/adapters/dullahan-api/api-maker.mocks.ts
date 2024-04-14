import {freeze} from 'immer'
import {asyncBehavior} from '@yoroi/common'
import {Api, Portfolio} from '@yoroi/types'

import {tokenMocks} from '../token.mocks'

export const responseTokenDiscoveriesMocks = asyncBehavior.maker<
  Api.Response<Portfolio.Api.TokenDiscoveriesResponse>
>({
  data: {
    tag: 'right',
    value: {status: 200, data: tokenMocks.apiResponse.tokenDiscoveries},
  },
  emptyRepresentation: [],
})

export const responseTokenInfosMocks = asyncBehavior.maker<
  Api.Response<Portfolio.Api.TokenInfosResponse>
>({
  data: {
    tag: 'right',
    value: {status: 200, data: tokenMocks.apiResponse.tokenInfos},
  },
  emptyRepresentation: [],
})

const success: Portfolio.Api.Api = {
  tokenDiscoveries: responseTokenDiscoveriesMocks.success,
  tokenInfos: responseTokenInfosMocks.success,
}

const delayed: Portfolio.Api.Api = {
  tokenDiscoveries: responseTokenDiscoveriesMocks.delayed,
  tokenInfos: responseTokenInfosMocks.delayed,
}

const loading: Portfolio.Api.Api = {
  tokenDiscoveries: responseTokenDiscoveriesMocks.loading,
  tokenInfos: responseTokenInfosMocks.loading,
}

const error: Portfolio.Api.Api = {
  tokenDiscoveries: () =>
    Promise.resolve({
      tag: 'left',
      error: {
        status: 400,
        message: 'Bad Request',
        responseData: {message: 'Bad Request'},
      },
    }),
  tokenInfos: () =>
    Promise.resolve({
      tag: 'left',
      error: {
        status: 400,
        message: 'Bad Request',
        responseData: {message: 'Bad Request'},
      },
    }),
}

const empty: Portfolio.Api.Api = {
  tokenDiscoveries: responseTokenDiscoveriesMocks.empty,
  tokenInfos: responseTokenInfosMocks.empty,
}

export const portfolioApiMock = freeze(
  {
    success,
    delayed,
    loading,
    error,
    empty,
  },
  true,
)
