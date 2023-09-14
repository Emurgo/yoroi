import {AxiosInstance} from 'axios'

export type CancelOrderRequest = {
  orderUTxO: string // order UTxO from the smart contract to cancel. e.g. "txhash#0".
  collateralUTxO: string // collateral UTxOs to use for canceling the order in cbor format.
  walletAddress: string // address of the wallet that owns the order in cbor format.
}

export type CreateOrderRequest = {
  walletAddress: string
  protocol: Protocol
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
  provider: Protocol
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

export type CompletedOrder = {
  from: {
    amount: string
    token: string
  }
  to: {
    amount: string
    token: string
  }
  utxo: string
}

export type ApiV2Order = {
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

export type Protocol =
  | 'minswap'
  | 'sundaeswap'
  | 'wingriders'
  | 'muesliswap_v1'
  | 'muesliswap_v2'
  | 'muesliswap_v3'
  | 'muesliswap_v4'

export type Network = 'mainnet' | 'preprod'

export type Pool = {
  provider:
    | 'minswap'
    | 'sundaeswap'
    | 'wingriders'
    | 'muesliswap_v1'
    | 'muesliswap_v2'
    | 'muesliswap_v3'
    | 'muesliswap_v4'
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
    token: '.'
  }
  deposit: number // amount of deposit / minUTxO required by protocol, returned to user, in lovelace.
  utxo: string // txhash#txindex of latest transaction involving this pool.
  poolId: string // identifier of the pool across platforms.
  timestamp: string // latest update of this pool in UTC, i.e. 2023-05-23 06:13:26.
  lpToken: {
    amount: string // amount of lpToken minted by the pool, without decimals.
    token: string // hexadecimal representation of lpToken,
  }
}

export type Token = {
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
  }
  price: {
    volume: {
      base: number // float, trading volume 24h in base currency (e.g. ADA).
      quote: number // float, trading volume 24h in quote currency.
    }
    volumeChange: {
      base: number // float, percent change of trading volume in comparison to previous 24h.
      quote: number // float, percent change of trading volume in comparison to previous 24h.
    }
    price: number // live trading price in base currency (e.g. ADA).
    askPrice: number // lowest ask price in base currency (e.g. ADA).
    bidPrice: number // highest bid price in base currency (e.g. ADA).
    priceChange: {
      '24h': number // float, price change last 24 hours.
      '7d': number // float, price change last 7 days.
    }
    quoteDecimalPlaces: number // decimal places of quote token.
    baseDecimalPlaces: number // decimal places of base token.
    price10d: number[] //float, prices of this tokens averaged for the last 10 days, in chronological order i.e.oldest first.
  }
}

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
