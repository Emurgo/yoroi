import {SWAP_API_ENDPOINTS} from './config'
import type {ApiDeps, ListTokensResponse} from './types'

export async function getTokens(deps: ApiDeps): Promise<ListTokensResponse> {
  const {network, client} = deps
  if (network === 'preprod') return []

  const apiUrl = SWAP_API_ENDPOINTS[network].getTokens
  const response = await client.get<ListTokensResponse>('', {
    baseURL: apiUrl,
  })

  if (response.status !== 200) {
    throw new Error('Failed to fetch tokens', {cause: response.data})
  }

  return response.data
}
