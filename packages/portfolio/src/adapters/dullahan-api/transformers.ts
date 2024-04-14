import {Api, Portfolio} from '@yoroi/types'

import {parseSecondaryTokenInfoWithCacheRecord} from '../../validators/token-info'
import {DullahanApiTokenInfosResponse} from './types'

export const toSecondaryTokenInfo = (
  tokenInfo: Omit<Portfolio.Token.Info, 'nature'>,
): Portfolio.Token.Info => ({
  ...tokenInfo,
  nature: Portfolio.Token.Nature.Secondary,
})

export const toSecondaryTokenInfos = (
  apiTokenInfosResponse: DullahanApiTokenInfosResponse,
) => {
  const apiCachedTokenInfos: Record<
    Portfolio.Token.Id,
    Api.ResponseWithCache<Portfolio.Token.Info>
  > = {}

  return Object.entries(apiTokenInfosResponse).reduce(
    (acc, [id, tokenInfoWithCache]) => {
      const castedId = id as Portfolio.Token.Id
      const castedTokenInfoWithCache =
        tokenInfoWithCache as Api.ResponseWithCache<
          Omit<Portfolio.Token.Info, 'nature'>
        >

      if (!parseSecondaryTokenInfoWithCacheRecord(castedTokenInfoWithCache))
        throw new Api.Errors.ResponseMalformed(
          'Unable to parse the token-info response',
        )

      const [statusCode] = castedTokenInfoWithCache

      if (statusCode === Api.HttpStatusCode.NotModified) {
        acc[castedId] = castedTokenInfoWithCache
        return acc
      }

      const [, tokenInfo, hash, maxAge] = castedTokenInfoWithCache
      const updatedTokenInfo = toSecondaryTokenInfo(tokenInfo)

      acc[castedId] = [statusCode, updatedTokenInfo, hash, maxAge]

      return acc
    },
    apiCachedTokenInfos,
  )
}
