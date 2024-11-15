import {Portfolio} from '@yoroi/types'

export type TokensResponse = Array<{
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
}>

export type OrdersAggregatorResponse = Array<{
  fromToken: {
    address: {
      policyId: string
      name: string
    }
    symbol: string
    image: string
    decimalPlaces: number
  }
  toToken: {
    address: {
      policyId: string
      name: string
    }
    symbol: string
    image: string
    decimalPlaces: number
  }
  batchToken: {
    address: {
      policyId: string
      name: string
    }
    symbol: string
    decimalPlaces: number
  }
  batcherFee: string
  fromAmount: string
  toAmount: string
  attachedValues: [
    {
      address: {
        policyId: string
        name: string
      }
      amount: string
    },
  ]
  owner: string
  sender: string
  providerSpecifics?: string
  txHash: string
  outputIdx: 0
  status: 'open' | string
  provider: string
  placedAt?: number
  finalizedAt?: number
  batcherAddress: string
}>

export type OrdersHistoryResponse = Array<{
  attachedLvl: number
  finalizedAt: number
  fromAmount: string
  fromToken: TokensResponse[0]['info']
  outputIdx: number | null
  paidAmount: string
  placedAt: number
  pubKeyHash: string
  receivedAmount: string | number
  status: 'matched' | string
  toAmount: string
  toToken: TokensResponse[0]['info']
  txHash: string
  scriptVersion?: string
  aggregatorPlatform?: string | null
  stakeKeyHash?: string
  dex?: string
}>

export type CancelRequest = {
  utxo: string // order UTxO from the smart contract to cancel. e.g. "txhash#0".
  collateralUtxo: string // collateral UTxOs to use for canceling the order in cbor format.
  wallet: string // address of the wallet that owns the order in cbor format.
}

export type CancelResponse = {
  status: 'success' | string
  cbor: string
}

export const Provider = {
  minswap: 'minswap',
  sundaeswap: 'sundaeswap',
  wingriders: 'wingriders',
  muesliswap: 'muesliswap',
  muesliswap_v1: 'muesliswap_v1',
  muesliswap_v2: 'muesliswap_v2',
  muesliswap_v3: 'muesliswap_v3',
  muesliswap_v4: 'muesliswap_v4',
  vyfi: 'vyfi',
  spectrum: 'spectrum',
} as const

export type Provider = (typeof Provider)[keyof typeof Provider]

export type LiquidityPoolRequest = {
  'only-verified': 'y' | 'n'
  'token-a': string
  'token-b': string
  'providers': string
}

export type PoolToken = {
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
export type LiquidityPoolResponse = Array<{
  tokenA: PoolToken
  tokenB: PoolToken
  feeToken: Omit<PoolToken, 'amount' | 'status' | 'priceAda'>
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
}>

export type Pools = Array<{
  tokenIn: Portfolio.Token.Id
  tokenOut: Portfolio.Token.Id
  tokenInDecimals: number
  tokenOutDecimals: number
  tokenInSupply: number
  tokenOutSupply: number
  tokenInPtPrice: number
  tokenOutPtPrice: number
  deposit: number
  lpTokenId?: Portfolio.Token.Id
  batcherFee: number
  fee: number
  poolId: string
  provider: Provider
}>

export type ConstructSwapDatumRequest = {
  walletAddr: string
  protocol: Provider
  poolId: string
  sellTokenPolicyID: string
  sellTokenNameHex: string
  sellAmount: string
  buyTokenPolicyID: string
  buyTokenNameHex: string
  buyAmount: string
}

export type ConstructSwapDatumResponse = {
  status: 'success' | string
  datum: string
  hash: string
  address: string
}
