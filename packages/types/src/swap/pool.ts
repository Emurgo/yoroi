import {PortfolioTokenId} from '../portfolio/token'

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

export type SwapSupportedProvider = Extract<
  SwapPoolProvider,
  | 'minswap'
  | 'wingriders'
  | 'sundaeswap'
  | 'muesliswap'
  | 'muesliswap_v2'
  | 'vyfi'
>

export type SwapPool = {
  provider: SwapSupportedProvider
  fee: string // % pool liquidity provider fee, usually 0.3.
  tokenA: {
    tokenId: PortfolioTokenId
    quantity: bigint
  }
  tokenB: {
    tokenId: PortfolioTokenId
    quantity: bigint
  }
  ptPriceTokenA: string // float, current price in lovelace of tokenA, i.e. 0.000000000000000000.
  ptPriceTokenB: string // float, current price in lovelace of tokenB, i.e. 0.000000000000000000.
  batcherFee: {
    tokenId: PortfolioTokenId
    quantity: bigint
  }
  deposit: {
    // amount of deposit / minUTxO required by protocol, returned to user, in lovelace.
    tokenId: PortfolioTokenId
    quantity: bigint
  }
  // utxo: string // txhash#txindex of latest transaction involving this pool.
  poolId: string // identifier of the pool across platforms.
  lpToken: {
    tokenId: PortfolioTokenId
    quantity: bigint
  }
}
