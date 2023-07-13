import axios from 'axios';

export type Pool = {
  provider: 'minswap' | 'sundaeswap' | 'wingriders' | 'muesliswap_v1' | 'muesliswap_v2' | 'muesliswap_v3',
  fee: string, // % pool liquidity provider fee, usually 0.3.
  tokenA: {
    amount: string, // amount of tokenA in the pool, without decimals.
    token: string, // hexadecimal representation of tokenA, i.e. "." for lovelace, "8a1cfae21368b8bebbbed9800fec304e95cce39a2a57dc35e2e3ebaa.4d494c4b" for MILK.
  },
  tokenB: {
    amount: string, // amount of tokenB in the pool, without decimals.
    token: string, // hexadecimal representation of tokenB, i.e. "." for lovelace, "8a1cfae21368b8bebbbed9800fec304e95cce39a2a57dc35e2e3ebaa.4d494c4b" for MILK.
  },
  price: number, // float, current price in tokenA / tokenB according to the pool, NOT SUITABLE for price calculations, just for display purposes, i.e. 0.9097362621640215.
  batcherFee: {
    amount: string, // amount of fee taken by protocol batchers, in lovelace.
    token: '.',
  },
  deposit: number, // amount of deposit / minUTxO required by protocol, returned to user, in lovelace.
  utxo: string, // txhash#txindex of latest transaction involving this pool.
  poolId: string, // identifier of the pool across platforms.
  timestamp: string, // latest update of this pool in UTC, i.e. 2023-05-23 06:13:26.
  lpToken: {
    amount: string, // amount of lpToken minted by the pool, without decimals.
    token: string, // hexadecimal representation of lpToken,
  },
};

const client = axios.create({
  baseURL: 'https://onchain2.muesliswap.com/pools',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

/**
 * @param tokenA the token to swap from.
 * @param tokenB the token to swap to.
 * @returns a list of pools for the given token pair.
 */
export const getPools = async (
  tokenA: { policyId: string, assetName: string },
  tokenB: { policyId: string, assetName: string },
): Promise<Pool[]> => {
  const response = await client
    .get(`/pair?policy-id1=${tokenA.policyId}&tokenname1=${tokenA.assetName}&policy-id2=${tokenB.policyId}&tokenname-hex2=${tokenB.assetName}`);

  if (response.status !== 200) {
    throw new Error('Failed to fetch pools for token pair', { cause: response.data });
  }

  return response.data;
}
