import {FetchData, fetchData, getApiError, isLeft} from '@yoroi/common'
import {TokenIdSchema} from '@yoroi/portfolio'
import {Portfolio} from '@yoroi/types'
import {z} from 'zod'

type SwapConfig = z.infer<typeof SwapConfigResponseSchema>

export const getSwapConfigApiMaker =
  (
    {
      request,
    }: {
      request: FetchData
    } = {request: fetchData},
  ) =>
  async (): Promise<SwapConfig> => {
    const response = await request<SwapConfig>({
      url: 'https://daehx1qv45z7c.cloudfront.net/swapConfig.json',
    })

    if (isLeft(response)) throw getApiError(response.error)

    if (!SwapConfigResponseSchema.safeParse(response.value.data).success) {
      throw new Error(
        'Invalid swap config response: ' + JSON.stringify(response.value.data),
      )
    }

    return response.value.data
  }

const SwapConfigResponseSchema = z.object({
  initialPair: z.object({
    tokenIn: TokenIdSchema.refine((_): _ is Portfolio.Token.Id => true),
    tokenOut: TokenIdSchema.refine((_): _ is Portfolio.Token.Id => true),
  }),
})
