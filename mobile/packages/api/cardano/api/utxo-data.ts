import {Fetcher, createTypeGuardFromSchema, fetcher} from '@yoroi/common'
import {Api} from '@yoroi/types'

import {z} from 'zod'

/**
 * Migrated to backend-zero: GET /v0/transactions/{hash}
 * Extracts output at specified index from transaction response
 */
export const getUtxoData =
  (baseUrl: string, request: Fetcher = fetcher) =>
  async ({
    txHash,
    txIndex,
  }: Api.Cardano.UtxoDataRequest): Promise<Api.Cardano.UtxoData> => {
    // Query transaction from backend-zero
    const tx = await request<{
      hash: string
      block: string
      inputs: Array<{
        txHash: string
        index: number
        source: {
          amount: Record<string, string>
          address: string
          index: number
          datumHash?: string
        }
      }>
      outputs: Array<{
        amount: Record<string, string>
        address: string
        index: number
        datumHash?: string
      }>
      fee: Record<string, string>
      certificates: unknown[]
      withdrawals: unknown[]
      when: string
    }>({
      url: `${baseUrl}/transactions/${txHash}`,
      data: undefined,
      method: 'GET',
      headers: {'Content-Type': 'application/json'},
    })

    // Extract output at specified index
    const output = tx.outputs[txIndex]
    if (!output) {
      return Promise.reject(
        new Error(
          `Output at index ${txIndex} not found in transaction ${txHash}`,
        ),
      )
    }

    // Map to legacy format
    const lovelaces = output.amount.$lovelaces || '0'
    const assets: Api.Cardano.UtxoDataAsset[] = Object.entries(
      output.amount,
    )
      .filter(([key]) => key !== '$lovelaces')
      .map(([assetId, amount]) => {
        const parts = assetId.split('.')
        const policyId = parts[0] || ''
        const nameHex = parts[1] || ''
        return {
          assetId,
          policyId,
          name: nameHex,
          amount: amount.toString(),
        }
      })

    const utxoData: Api.Cardano.UtxoData = {
      output: {
        address: output.address,
        amount: lovelaces,
        dataHash: output.datumHash || null,
        assets,
      },
      spendingTxHash: null, // Would require querying UTXOs endpoint to determine
    }

    const parsedResponse = parseUtxoDataResponse(utxoData)
    if (!parsedResponse)
      return Promise.reject(new Error('Invalid utxo data response'))
    return Promise.resolve(parsedResponse)
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
