type BalanceTokenInfo = {
  kind: 'ft' | 'nft'

  id: string // TODO: is set based on rawUtxo if tokens don't contain `.` it will fail (empty name)
  fingerprint: string // fingerprint is temporary since we can't use it as id for now
  group: string // for cardano policy id
  name: string // for cardano asset name

  description?: string
  image?: string // link to image
  icon?: string // base64 encoded
  mediaType?: string // image mimetype (e.g. image/png)

  decimals?: number // if null decimals are unknown
  symbol?: string // shorthand as monetary i.e Ω
  ticker?: string // shorthand as token e.g. ADA

  website?: string // link to website
}

export type BalanceTokenFile = {
  [key: string]: unknown
  name?: string
  mediaType: string
  src: string | string[]
}

type BalanceTokenPrice = {
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

type BalanceTokenSupply = {
  total: BalanceQuantity // total circulating supply of the token, without decimals.
  circulating?: BalanceQuantity // if set the circulating supply of the token, if  undefined the amount in circulation is unknown.
}

type BalanceTokenStatus = 'verified' | 'unverified' | 'scam' | 'outdated'

export type BalanceToken<M extends Record<string, unknown> = {}> = {
  info: BalanceTokenInfo
  files?: Array<BalanceTokenFile>
  price?: BalanceTokenPrice
  supply?: BalanceTokenSupply
  status?: BalanceTokenStatus
  metadatas?: M
  balance?: BalanceQuantity
}

export type BalanceTokenRecords<M extends Record<string, unknown> = {}> = {
  [tokenId: BalanceTokenInfo['id']]: BalanceToken<M>
}

export type BalanceQuantity = `${number}`

export type BalanceAmounts = {
  [tokenId: string]: BalanceQuantity
}

export type BalanceAmount = {
  tokenId: string
  quantity: BalanceQuantity
}
