import { Swap } from '@yoroi/types';
import { SWAP_API_ENDPOINTS, axiosClient } from './config';

export class SwapTokensApi {
  private readonly apiUrl: string;

  constructor(public readonly netwok: Swap.Netowrk) {
    this.apiUrl = SWAP_API_ENDPOINTS[netwok].getTokens;
  }

  public async getTokens(
    policyId = '',
    assetName = ''
  ): Promise<Swap.TokenInfo[]> {
    if (this.netwok === 'preprod') return [];

    const response = await axiosClient.get<Swap.TokenInfo[]>('', {
      baseURL: this.apiUrl,
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
}
