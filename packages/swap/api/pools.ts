import { Swap } from '@yoroi/types';
import { SWAP_API_ENDPOINTS, axiosClient } from './config';

export async function getPools(
  network: Swap.Netowrk,
  tokenA: Swap.BaseTokenInfo,
  tokenB: Swap.BaseTokenInfo
): Promise<Swap.Pool[]> {
  const params: { [key: string]: string } = {
    'policy-id1': tokenA.policyId,
    'policy-id2': tokenB.policyId,
  };

  if ('assetName' in tokenA) params['tokenname1'] = tokenA.assetName;
  if ('assetName' in tokenB) params['tokenname2'] = tokenB.assetName;

  // note: {tokenname-hex} will overwrites {tokenname}
  if ('assetNameHex' in tokenA) params['tokenname-hex1'] = tokenA.assetNameHex;
  if ('assetNameHex' in tokenB) params['tokenname-hex2'] = tokenB.assetNameHex;

  const apiUrl = SWAP_API_ENDPOINTS[network].getPools;
  const response = await axiosClient.get('', {
    baseURL: apiUrl,
    params,
  });

  if (response.status !== 200) {
    throw new Error('Failed to fetch pools for token pair', {
      cause: response.data,
    });
  }

  return response.data;
}
