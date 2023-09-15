import {BalanceAmount} from '../balance/token'

export type SwapPoolProvider =
  | 'minswap'
  | 'sundaeswap'
  | 'wingriders'
  | 'muesliswap_v1'
  | 'muesliswap_v2'
  | 'muesliswap_v3'
  | 'muesliswap_v4'
  | 'vyfi'
  | 'spectrum'

export type SwapPool = {
  provider: SwapPoolProvider
  fee: string // % pool liquidity provider fee, usually 0.3.
  tokenA: BalanceAmount
  tokenB: BalanceAmount
  price: number // float, current price in tokenA / tokenB according to the pool, NOT SUITABLE for price calculations, just for display purposes, i.e. 0.9097362621640215.
  batcherFee: BalanceAmount
  deposit: BalanceAmount // amount of deposit / minUTxO required by protocol, returned to user, in lovelace.
  // utxo: string // txhash#txindex of latest transaction involving this pool.
  poolId: string // identifier of the pool across platforms.
  lastUpdate: string // latest update of this pool in UTC, i.e. 2023-05-23 06:13:26.
  lpToken: BalanceAmount
}
