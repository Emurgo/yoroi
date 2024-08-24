import {freeze} from 'immer'
import {asyncBehavior} from '@yoroi/common'
import {Api, Portfolio} from '@yoroi/types'

import {tokenMocks} from '../token.mocks'
import {tokenTraitsMocks} from '../token-traits.mocks'
import {tokenActivityMocks} from '../token-activity.mocks'

export const responseTokenDiscoveryMocks = asyncBehavior.maker<
  Api.Response<Portfolio.Api.TokenDiscoveryResponse>
>({
  data: {
    tag: 'right',
    value: {status: 200, data: tokenMocks.nftCryptoKitty.discovery},
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

export const responseTokenInfoMocks = asyncBehavior.maker<
  Api.Response<Portfolio.Token.Info>
>({
  data: {
    tag: 'right',
    value: {status: 200, data: tokenMocks.nftCryptoKitty.info},
  },
  emptyRepresentation: null,
})

export const responseTokenTraits = asyncBehavior.maker<
  Api.Response<Portfolio.Api.TokenTraitsResponse>
>({
  data: {
    tag: 'right',
    value: {status: 200, data: tokenTraitsMocks.nftCryptoKitty},
  },
  emptyRepresentation: null,
})

export const responseTokenActivity = asyncBehavior.maker<
  Api.Response<Portfolio.Api.TokenActivityResponse>
>({
  data: {
    tag: 'right',
    value: {
      status: 200,
      data: tokenActivityMocks.api.responseDataOnly,
    },
  },
  emptyRepresentation: null,
})

const success: Portfolio.Api.Api = {
  tokenDiscovery: responseTokenDiscoveryMocks.success,
  tokenInfo: responseTokenInfoMocks.success,
  tokenInfos: responseTokenInfosMocks.success,
  tokenTraits: responseTokenTraits.success,
  tokenActivity: responseTokenActivity.success,
}

const delayed: Portfolio.Api.Api = {
  tokenDiscovery: responseTokenDiscoveryMocks.delayed,
  tokenInfo: responseTokenInfoMocks.delayed,
  tokenInfos: responseTokenInfosMocks.delayed,
  tokenTraits: responseTokenTraits.delayed,
  tokenActivity: responseTokenActivity.delayed,
}

const loading: Portfolio.Api.Api = {
  tokenDiscovery: responseTokenDiscoveryMocks.loading,
  tokenInfo: responseTokenInfoMocks.loading,
  tokenInfos: responseTokenInfosMocks.loading,
  tokenTraits: responseTokenTraits.loading,
  tokenActivity: responseTokenActivity.loading,
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
  tokenInfo: () =>
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
  tokenTraits: () =>
    Promise.resolve({
      tag: 'left',
      error: {
        status: 400,
        message: 'Bad Request',
        responseData: {message: 'Bad Request'},
      },
    }),
  tokenActivity: () =>
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
  tokenDiscovery: responseTokenDiscoveryMocks.empty,
  tokenInfo: responseTokenInfoMocks.empty,
  tokenInfos: responseTokenInfosMocks.empty,
  tokenTraits: responseTokenTraits.empty,
  tokenActivity: responseTokenActivity.empty,
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
