import {createTypeGuardFromSchema, fetcher, Fetcher} from '@yoroi/common'
import {Api} from '@yoroi/types'

import {z} from 'zod'

export const getUtxoData =
  (baseUrl: string, request: Fetcher = fetcher) =>
  async ({
    txHash,
    txIndex,
  }: Api.Cardano.UtxoDataRequest): Promise<Api.Cardano.UtxoData> => {
    return request<Api.Cardano.UtxoData>({
      url: `${baseUrl}/api/txs/io/${txHash}/o/${txIndex}`,
      data: undefined,
      method: 'GET',
      headers: {'Content-Type': 'application/json'},
    }).then((response: Api.Cardano.UtxoData) => {
      const parsedResponse = parseUtxoDataResponse(response)

      if (!parsedResponse)
        return Promise.reject(new Error('Invalid utxo data response'))
      return Promise.resolve(parsedResponse)
    })
  }

export const parseUtxoDataResponse = (
  data: Api.Cardano.UtxoData,
): Api.Cardano.UtxoData | undefined => {
  return isUtxosDataResponse(data) ? data : undefined
}

const AssetSchema = z.object({
  assetId: z.string(),
  policyId: z.string(),
  name: z.string(),
  amount: z.string(),
})

const UtxoDataSchema = z.object({
  output: z.object({
    address: z.string(),
    amount: z.string(),
    dataHash: z.string().nullable(),
    assets: z.array(AssetSchema),
  }),
  spendingTxHash: z.string().nullable().optional(),
})

export const isUtxosDataResponse = createTypeGuardFromSchema(UtxoDataSchema)
