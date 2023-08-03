import {SWAP_API_ENDPOINTS} from './config'
import type {ApiDeps, Pool, TokenAddress} from './types'

export async function getPools(
  deps: ApiDeps,
  args: {tokenA: TokenAddress; tokenB: TokenAddress},
): Promise<Pool[]> {
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

  const apiUrl = SWAP_API_ENDPOINTS[network].getPools
  const response = await client.get('', {
    baseURL: apiUrl,
    params,
  })

  if (response.status !== 200) {
    throw new Error('Failed to fetch pools for token pair', {
      cause: response.data,
    })
  }

  return response.data
}
