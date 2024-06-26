import {z} from 'zod'
import {createTypeGuardFromSchema, fetcher, Fetcher} from '@yoroi/common'
import {Api} from '@yoroi/types'

export const getProtocolParams =
  (baseUrl: string, request: Fetcher = fetcher) =>
  async (): Promise<Api.Cardano.ProtocolParams> => {
    return request<Api.Cardano.ProtocolParams>({
      url: `${baseUrl}/protocolparameters`,
      data: undefined,
      method: 'GET',
      headers: {'Content-Type': 'application/json'},
    }).then((response: Api.Cardano.ProtocolParams) => {
      const parsedResponse = parseProtocolParamsResponse(response)

      if (!parsedResponse)
        return Promise.reject(new Error('Invalid protocol params response'))
      return Promise.resolve(parsedResponse)
    })
  }

export const parseProtocolParamsResponse = (
  data: Api.Cardano.ProtocolParams,
): Api.Cardano.ProtocolParams | undefined => {
  return isProtocolParamsResponse(data) ? data : undefined
}

const AppProtocolParamsSchema = z.object({
  coinsPerUtxoByte: z.string(),
  keyDeposit: z.string(),
  linearFee: z.object({
    coefficient: z.string(),
    constant: z.string(),
  }),
  poolDeposit: z.string(),
})

export const isProtocolParamsResponse = createTypeGuardFromSchema(
  AppProtocolParamsSchema,
)
