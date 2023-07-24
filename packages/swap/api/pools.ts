import { Swap } from '@yoroi/types';
import { SWAP_API_ENDPOINTS, axiosClient } from './config';
import fs from 'node:fs';

type BaseTokenInfo =
  | { policyId: string; assetName: string }
  | { policyId: string; assetNameHex: string };

export class SwapPoolsApi {
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
    tokenA: BaseTokenInfo,
    tokenB: BaseTokenInfo
  ): Promise<Swap.Pool[]> {
    const params: { [key: string]: string } = {
      'policy-id1': tokenA.policyId,
      'policy-id2': tokenB.policyId,
    };

    if ('assetName' in tokenA) params['tokenname1'] = tokenA.assetName;
    if ('assetName' in tokenB) params['tokenname2'] = tokenB.assetName;

    // note: {tokenname-hex} will overwrites {tokenname}
    if ('assetNameHex' in tokenA)
      params['tokenname-hex1'] = tokenA.assetNameHex;
    if ('assetNameHex' in tokenB)
      params['tokenname-hex2'] = tokenB.assetNameHex;

    const response = await axiosClient.get('', {
      baseURL: this.apiUrl,
      params,
    });

    if (response.status !== 200) {
      throw new Error('Failed to fetch pools for token pair', {
        cause: response.data,
      });
    }

    return response.data;
  }
}
