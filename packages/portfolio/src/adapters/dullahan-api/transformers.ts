import {Api, Portfolio} from '@yoroi/types'
import {BigNumber} from 'bignumber.js'
import {freeze} from 'immer'

import {parseSecondaryTokenInfoWithCacheRecord} from '../../validators/token-info'
import {
  DullahanApiCachedIdsRequest,
  DullahanApiTokenActivityResponse,
  DullahanApiTokenInfosResponse,
} from './types'
import {z} from 'zod'

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

      if (statusCode === Api.HttpStatusCode.InternalServerError) {
        return acc
      }

      const [, tokenInfo, hash, maxAge] = castedTokenInfoWithCache

      acc[castedId] = [statusCode, tokenInfo, hash, maxAge]

      return acc
    },
    apiCachedTokenInfos,
  )
}

export const toTokenActivityUpdates = (
  apiTokenActivityResponse: Readonly<DullahanApiTokenActivityResponse>,
) => {
  const tokenActivityUpdates: Record<
    Portfolio.Token.Id,
    Portfolio.Token.Activity
  > = {}

  return freeze(
    Object.entries(apiTokenActivityResponse).reduce(
      (acc, [id, tokenActivity]) => {
        if (!Array.isArray(tokenActivity)) return acc
        const castedId = id as Portfolio.Token.Id

        const [statusCode, tokenActivityData] = tokenActivity
        if (statusCode !== Api.HttpStatusCode.Ok) return acc

        TokenAcvitivyResponseSchema.parse(tokenActivityData)

        const parsedTokenActivity: Portfolio.Token.Activity = {
          price: {
            ts: tokenActivityData.price.ts,
            open: new BigNumber(tokenActivityData.price.open),
            close: new BigNumber(tokenActivityData.price.close),
            low: new BigNumber(tokenActivityData.price.low),
            high: new BigNumber(tokenActivityData.price.high),
            change: tokenActivityData.price.change,
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

const TokenAcvitivyResponseSchema = z.object({
  price: z.object({
    ts: z.number(),
    open: z.string(),
    close: z.string(),
    low: z.string(),
    high: z.string(),
    change: z.number(),
  }),
})
