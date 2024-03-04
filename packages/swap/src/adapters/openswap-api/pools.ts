import {SWAP_API_ENDPOINTS} from './config'
import type {ApiDeps, LiquidityPoolResponse, Provider} from './types'

export async function getLiquidityPools(
  deps: ApiDeps,
  args: {tokenA: string; tokenB: string; providers: ReadonlyArray<Provider>},
): Promise<LiquidityPoolResponse> {
  const {tokenA, tokenB, providers} = args
  const {network, client} = deps

  const params: {[key: string]: string} = {
    'token-a': tokenA,
    'token-b': tokenB,
    'providers': providers.join(','),
  }

  const apiUrl = SWAP_API_ENDPOINTS[network].getLiquidityPools
  const response = await client.get<LiquidityPoolResponse>('', {
    baseURL: apiUrl,
    params,
  })

  if (response.status !== 200) {
    throw new Error('Failed to fetch liquidity pools for token pair', {
      cause: response.data,
    })
  }

  return response.data
}
