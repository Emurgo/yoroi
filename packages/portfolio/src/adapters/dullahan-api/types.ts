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

export type DullahanApiTokenActivityRecord = Readonly<{
  price: {
    ts: number
    open: string // BN
    close: string // BN
    low: string // BN
    high: string // BN
    change: number
  }
}>

export type DullahanApiTokenActivity = [
  Api.HttpStatusCode,
  DullahanApiTokenActivityRecord,
]

export type DullahanApiTokenActivityResponse = Readonly<{
  [key: Portfolio.Token.Id]: DullahanApiTokenActivity
}>

export type DullahanApiTokenHistoryResponse = Readonly<Portfolio.Token.History>

export type ProcessedMediaApiTokenImageInvalidateRequest = {
  name: string
  policy: string
}
