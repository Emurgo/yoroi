import {Chain, Portfolio} from '@yoroi/types'

import {portfolioStorageMaker} from './adapters/mmkv-storage/storage-maker'

export enum HttpStatusCode {
  Ok = 200,
  NotModified = 304,
}

// check to use Cache-Control (replacement for MaxAge)
export type AppApiResponseRecordWithCache<T> =
  | [StatusCode: HttpStatusCode.Ok, Record: T, ETag: string, MaxAge: number]
  | [StatusCode: HttpStatusCode.NotModified, MaxAge: number]

export type AppApiRequestRecordWithCache<T> = [Record: T, ETag: string]

export type PortfolioApiTokenInfosResponse = Readonly<{
  [key: Portfolio.Token.Id]: AppApiResponseRecordWithCache<Portfolio.Token.Info>
}>

export type PortfolioApiTokenDiscoveriesResponse = Readonly<{
  [
    key: Portfolio.Token.Id
  ]: AppApiResponseRecordWithCache<Portfolio.Token.Discovery>
}>

export type PortfolioApi = Readonly<{
  tokenInfos(
    idsWithETag: ReadonlyArray<
      AppApiRequestRecordWithCache<Portfolio.Token.Id>
    >,
  ): Promise<PortfolioApiTokenInfosResponse>
  tokenDiscoveries(
    idsWithETag: ReadonlyArray<
      AppApiRequestRecordWithCache<Portfolio.Token.Id>
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
  hydrate(): void
  sync(amounts: Readonly<Map<Portfolio.Token.Id, BigInt>>): Promise<void>
}>

// TODO: type it
export type PortfolioStorage = ReturnType<typeof portfolioStorageMaker>
