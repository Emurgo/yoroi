import {Api, Portfolio} from '@yoroi/types'

export type DullahanApiTokenInfosResponse = Readonly<{
  [key: Portfolio.Token.Id]: Api.ResponseWithCache<Portfolio.Token.Info>
}>

export type DullahanApiTokenInfoResponse = Readonly<
  Api.Response<Portfolio.Token.Info>
>

export type DullahanApiTokenTraitsResponse = Readonly<
  Portfolio.Token.Traits & {
    collection: string
    name: string
  }
>

export type DullahanApiTokenDiscoveryResponse =
  Readonly<Portfolio.Token.Discovery>

export type DullahanIdWithCache = `${string}.${string}:${string}`

export type DullahanApiCachedIdsRequest = ReadonlyArray<DullahanIdWithCache>
