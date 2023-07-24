import { Swap } from '@yoroi/types';
import { SWAP_API_ENDPOINTS, axiosClient } from './api/config';

export class SwapTokensApi {
  private readonly apiUrl: string;

  constructor(netwok: Swap.Netowrk) {
    this.apiUrl = SWAP_API_ENDPOINTS[netwok].getTokens;
  }

  public async getTokens(
    policyId = '',
    assetName = ''
  ): Promise<Swap.TokenInfo[]> {
    const response = await axiosClient.get<Swap.TokenInfo[]>(
      `/?base-policy-id=${policyId}&base-tokenname=${assetName}`,
      {
        baseURL: this.apiUrl,
      }
    );

    if (response.status !== 200) {
      throw new Error('Failed to fetch tokens', { cause: response.data });
    }

    return response.data;
  }
}
