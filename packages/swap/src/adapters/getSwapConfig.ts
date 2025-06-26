import {Api, Portfolio, Swap} from '@yoroi/types'
import {TokenIdSchema} from '@yoroi/portfolio'
import {FetchData, fetchData, getApiError, isLeft} from '@yoroi/common'

import {freeze} from 'immer'
import {z} from 'zod'

type SwapConfig = z.infer<typeof SwapConfigResponseSchema>
type Options = {
  request: FetchData
}

const initialDeps = freeze({request: fetchData}, true)
export const getSwapConfigApiMaker =
  ({request}: Options = initialDeps) =>
  async (): Promise<SwapConfig> => {
    const response = await request<SwapConfig>({
      url: 'https://daehx1qv45z7c.cloudfront.net/swapConfig.json',
    })

    if (isLeft(response)) throw getApiError(response.error)

    const parsedResponse = SwapConfigResponseSchema.safeParse(
      response.value.data,
    )
    if (!parsedResponse.success) {
      throw new Api.Errors.ResponseMalformed(
        'Invalid swap config response: ' + JSON.stringify(response.value.data),
      )
    }

    return parsedResponse.data
  }

const SwapConfigResponseSchema = z.object({
  initialPair: z
    .object({
      tokenIn: TokenIdSchema.refine((_): _ is Portfolio.Token.Id => true),
      tokenOut: TokenIdSchema.refine((_): _ is Portfolio.Token.Id => true),
    })
    .optional(),
  verifiedTokens: z
    .array(TokenIdSchema.refine((_): _ is Portfolio.Token.Id => true))
    .optional(),
  excludedTokens: z
    .array(TokenIdSchema.refine((_): _ is Portfolio.Token.Id => true))
    .optional(),
  partners: z
    .object({
      [Swap.Aggregator.Dexhunter]: z.string().optional(),
      [Swap.Aggregator.Muesliswap]: z.string().optional(),
    })
    .optional(),
})
