import {Api, Portfolio} from '@yoroi/types'
import {BigNumber} from 'bignumber.js'
import {freeze} from 'immer'

import {parseSecondaryTokenInfoWithCacheRecord} from '../../validators/token-info'
import {
  DullahanApiCachedIdsRequest,
  DullahanApiTokenActivityUpdatesResponse,
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

export const toTokenActivityUpdates = (
  apiTokenActivityUpdatesResponse: Readonly<DullahanApiTokenActivityUpdatesResponse>,
) => {
  const tokenActivityUpdates: Record<
    Portfolio.Token.Id,
    Portfolio.Token.ActivityUpdates
  > = {}

  return freeze(
    Object.entries(apiTokenActivityUpdatesResponse).reduce(
      (acc, [id, tokenActivity]) => {
        if (!tokenActivity) return acc
        const castedId = id as Portfolio.Token.Id

        const parsedTokenActivity: Portfolio.Token.ActivityUpdates = {
          price24h: {
            ts: tokenActivity.price24h.ts,
            open: new BigNumber(tokenActivity.price24h.open),
            close: new BigNumber(tokenActivity.price24h.close),
            change: tokenActivity.price24h.change,
          },
        }

        acc[castedId] = parsedTokenActivity

        return acc
      },
      tokenActivityUpdates,
    ),
    true,
  )
}

export const toDullahanRequest = (
  request: ReadonlyArray<Api.RequestWithCache<Portfolio.Token.Id>>,
) =>
  request.map(
    ([tokenId, hash]) => `${tokenId}:${hash}`,
  ) as DullahanApiCachedIdsRequest
