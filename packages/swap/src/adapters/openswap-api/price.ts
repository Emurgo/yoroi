import {SWAP_API_ENDPOINTS} from './config'
import type {ApiDeps, PriceAddress, PriceResponse} from './types'

export async function getPrice(
  deps: ApiDeps,
  args: {baseToken: PriceAddress; quoteToken: PriceAddress},
): Promise<PriceResponse> {
  const {baseToken, quoteToken} = args
  const {network, client} = deps
  const params: {[key: string]: string} = {
    'base-policy-id': baseToken.policyId,
    'base-token-name': baseToken.policyId,
    'quote-policy-id': quoteToken.policyId,
    'quote-token-name': quoteToken.policyId,
  }

  const apiUrl = SWAP_API_ENDPOINTS[network].getPrice
  const response = await client.get<PriceResponse>('', {
    baseURL: apiUrl,
    params,
  })

  if (response.status !== 200) {
    throw new Error('Failed to fetch price for token pair', {
      cause: response.data,
    })
  }

  return response.data
}
