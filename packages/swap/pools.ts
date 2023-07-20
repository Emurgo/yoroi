import { Swap } from '@yoroi/types';
import { AxiosInstance } from 'axios';
import axios from 'axios';
import { SWAP_API_ENDPOINTS } from './config';

export class SwapPools {
  private readonly apiUrl: string;

  constructor(public readonly network: Swap.Netowrk) {
    this.apiUrl = SWAP_API_ENDPOINTS[network].getPools;
  }

  /**
   * @param tokenA the token to swap from.
   * @param tokenB the token to swap to.
   * @returns a list of pools for the given token pair.
   */
  public async getPools(
    tokenA: { policyId: string; assetName: string },
    tokenB: { policyId: string; assetName: string }
  ): Promise<Swap.Pool[]> {
    const response = await axios.get(
      `/?policy-id1=${tokenA.policyId}&tokenname1=${tokenA.assetName}&policy-id2=${tokenB.policyId}&tokenname-hex2=${tokenB.assetName}`,
      {
        baseURL: this.apiUrl,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status !== 200) {
      throw new Error('Failed to fetch pools for token pair', {
        cause: response.data,
      });
    }

    return response.data;
  }
}
