import {SWAP_API_ENDPOINTS} from './config'
import type {ApiDeps, TokenPairsResponse} from './types'

export async function getTokenPairs(
  deps: ApiDeps,
  {policyId = '', assetName = ''} = {},
): Promise<TokenPairsResponse> {
  const {network, client} = deps
  if (network === 'preprod') return []

  const apiUrl = SWAP_API_ENDPOINTS[network].getTokenPairs
  const response = await client.get<TokenPairsResponse>('', {
    baseURL: apiUrl,
    params: {
      'base-policy-id': policyId,
      'base-tokenname': assetName,
    },
  })

  if (response.status !== 200) {
    throw new Error('Failed to fetch token pairs', {cause: response.data})
  }

  return response.data
}
