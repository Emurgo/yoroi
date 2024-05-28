import {Api, Portfolio} from '@yoroi/types'

export type DullahanApiTokenInfosResponse = Readonly<{
  [key: Portfolio.Token.Id]: Api.ResponseWithCache<
    Omit<Portfolio.Token.Info, 'nature'>
  >
}>

export type DullahanApiTokenTraitsResponse = Readonly<
  Portfolio.Token.Traits & {
    collection: string
    name: string
  }
>

export type DullahanTokenDiscovery = Omit<
  Portfolio.Token.Discovery,
  'supply'
> & {
  supply: string
}

export type DullahanApiTokenDiscoveryResponse = Readonly<DullahanTokenDiscovery>

export type DullahanIdWithCache = `${string}.${string}:${string}`

export type DullahanApiCachedIdsRequest = ReadonlyArray<DullahanIdWithCache>
