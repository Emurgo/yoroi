import {z} from 'zod'
import {createTypeGuardFromSchema, fetcher, Fetcher} from '@yoroi/common'
import {App} from '@yoroi/types'

export const getSwapConfigWrapper =
  (baseUrl: string, request: Fetcher = fetcher) =>
  async (): Promise<App.SwapConfigResponse> => {
    return request<App.SwapConfigResponse>({
      url: `${baseUrl}/v1/swap/config`,
      data: undefined,
      method: 'GET',
      headers: {'Content-Type': 'application/json'},
    }).then((response) => {
      const parsedResponse = parseSwapConfigResponse(response)
      if (!parsedResponse)
        return Promise.reject(new Error('Invalid swap config response'))

      return Promise.resolve(parsedResponse)
    })
  }

const SwapConfigAggregatorSchema = z.union([
  z.literal('muesliswap'),
  z.literal('dexhunter'),
])

const AppSwapFrontendFeesTierSchema = z.object({
  primaryTokenValueThreshold: z.string(),
  secondaryTokenBalanceThreshold: z.string(),
  variableFeeMultiplier: z.number(),
  fixedFee: z.string(),
})

const AppSwapConfigResponseSchema = z
  .object({
    aggregators: z.record(
      z.object({
        isEnabled: z.boolean(),
        frontendFeeTiers: z.array(AppSwapFrontendFeesTierSchema),
        discountTokenId: z.string(),
      }),
    ),
    liquidityProvidersEnabled: z.array(z.string()),
    isSwapEnabled: z.boolean(),
  })
  .refine(
    (object) => {
      const keys = Object.keys(object.aggregators)
      return keys.every(
        (key) => SwapConfigAggregatorSchema.safeParse(key).success,
      )
    },
    {
      message: "Aggregator key must be 'muesliswap', 'dexhunter'",
    },
  )

export const isSwapConfigResponse = createTypeGuardFromSchema(
  AppSwapConfigResponseSchema,
)

export const parseSwapConfigResponse = (
  data: unknown,
): App.SwapConfigResponse | undefined => {
  return isSwapConfigResponse(data) ? data : undefined
}
