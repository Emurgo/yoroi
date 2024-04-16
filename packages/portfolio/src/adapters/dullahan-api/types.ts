import {Api, Portfolio} from '@yoroi/types'

export type DullahanApiTokenInfosResponse = Readonly<{
  [key: Portfolio.Token.Id]: Api.ResponseWithCache<
    Omit<Portfolio.Token.Info, 'nature'>
  >
}>
