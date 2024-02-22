import {freeze} from 'immer'
import {asyncBehavior} from '@yoroi/common'

import {tokenMocks} from './token.mocks'
import {PortfolioApi, PortfolioApiTokenDiscoveriesResponse} from '../types'

export const responseTokenDiscoveriesMocks =
  asyncBehavior.maker<PortfolioApiTokenDiscoveriesResponse>({
    data: tokenMocks.apiResponse.tokenDiscoveries,
    emptyRepresentation: [],
  })

export const responseTokenInfosMocks = asyncBehavior.maker({
  data: tokenMocks.apiResponse.tokenInfos,
  emptyRepresentation: [],
})

const success: PortfolioApi = {
  tokenDiscoveries: responseTokenDiscoveriesMocks.success,
  tokenInfos: responseTokenInfosMocks.success,
}

const delayed: PortfolioApi = {
  tokenDiscoveries: responseTokenDiscoveriesMocks.delayed,
  tokenInfos: responseTokenInfosMocks.delayed,
}

const loading: PortfolioApi = {
  tokenDiscoveries: responseTokenDiscoveriesMocks.loading,
  tokenInfos: responseTokenInfosMocks.loading,
}

const error: PortfolioApi = {
  tokenDiscoveries: responseTokenDiscoveriesMocks.error.unknown,
  tokenInfos: responseTokenInfosMocks.error.unknown,
}

const empty: PortfolioApi = {
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
