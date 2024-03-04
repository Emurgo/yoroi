import {Balance} from '@yoroi/types'

export type Quantity = `${number}`
export type Price = `${number}`

export type Aggregator = 'muesliswap' | 'dexhunter'

export type DexName =
  | 'MINSWAP'
  | 'VYFI'
  | 'WINGRIDER'
  | 'SUNDAESWAP'
  | 'SPECTRUM'
  | 'MUESLISWAP'
  | 'CROSSCHAIN'
  | 'TEDDY'

export type TokensRequest = {}

export type TokensResponse = {
  tokens: Balance.TokenInfo[]
}

export type Order = {
  id: string // input utxo
  date: string
  amountIn: Quantity
  amountOut: Quantity
  tokenIn: string
  tokenOut: string
  dex: DexName
  aggregator: Aggregator
}

export type OrdersRequest = {
  status?: 'open' | 'completed' | 'cancelled'
}

export type OrdersResponse = {
  orders: Order[]
}

export type CancelRequest = {
  orderId: string
  collateralUtxo?: string // TODO needed here?
}

export type CancelBulkRequest = {
  orderIds: string[]
}

export type CancelResponse = {
  cbor: string
  additionalCancellationFee?: Quantity
}

type AmountIn = {
  amountIn: Quantity
  amountOut?: never
  limitPrice?: Price
}

type AmountOut = {
  amountIn?: never
  amountOut: Quantity
  limitPrice?: never
}

type AmountInOrOut = AmountIn | AmountOut

type CommonRequest = {
  tokenIn: string
  tokenOut: string
  slippage: number
  avoidDexes?: DexName[]
  preferredDex?: DexName
}

export type EstimateRequest = AmountInOrOut & CommonRequest

export type EstimateResponse = {
  // TODO
  amountIn: Quantity
  amountOut: Quantity
}
/*
DH:
{
    "splits": [
        {
            "amount_in": 10,
            "expected_output": 12505,
            "expected_output_without_slippage": 12505,
            "fee": 4000000,
            "dex": "SPECTRUM",
            "price_impact": 3.016960259998178,
            "initial_price": 1289.4007069199092,
            "final_price": 1289.3946472977232,
            "t1_amt": 64186588045,
            "t2_amt": 82762232,
            "pool_id": "000000000000000000000000000000000000000000000000000000006c6f76656c616365279c909f348e533da5808898f87f9a14bb2c3dfbbacccd631d927a3f534e454bSPECTRUMa937fa63410caf445b291cf4b673f42507fc7956466d07d701698bda534e454b5f4144415f4e4654",
            "batcher_fee": 1.5,
            "deposits": 2.5,
            "price_distortion": 0.047484804121832674,
            "pool_fee": 0.03
        }
    ],
    "average_price": 1289.3946472977232,
    "total_fee": 4000000,
    "total_output": 12505,
    "deposits": 2.5,
    "total_output_without_slippage": 12505,
    "possible_routes": {
        "AGGREGATED": 11103,
        "BONUS": 0
    },
    "dexhunter_fee": 0,
    "batcher_fee": 1.5,
    "price_ab": 1309.8278156260799,
    "price_ba": 0.0007634591265127574,
    "total_input": 10,
    "net_price": 893.2142857142857,
    "net_price_reverse": 0.0011195521791283487,
    "partner_fee": 1
}

SP:
{
  order: {
    side?: 'buy' | 'sell'
    slippage: number
    orderType: Swap.OrderType
    limitPrice?: Balance.Quantity
    amounts: {
      sell: Balance.Amount
      buy: Balance.Amount
    }
    lpTokenHeld?: Balance.Amount
  }
  sides: {
    sell: Balance.Amount
    buy: Balance.Amount
  }
  pool: Swap.Pool
  prices: {
    base: Balance.Quantity
    market: Balance.Quantity
    actualPrice: Balance.Quantity
    withSlippage: Balance.Quantity
    withFees: Balance.Quantity
    withFeesAndSlippage: Balance.Quantity
    difference: Balance.Quantity
    priceImpact: Balance.Quantity
  }
  hasSupply: boolean
  buyAmountWithSlippage: Balance.Amount
  ptTotalValueSpent?: Balance.Amount
  cost: {
    liquidityFee: Balance.Amount
    deposit: Balance.Amount
    batcherFee: Balance.Amount
    frontendFeeInfo: {
      discountTier?: App.FrontendFeeTier
      fee: Balance.Amount
    }
    ptTotalRequired: Balance.Amount
  }
}
*/

export type CreateRequest = AmountIn & CommonRequest

export type CreateResponse = {}

// TODO: Response
