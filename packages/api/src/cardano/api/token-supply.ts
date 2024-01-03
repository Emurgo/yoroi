import {z} from 'zod'
import {createTypeGuardFromSchema, fetcher, Fetcher} from '@yoroi/common'

import {getTokenIdentity} from '../translators/helpers/getTokenIdentity'
import {Api} from '@yoroi/types'

export const getTokenSupply =
  (baseUrl: string, request: Fetcher = fetcher) =>
  async (
    tokenIds: Api.Cardano.TokenSupplyRequest,
  ): Promise<Api.Cardano.TokenSupplyResponse> => {
    if (tokenIds.length === 0) {
      return Promise.resolve({})
    }

    const assetsMap = new Map<
      Api.Cardano.TokenId,
      {policy: string; name: string}
    >(
      tokenIds.map((id) => {
        const {policyId: policy, name} = getTokenIdentity(id)
        return [id, {policy, name}]
      }),
    )

    const payload = {assets: Array.from(assetsMap.values())}

    return request<Api.Cardano.TokenSupplyResponse>({
      url: `${baseUrl}/multiAsset/supply?numberFormat=string`,
      data: payload,
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
    }).then((response) => {
      const parsedResponse = parseTokenSupplyResponse(response)
      if (!parsedResponse)
        return Promise.reject(new Error('Invalid asset supplies'))

      const result: Record<Api.Cardano.TokenId, Api.Cardano.TokenSupplyRecord> =
        {} // need any here TS issues with key indexing
      const supplies: Record<
        Api.Cardano.TokenId,
        Api.Cardano.TokenSupplyRecord | undefined
      > = parsedResponse.supplies

      Array.from(assetsMap.entries()).forEach(([id, {policy, name}]) => {
        const tokenId: Api.Cardano.TokenId = `${policy}.${name}`
        result[id] = supplies[tokenId] ?? null
      })

      return Promise.resolve(result)
    })
  }

type TokenSupplyResponse = {
  supplies: {[key: Api.Cardano.TokenId]: Api.Cardano.TokenSupplyRecord}
}

const TokenSupplySchema: z.ZodSchema<TokenSupplyResponse> = z.object({
  supplies: z.record(z.string().nullable()),
})

export const isTokenSupplyResponse =
  createTypeGuardFromSchema(TokenSupplySchema)

export const parseTokenSupplyResponse = (
  data: unknown,
): TokenSupplyResponse | undefined => {
  return isTokenSupplyResponse(data) ? data : undefined
}
