import { Swap } from '@yoroi/types';
import { SWAP_API_ENDPOINTS, axiosClient } from './config';
import type { Token } from './types';

export async function getTokens(
  network: Swap.Network,
  policyId = '',
  assetName = ''
): Promise<Token[]> {
  if (network === 'preprod') return [];

  const apiUrl = SWAP_API_ENDPOINTS[network].getTokens;
  const response = await axiosClient.get<Token[]>('', {
    baseURL: apiUrl,
    params: {
      'base-policy-id': policyId,
      'base-tokenname': assetName,
    },
  });

  if (response.status !== 200) {
    throw new Error('Failed to fetch tokens', { cause: response.data });
  }

  return response.data;
}
