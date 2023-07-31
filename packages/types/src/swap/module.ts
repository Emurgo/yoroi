import {BalanceAmount, BalanceToken} from '../balance/token'

export type SwapOrderType = 'market' | 'limit'
export type SwapNetwork = 'mainnet' | 'preprod'

export type SwapProtocol =
  | 'minswap'
  | 'sundaeswap'
  | 'wingriders'
  | 'muesliswap'

export type SwapCreateOrderResponse = {
  datum: string
  datumHash: string
  contractAddress: string
}

export type SwapOpenOrder = {
  provider: SwapProtocol
  from: BalanceAmount
  to: BalanceAmount
  deposit: BalanceAmount
  utxo: string
}

export type SwapFactoryOptions = {
  network: SwapNetwork
  stakingKey: string
}

export type SwapCreateOrderData = {
  amounts: {
    sell: BalanceAmount
    buy: BalanceAmount
  }
  address: string
  slippage: number
} & (
  | {
      protocol: Omit<SwapProtocol, 'sundaeswap'>
      poolId: string | undefined // only required for SundaeSwap trades.
    }
  | {
      protocol: 'sundaeswap'
      poolId: string
    }
)

export type SwapCancelOrderData = {
  utxos: {
    order: string
    collaterals: Array<string>
  }
  address: string
}

export type SwapPool = {
  provider:
    | 'minswap'
    | 'sundaeswap'
    | 'wingriders'
    | 'muesliswap_v1'
    | 'muesliswap_v2'
    | 'muesliswap_v3'
  fee: BalanceAmount
  tokenA: BalanceAmount
  tokenB: BalanceAmount
  price: number // float, current price in tokenA / tokenB according to the pool, NOT SUITABLE for price calculations, just for display purposes, i.e. 0.9097362621640215.
  batcherFee: {
    amount: string // amount of fee taken by protocol batchers, in lovelace.
    token: '.'
  }
  deposit: BalanceAmount // amount of deposit / minUTxO required by protocol, returned to user, in lovelace.
  utxo: string // txhash#txindex of latest transaction involving this pool.
  poolId: string // identifier of the pool across platforms.
  timestamp: string // latest update of this pool in UTC, i.e. 2023-05-23 06:13:26.
  lpToken: BalanceAmount
}

export interface SwapApi {
  createOrder(order: SwapCreateOrderData): Promise<SwapCreateOrderResponse>
  cancelOrder(
    orderUTxO: string,
    collateralUTxO: string,
    walletAddress: string,
  ): Promise<string>
  getOrders(stakeKeyHash: string): Promise<SwapOpenOrder[]>
  getPools(
    tokenA: BalanceToken['info']['id'],
    tokenB: BalanceToken['info']['id'],
  ): Promise<SwapPool[]>
  getTokens(policyId?: string, assetName?: string): Promise<BalanceToken>
}
