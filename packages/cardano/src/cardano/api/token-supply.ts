import {z} from 'zod'
import {createTypeGuardFromSchema, fetcher} from '@yoroi/common'

import {
  ApiTokenId,
  ApiTokenSupplyRecord,
  ApiTokenSupplyResponse,
  ApiTokeSupplyRequest,
} from './types'
import {getTokenIdentity} from '../translators/formatters/cardano-token-id'

export const getTokenSupply =
  (baseUrl: string, request = fetcher) =>
  async (tokenIds: ApiTokeSupplyRequest): Promise<ApiTokenSupplyResponse> => {
    if (tokenIds.length === 0) {
      return Promise.resolve({})
    }

    const assetsMap = new Map<string, {policy: string; name: string}>(
      tokenIds.map((id) => {
        const {policyId: policy, name} = getTokenIdentity(id)
        return [id, {policy, name}]
      }),
    )

    const payload = {assets: Array.from(assetsMap.values())}

    return request<ApiTokenSupplyResponse>({
      url: `${baseUrl}/multiAsset/supply`,
      data: payload,
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
    }).then((response) => {
      const parsedResponse = parseTokenSupplyResponse(response)
      if (!parsedResponse)
        return Promise.reject(new Error('Invalid asset supplies'))

      const result: any = {} // need any here TS issues with key indexing
      const supplies: Record<ApiTokenId, ApiTokenSupplyRecord | undefined> =
        parsedResponse.supplies

      Array.from(assetsMap.entries()).forEach(([id, {policy, name}]) => {
        const tokenId: ApiTokenId = `${policy}.${name}`
        result[id] = supplies[tokenId] ?? null
      })

      return Promise.resolve(result as ApiTokenSupplyResponse) // casting here
    })
  }

type TokenSupplyResponse = {
  supplies: {[key: ApiTokenId]: ApiTokenSupplyRecord}
}

const TokenSupplySchema: z.ZodSchema<TokenSupplyResponse> = z.object({
  supplies: z.record(z.number().nullable()),
})

export const isTokenSupplyResponse =
  createTypeGuardFromSchema(TokenSupplySchema)

export const parseTokenSupplyResponse = (
  data: unknown,
): TokenSupplyResponse | undefined => {
  return isTokenSupplyResponse(data) ? data : undefined
}
