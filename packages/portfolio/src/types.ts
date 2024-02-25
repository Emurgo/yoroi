import {Chain, Portfolio} from '@yoroi/types'

import {portfolioStorageMaker} from './adapters/mmkv-storage/storage-maker'

// check to use Cache-Control (replacement for MaxAge)
export type AppApiResponseWithCache<T> =
  | [StatusCode: 200, Record: T, ETag: string, MaxAge: number]
  | [StatusCode: 304, MaxAge: number]

export type AppApiRequestWithCache<T> = [Record: T, ETag: string]

export type PortfolioApiTokenInfosResponse = Readonly<{
  [key: Portfolio.Token.Id]: AppApiResponseWithCache<Portfolio.Token.Info>
}>

export type PortfolioApiTokenDiscoveriesResponse = Readonly<{
  [key: Portfolio.Token.Id]: AppApiResponseWithCache<Portfolio.Token.Discovery>
}>

export type PortfolioApi = Readonly<{
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
}>

type ApiEndpoints = Readonly<{
  [K in keyof PortfolioApi]: string
}>

export type ApiConfig = Readonly<{
  [K in Chain.Network]: ApiEndpoints
}>

export type PortfolioManager = Readonly<{
  hydrate(): Promise<void>
}>

// TODO: type it
export type PortfolioStorage = ReturnType<typeof portfolioStorageMaker>
