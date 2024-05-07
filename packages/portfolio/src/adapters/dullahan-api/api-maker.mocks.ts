import {freeze} from 'immer'
import {asyncBehavior} from '@yoroi/common'
import {Api, Portfolio} from '@yoroi/types'

import {tokenMocks} from '../token.mocks'

export const responseTokenDiscoveriesMocks = asyncBehavior.maker<
  Api.Response<Portfolio.Api.TokenDiscoveryResponse>
>({
  data: {
    tag: 'right',
    value: {status: 200, data: tokenMocks.apiResponse.tokenDiscovery},
  },
  emptyRepresentation: null,
})

export const responseTokenInfosMocks = asyncBehavior.maker<
  Api.Response<Portfolio.Api.TokenInfosResponse>
>({
  data: {
    tag: 'right',
    value: {status: 200, data: tokenMocks.apiResponse.tokenInfos},
  },
  emptyRepresentation: null,
})

const success: Portfolio.Api.Api = {
  tokenDiscovery: responseTokenDiscoveriesMocks.success,
  tokenInfos: responseTokenInfosMocks.success,
}

const delayed: Portfolio.Api.Api = {
  tokenDiscovery: responseTokenDiscoveriesMocks.delayed,
  tokenInfos: responseTokenInfosMocks.delayed,
}

const loading: Portfolio.Api.Api = {
  tokenDiscovery: responseTokenDiscoveriesMocks.loading,
  tokenInfos: responseTokenInfosMocks.loading,
}

const error: Portfolio.Api.Api = {
  tokenDiscovery: () =>
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
  tokenDiscovery: responseTokenDiscoveriesMocks.empty,
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
