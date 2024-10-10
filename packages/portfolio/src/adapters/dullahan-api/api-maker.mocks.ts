import {freeze} from 'immer'
import {asyncBehavior} from '@yoroi/common'
import {Api, Portfolio} from '@yoroi/types'

import {tokenMocks} from '../token.mocks'
import {tokenTraitsMocks} from '../token-traits.mocks'
import {tokenActivityMocks} from '../token-activity.mocks'
import {tokenHistoryMocks} from '../token-history.mocks'

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

export const responseTokenHistory = asyncBehavior.maker<
  Api.Response<Portfolio.Api.TokenHistoryResponse>
>({
  data: {
    tag: 'right',
    value: {
      status: 200,
      data: tokenHistoryMocks.api.responseDataOnly,
    },
  },
  emptyRepresentation: null,
})

export const responseTokenImageInvalidate = asyncBehavior.maker<undefined>({
  data: undefined,
  emptyRepresentation: null,
})

const success: Portfolio.Api.Api = {
  tokenDiscovery: responseTokenDiscoveryMocks.success,
  tokenInfo: responseTokenInfoMocks.success,
  tokenInfos: responseTokenInfosMocks.success,
  tokenTraits: responseTokenTraits.success,
  tokenActivity: responseTokenActivity.success,
  tokenHistory: responseTokenHistory.success,
  tokenImageInvalidate: responseTokenImageInvalidate.success,
}

const delayed: Portfolio.Api.Api = {
  tokenDiscovery: responseTokenDiscoveryMocks.delayed,
  tokenInfo: responseTokenInfoMocks.delayed,
  tokenInfos: responseTokenInfosMocks.delayed,
  tokenTraits: responseTokenTraits.delayed,
  tokenActivity: responseTokenActivity.delayed,
  tokenHistory: responseTokenHistory.delayed,
  tokenImageInvalidate: responseTokenImageInvalidate.delayed,
}

const loading: Portfolio.Api.Api = {
  tokenDiscovery: responseTokenDiscoveryMocks.loading,
  tokenInfo: responseTokenInfoMocks.loading,
  tokenInfos: responseTokenInfosMocks.loading,
  tokenTraits: responseTokenTraits.loading,
  tokenActivity: responseTokenActivity.loading,
  tokenHistory: responseTokenHistory.loading,
  tokenImageInvalidate: responseTokenImageInvalidate.loading,
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
  tokenHistory: () =>
    Promise.resolve({
      tag: 'left',
      error: {
        status: 400,
        message: 'Bad Request',
        responseData: {message: 'Bad Request'},
      },
    }),
  tokenImageInvalidate: () => Promise.resolve(undefined),
}

const empty: Portfolio.Api.Api = {
  tokenDiscovery: responseTokenDiscoveryMocks.empty,
  tokenInfo: responseTokenInfoMocks.empty,
  tokenInfos: responseTokenInfosMocks.empty,
  tokenTraits: responseTokenTraits.empty,
  tokenActivity: responseTokenActivity.empty,
  tokenHistory: responseTokenHistory.empty,
  tokenImageInvalidate: responseTokenImageInvalidate.empty,
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
