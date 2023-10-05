import {SWAP_API_ENDPOINTS} from './config'
import type {ApiDeps, PoolResponseV2, TokenAddress} from './types'

export async function getPoolsV2(
  deps: ApiDeps,
  args: {tokenA: TokenAddress; tokenB: TokenAddress},
): Promise<PoolResponseV2> {
  const {tokenA, tokenB} = args
  const {network, client} = deps

  const providers = [
    'minswap',
    'sundaeswap',
    'wingriders',
    'muesliswap_v1',
    'muesliswap_v2',
    'muesliswap_v3',
    'muesliswap_v4',
    'vyfi',
    'spectrum',
  ]

  const params: {[key: string]: string} = {
    'token-a': normaliseTokenAddress(tokenA),
    'token-b': normaliseTokenAddress(tokenB),
    'providers': providers.join(','),
  }

  const apiUrl = SWAP_API_ENDPOINTS[network].getPoolsV2
  const response = await client.get<PoolResponseV2>('', {
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

function normaliseTokenAddress(tokenA: TokenAddress): string {
  const hexName =
    'assetNameHex' in tokenA
      ? tokenA.assetNameHex
      : stringToHex(tokenA.assetName)
  return `${tokenA.policyId}.${hexName}`
}

function stringToHex(str: string): string {
  let hex = ''
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i)
    const hexValue = charCode.toString(16)

    hex += hexValue.padStart(2, '0')
  }
  return hex
}
