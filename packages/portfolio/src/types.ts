import {Chain, Portfolio} from '@yoroi/types'

// check to use Cache-Control (replacement for MaxAge)
export type AppApiResponseWithCache<T> =
  | [StatusCode: 200, T, ETag: string, MaxAge: number]
  | [StatusCode: 304, MaxAge: number]

export type AppApiRequestWithCache<T> = [T, ETag: string]

export type PortfolioApiTokenInfosResponse = Readonly<{
  [key: Portfolio.Token.Id]: AppApiResponseWithCache<Portfolio.Token.Discovery>
}>

export type PortfolioApiTokenDiscoveriesResponse = Readonly<{
  [key: Portfolio.Token.Id]: AppApiResponseWithCache<Portfolio.Token.Discovery>
}>

export type PortfolioApi = {
  tokenInfos(
    tokenIdsWithCache: ReadonlyArray<
      AppApiRequestWithCache<Portfolio.Token.Id>
    >,
  ): Promise<PortfolioApiTokenInfosResponse>
  tokenDiscoveries(
    tokenIdsWithCache: ReadonlyArray<
      AppApiRequestWithCache<Portfolio.Token.Id>
    >,
  ): Promise<PortfolioApiTokenDiscoveriesResponse>
}

type ApiEndpoints = Readonly<{
  [K in keyof PortfolioApi]: string
}>

export type ApiConfig = Readonly<{
  [K in Chain.Network]: ApiEndpoints
}>
