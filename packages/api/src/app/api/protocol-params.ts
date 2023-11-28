import {z} from 'zod'
import {createTypeGuardFromSchema, fetcher, Fetcher} from '@yoroi/common'
import {App} from '@yoroi/types'
import {asYoroiParams} from './transformers/asYoroiParams'
import {YOROI_PARAMS_KEYS} from './constants'

export const getProtocolParams =
  (baseUrl: string, request: Fetcher = fetcher) =>
  async (): Promise<any> => {
    console.log('[baseUrl]', baseUrl)
    return request<App.FrontendProtocolParamsResponse>({
      url: `${baseUrl}/protocolparameters`,
      data: undefined,
      method: 'GET',
      headers: {'Content-Type': 'application/json'},
    }).then((response: any) => {
      const parsedResponse = parseFrontendProtocolParamsResponse(response)

      if (!parsedResponse)
        return Promise.reject(new Error('Invalid protocol params response'))
      return Promise.resolve(parsedResponse)
    })
  }

const AppFrontendProtocolParamsTierSchema = z.object({
  min_fee_a: z.number(),
  min_fee_b: z.number(),
  key_deposit: z.string(),
  pool_deposit: z.string(),
  min_utxo: z.string(),
  coins_per_utxo_word: z.string(),
})

const AppFrontendFeesResponseSchema = AppFrontendProtocolParamsTierSchema

export const isFrontendProtocolParamsResponse = createTypeGuardFromSchema(
  AppFrontendFeesResponseSchema,
)

export const parseFrontendProtocolParamsResponse = (
  data: App.FrontendProtocolParamsResponse,
): App.FrontendProtocolParamsResponse | undefined => {
  const filteredObject = asYoroiParams(data, YOROI_PARAMS_KEYS)

  return isFrontendProtocolParamsResponse(filteredObject)
    ? filteredObject
    : undefined
}
