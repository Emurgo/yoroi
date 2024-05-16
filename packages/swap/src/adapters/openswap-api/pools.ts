import {SWAP_API_ENDPOINTS} from './config'
import type {
  ApiDeps,
  LiquidityPoolResponse,
  PoolPairResponse,
  Provider,
  TokenAddress,
} from './types'

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

export async function getPoolsPair(
  deps: ApiDeps,
  args: {tokenA: TokenAddress; tokenB: TokenAddress},
): Promise<PoolPairResponse> {
  const {tokenA, tokenB} = args
  const {network, client} = deps
  const params: {[key: string]: string} = {
    'policy-id1': tokenA.policyId,
    'policy-id2': tokenB.policyId,
  }

  if ('assetName' in tokenA) params.tokenname1 = tokenA.assetName
  if ('assetName' in tokenB) params.tokenname2 = tokenB.assetName

  // note: {tokenname-hex} will overwrites {tokenname}
  if ('assetNameHex' in tokenA) params['tokenname-hex1'] = tokenA.assetNameHex
  if ('assetNameHex' in tokenB) params['tokenname-hex2'] = tokenB.assetNameHex

  const apiUrl = SWAP_API_ENDPOINTS[network].getPoolsPair
  const response = await client.get<PoolPairResponse>('', {
    baseURL: apiUrl,
    params,
  })

  if (response.status !== 200) {
    throw new Error('Failed to fetch pools pair for token pair', {
      cause: response.data,
    })
  }

  return response.data
}
