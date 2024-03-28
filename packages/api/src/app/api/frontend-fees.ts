import {z} from 'zod'
import {createTypeGuardFromSchema, fetcher, Fetcher} from '@yoroi/common'
import {App} from '@yoroi/types'

/**
 * @deprecated in favour of getSwapConfig
 */
export const getFrontendFees =
  (baseUrl: string, request: Fetcher = fetcher) =>
  async (): Promise<App.FrontendFeesResponse> => {
    return request<App.FrontendFeesResponse>({
      url: `${baseUrl}/v2.1/swap/feesInfo`,
      data: undefined,
      method: 'GET',
      headers: {'Content-Type': 'application/json'},
    }).then((response) => {
      const parsedResponse = parseFrontendFeesResponse(response)
      if (!parsedResponse)
        return Promise.reject(new Error('Invalid frontend fee response'))

      return Promise.resolve(parsedResponse)
    })
  }

const SwapAggregatorSchema = z.union([
  z.literal('muesliswap'),
  z.literal('dexhunter'),
])

const AppFrontendFeesTierSchema = z.object({
  primaryTokenValueThreshold: z.string(),
  secondaryTokenBalanceThreshold: z.string(),
  variableFeeMultiplier: z.number(),
  fixedFee: z.string(),
})

const AppFrontendFeesResponseSchema = z
  .record(z.array(AppFrontendFeesTierSchema))
  .refine(
    (object) => {
      const keys = Object.keys(object)
      return keys.every((key) => SwapAggregatorSchema.safeParse(key).success)
    },
    {
      message:
        "Aggregator must be 'muesliswap', 'dexhunter', or an empty object",
    },
  )

export const isFrontendFeesResponse = createTypeGuardFromSchema(
  AppFrontendFeesResponseSchema,
)

export const parseFrontendFeesResponse = (
  data: unknown,
): App.FrontendFeesResponse | undefined => {
  return isFrontendFeesResponse(data) ? data : undefined
}
