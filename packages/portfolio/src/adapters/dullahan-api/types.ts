import {Api, Portfolio} from '@yoroi/types'

export type DullahanApiTokenInfosResponse = Readonly<{
  [key: Portfolio.Token.Id]: Api.ResponseWithCache<
    Omit<Portfolio.Token.Info, 'nature'>
  >
}>

export type DullahanIdWithCache = `${string}.${string}:${string}`

export type DullahanApiCachedIdsRequest = ReadonlyArray<DullahanIdWithCache>
