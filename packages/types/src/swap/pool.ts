import {BalanceAmount} from '../balance/token'

export type SwapPoolProvider =
  | 'minswap'
  | 'sundaeswap'
  | 'wingriders'
  | 'muesliswap'
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
  ptPriceTokenA: string // float, current price in lovelace of tokenA, i.e. 0.000000000000000000.
  ptPriceTokenB: string // float, current price in lovelace of tokenB, i.e. 0.000000000000000000.
  batcherFee: BalanceAmount
  deposit: BalanceAmount // amount of deposit / minUTxO required by protocol, returned to user, in lovelace.
  // utxo: string // txhash#txindex of latest transaction involving this pool.
  poolId: string // identifier of the pool across platforms.
  lpToken: BalanceAmount
}
