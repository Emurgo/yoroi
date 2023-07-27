import { Swap } from '@yoroi/types';
import { SWAP_API_ENDPOINTS, axiosClient } from './config';

export async function getTokens(
  network: Swap.Network,
  policyId = '',
  assetName = ''
): Promise<Swap.TokenInfo[]> {
  if (network === 'preprod') return [];

  const apiUrl = SWAP_API_ENDPOINTS[network].getTokens;
  const response = await axiosClient.get<Swap.TokenInfo[]>('', {
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
