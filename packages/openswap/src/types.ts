import {AxiosInstance} from 'axios'

export type CancelOrderRequest = {
  orderUTxO: string // order UTxO from the smart contract to cancel. e.g. "txhash#0".
  collateralUTxO: string // collateral UTxOs to use for canceling the order in cbor format.
  walletAddress: string // address of the wallet that owns the order in cbor format.
}

export type CreateOrderRequest = {
  walletAddress: string
  protocol: Provider // only in the CreateOrder they call provider as protocol
  poolId?: string // only required for SundaeSwap trades.
  sell: {
    policyId: string
    assetName: string // hexadecimal representation of token, i.e. "" for lovelace, "4d494c4b" for MILK.
    amount: string
  }
  buy: {
    policyId: string
    assetName: string // hexadecimal representation of token, i.e. "" for lovelace, "4d494c4b" for MILK.
    amount: string
  }
}

export type CreateOrderResponse =
  | {status: 'failed'; reason?: string}
  | {status: 'success'; hash: string; datum: string; address: string}

export type OpenOrder = {
  provider: Provider
  owner: string
  from: {
    amount: string
    token: string
  }
  to: {
    amount: string
    token: string
  }
  deposit: string
  utxo: string
}
export type OpenOrderResponse = OpenOrder[]

export type CompletedOrder = {
  toToken: {
    address: {
      policyId: string
      name: string
    }
  }
  toAmount: string
  fromToken: {
    address: {
      policyId: string
      name: string
    }
  }
  fromAmount: string
  placedAt: number
  status: string
  receivedAmount: string
  paidAmount: string
  finalizedAt: any
  txHash: string
  outputIdx: number
  attachedLvl: string
  scriptVersion: string
  pubKeyHash: string
  feeField: number
}
export type CompletedOrderResponse = CompletedOrder[]

export type Provider =
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
// | 'muesliswap_clp'

export type Network = 'mainnet' | 'preprod'

// NOTE: TBR
export type PoolPair = {
  provider: Provider
  fee: string // % pool liquidity provider fee, usually 0.3.
  tokenA: {
    amount: string // amount of tokenA in the pool, without decimals.
    token: string // hexadecimal representation of tokenA, i.e. "." for lovelace, "8a1cfae21368b8bebbbed9800fec304e95cce39a2a57dc35e2e3ebaa.4d494c4b" for MILK.
  }
  tokenB: {
    amount: string // amount of tokenB in the pool, without decimals.
    token: string // hexadecimal representation of tokenB, i.e. "." for lovelace, "8a1cfae21368b8bebbbed9800fec304e95cce39a2a57dc35e2e3ebaa.4d494c4b" for MILK.
  }
  price: number // float, current price in tokenA / tokenB according to the pool, NOT SUITABLE for price calculations, just for display purposes, i.e. 0.9097362621640215.
  batcherFee: {
    amount: string // amount of fee taken by protocol batchers, in lovelace.
    token: string // most likely "." for lovelace.
  }
  deposit: number // amount of deposit / minUTxO required by protocol, returned to user, in lovelace.
  utxo: string // txhash#txindex of latest transaction involving this pool.
  poolId: string // identifier of the pool across platforms.
  timestamp: string // latest update of this pool in UTC, i.e. 2023-05-23 06:13:26.
  lpToken: {
    amount: string // amount of lpToken minted by the pool, without decimals.
    token: string // hexadecimal representation of lpToken,
  }
  depositFee: {
    amount: string // amount of fee taken by protocol batchers, in lovelace.
    token: string // most likely "." for lovelace.
  }
  batcherAddress: string // address of the protocol batcher.
}
export type PoolPairResponse = PoolPair[]

export type TokenPair = {
  info: {
    supply: {
      total: string // total circulating supply of the token, without decimals.
      circulating: string | null // if set the circulating supply of the token, if null the amount in circulation is unknown.
    }
    status: 'verified' | 'unverified' | 'scam' | 'outdated'
    address: {
      policyId: string // policy id of the token.
      name: string // hexadecimal representation of token name.
    }
    symbol: string // shorthand token symbol.
    image?: string // http link to the token image.
    website: string
    description: string
    decimalPlaces: number // number of decimal places of the token, i.e. 6 for ADA and 0 for MILK.
    categories: string[] // encoding categories as ids.
    sign?: string // token sign, i.e. "₳" for ADA.
  }
  price: {
    volume: {
      base: string // float, trading volume 24h in base currency (e.g. ADA).
      quote: string // float, trading volume 24h in quote currency.
    }
    volumeChange: {
      base: number // float, percent change of trading volume in comparison to previous 24h.
      quote: number // float, percent change of trading volume in comparison to previous 24h.
    }
    price: number // live trading price in base currency (e.g. ADA).
    askPrice: number // lowest ask price in base currency (e.g. ADA).
    bidPrice: number // highest bid price in base currency (e.g. ADA).
    priceChange: {
      '24h': string // float, price change last 24 hours.
      '7d': string // float, price change last 7 days.
    }
    quoteDecimalPlaces: number // decimal places of quote token.
    baseDecimalPlaces: number // decimal places of base token.
    price10d: number[] //float, prices of this tokens averaged for the last 10 days, in chronological order i.e.oldest first.
  }
}
export type TokenPairsResponse = TokenPair[]

export type TokenInfo = Omit<TokenPair['info'], 'sign'>
export type ListTokensResponse = TokenInfo[]

export type TokenAddress =
  | {
      policyId: string
      assetName: string
    }
  | {
      policyId: string
      assetNameHex: string
    }

export type ApiDeps = {
  network: Network
  client: AxiosInstance
}

export type PriceAddress = {
  policyId: string
  name: string
}

type VolumeAggregator = {
  [key in Provider]?: {
    quote: number
    base: number
  }
}

export type PriceResponse = {
  baseDecimalPlaces: number
  quoteDecimalPlaces: number
  baseAddress: PriceAddress
  quoteAddress: PriceAddress
  askPrice: number
  bidPrice: number
  price: number
  volume: {
    base: string
    quote: string
  }
  volumeAggregator: VolumeAggregator
  volumeTotal: {
    base: number
    quote: number
  }
  volumeChange: {
    base: number
    quote: number
  }
  priceChange: {
    '24h': string
    '7d': string
  }
  marketCap: number
}

export type LiquidityPoolResponse = LiquidityPool[]
export type LiquidityPool = {
  tokenA: {
    address: {
      policyId: string
      name: string
    }
    symbol?: string
    image?: string
    decimalPlaces: number
    amount: string
    status: string
    priceAda: number
  }
  tokenB: {
    address: {
      policyId: string
      name: string
    }
    symbol?: string
    image?: string
    decimalPlaces: number
    amount: string
    status: string
    priceAda: number
  }
  feeToken: {
    address: {
      policyId: string
      name: string
    }
    symbol?: string
    image?: string
    decimalPlaces: number
  }
  batcherFee: string
  lvlDeposit: string
  poolFee: string
  lpToken: {
    address?: {
      policyId: string
      name: string
    }
    amount?: string
  }
  poolId: string
  provider: Provider
  txHash?: string
  outputIdx?: number
  volume24h?: number
  volume7d?: number
  liquidityApy?: number
  priceASqrt?: any
  priceBSqrt?: any
  batcherAddress: string
}
