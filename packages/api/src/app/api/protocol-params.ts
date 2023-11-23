import {z} from 'zod'
import {createTypeGuardFromSchema, fetcher, Fetcher} from '@yoroi/common'
import {App} from '@yoroi/types'

export const getProtocolParams =
  (baseUrl: string, request: Fetcher = fetcher) =>
  async (): Promise<any> => {
    console.log('[baseUrl]', baseUrl)
    return request<App.FrontendProtocolParamsResponse>({
      // url: `${baseUrl}/protocolparameters`, // only on preprod
      url: 'https://dev-yoroi-backend-zero-preprod.emurgornd.com/protocolparameters',
      data: undefined,
      method: 'GET',
      headers: {'Content-Type': 'application/json'},
    }).then((response) => {
      const parsedResponse = parseFrontendProtocolParamsResponse(response)

      if (!parsedResponse)
        return Promise.reject(new Error('Invalid protocol params response'))
      return Promise.resolve(parsedResponse)
    })
  }

const AppFrontendProtocolParamsTierSchema = z.object({
  epoch: z.number(),
  min_fee_a: z.number(),
  min_fee_b: z.number(),
  max_block_size: z.number(),
  max_tx_size: z.number(),
  max_block_header_size: z.number(),
  key_deposit: z.string(),
  pool_deposit: z.string(),
  min_utxo: z.string(),
  min_pool_cost: z.string(),
  price_mem: z.number(),
  price_step: z.number(),
  max_tx_ex_mem: z.string(),
  max_tx_ex_steps: z.string(),
  max_block_ex_mem: z.string(),
  max_block_ex_steps: z.string(),
  max_val_size: z.string(),
  collateral_percent: z.number(),
  max_collateral_inputs: z.number(),
  coins_per_utxo_size: z.string(),
  coins_per_utxo_word: z.string(),
})

const AppFrontendFeesResponseSchema = AppFrontendProtocolParamsTierSchema

export const isFrontendProtocolParamsResponse = createTypeGuardFromSchema(
  AppFrontendFeesResponseSchema,
)

export const parseFrontendProtocolParamsResponse = (
  data: App.FrontendProtocolParamsResponse,
): App.FrontendProtocolParamsResponse | undefined => {
  const filteredObject = pick(data, [
    'epoch',
    'min_fee_a',
    'min_fee_b',
    'max_block_size',
    'max_tx_size',
    'max_block_header_size',
    'key_deposit',
    'pool_deposit',
    'min_utxo',
    'min_pool_cost',
    'price_mem',
    'price_step',
    'max_tx_ex_mem',
    'max_tx_ex_steps',
    'max_block_ex_mem',
    'max_block_ex_steps',
    'max_val_size',
    'collateral_percent',
    'max_collateral_inputs',
    'coins_per_utxo_size',
    'coins_per_utxo_word',
  ])

  return isFrontendProtocolParamsResponse(filteredObject)
    ? filteredObject
    : undefined
}

export const pick = <T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
): Pick<T, K> => {
  const result: any = {}

  if (obj == null) {
    return result
  }

  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key]
    }
  })

  return result
}
