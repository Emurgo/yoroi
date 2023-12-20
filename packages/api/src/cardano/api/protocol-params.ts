import {z} from 'zod'
import {createTypeGuardFromSchema, fetcher, Fetcher} from '@yoroi/common'
import {Api} from '@yoroi/types'

export const getProtocolParams =
  (baseUrl: string, request: Fetcher = fetcher) =>
  async (): Promise<Api.Cardano.ProtocolParamsResult> => {
    return request<Api.Cardano.ProtocolParamsResult>({
      url: `${baseUrl}/protocolparameters`,
      data: undefined,
      method: 'GET',
      headers: {'Content-Type': 'application/json'},
    }).then((response: Api.Cardano.ProtocolParamsResult) => {
      const parsedResponse = parseFrontendProtocolParamsResponse(response)

      if (!parsedResponse)
        return Promise.reject(new Error('Invalid protocol params response'))
      return Promise.resolve(parsedResponse)
    })
  }

export const parseFrontendProtocolParamsResponse = (
  data: Api.Cardano.ProtocolParamsResult,
): Api.Cardano.ProtocolParamsResult | undefined => {
  return isFrontendProtocolParamsResponse(data) ? data : undefined
}

const AppFrontendProtocolParamsTierSchema = z.object({
  coinsPerUtxoByte: z.string(),
  keyDeposit: z.string(),
  linearFee: z.object({
    coefficient: z.string(),
    constant: z.string(),
  }),
  poolDeposit: z.string(),
})

const AppFrontendFeesResponseSchema = AppFrontendProtocolParamsTierSchema

export const isFrontendProtocolParamsResponse = createTypeGuardFromSchema(
  AppFrontendFeesResponseSchema,
)
