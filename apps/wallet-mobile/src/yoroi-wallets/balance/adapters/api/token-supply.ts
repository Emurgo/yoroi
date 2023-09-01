import {createTypeGuardFromSchema} from '@yoroi/wallets'
import {z} from 'zod'

import {hexToUtf8} from '../../../cardano/api'
import {checkedFetch} from '../../../cardano/api/fetch'
import {ApiTokenId, ApiTokenSupplyRecord, ApiTokenSupplyResponse, ApiTokeSupplyRequest} from './types'

export const getTokenSupply =
  (baseUrl: string, fetch = checkedFetch) =>
  async (tokenIds: ApiTokeSupplyRequest): Promise<ApiTokenSupplyResponse> => {
    if (tokenIds.length === 0) {
      return Promise.resolve({})
    }

    const assetsMap = new Map<string, {policy: string; name: string}>(
      tokenIds.map((id) => {
        const [policy, name] = id.split('.')
        return [id, {policy, name: hexToUtf8(name)}]
      }),
    )

    const payload = {assets: Array.from(assetsMap.values())}

    return fetch({
      endpoint: `${baseUrl}/multiAsset/supply`,
      payload,
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
    }).then((response) => {
      const parsedResponse = parseTokenSupplyResponse(response)
      if (!parsedResponse) return Promise.reject(new Error('Invalid asset supplies'))

      const result: ApiTokenSupplyResponse = {}

      Array.from(assetsMap.entries()).forEach(([id, {policy, name}]) => {
        const tokenId = `${policy}.${name}`
        result[id] = parsedResponse.supplies[tokenId]
      })

      return Promise.resolve(result)
    })
  }

type TokenSupplyResponse = {
  supplies: {[key: ApiTokenId]: ApiTokenSupplyRecord}
}

const TokenSupplySchema: z.ZodSchema<TokenSupplyResponse> = z.object({
  supplies: z.record(z.number().nullable()),
})

export const isTokenSupplyResponse = createTypeGuardFromSchema(TokenSupplySchema)

export const parseTokenSupplyResponse = (data: unknown): TokenSupplyResponse | undefined => {
  return isTokenSupplyResponse(data) ? (data as TokenSupplyResponse) : undefined
}
