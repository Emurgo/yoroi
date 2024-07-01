import {Api, Portfolio} from '@yoroi/types'

import {parseSecondaryTokenInfoWithCacheRecord} from '../../validators/token-info'
import {
  DullahanApiCachedIdsRequest,
  DullahanApiTokenInfosResponse,
} from './types'

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
        tokenInfoWithCache as Api.ResponseWithCache<Portfolio.Token.Info>

      if (!parseSecondaryTokenInfoWithCacheRecord(castedTokenInfoWithCache))
        throw new Api.Errors.ResponseMalformed(
          'Unable to parse the token-info response',
        )

      const [statusCode] = castedTokenInfoWithCache

      if (statusCode === Api.HttpStatusCode.NotModified) {
        return {...acc, [castedId]: castedTokenInfoWithCache}
      }

      const [, tokenInfo, hash, maxAge] = castedTokenInfoWithCache

      acc[castedId] = [statusCode, tokenInfo, hash, maxAge]

      return acc
    },
    apiCachedTokenInfos,
  )
}

export const toDullahanRequest = (
  request: ReadonlyArray<Api.RequestWithCache<Portfolio.Token.Id>>,
) =>
  request.map(
    ([tokenId, hash]) => `${tokenId}:${hash}`,
  ) as DullahanApiCachedIdsRequest
