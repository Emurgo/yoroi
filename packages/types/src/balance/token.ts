type BalanceTokenInfo<Meta = BalanceCardanoMetadatas> = {
  kind: 'ft' | 'nft'

  id: string
  fingerprint: string // fingerprint is temporary since we can't use it as id for now
  group: string // for cardano policy id
  name: string // for cardano asset name

  description: string | undefined
  image: string | undefined // link to image
  icon: string | undefined // base64 encoded

  decimals: number | undefined
  symbol: string | undefined // shorthand as monetary i.e Ω
  ticker: string | undefined // shorthand as token e.g. ADA

  // metatada should be used only for NFT gallery
  metadatas: Meta
}

export type BalanceCardanoMetadatas = {
  mintNft?: NftMetadata
  mintFt?: FtMetadata
  tokenRegistry?: FtMetadata
}

type FtMetadata = {
  description: string | Array<string> | undefined
  icon: string | Array<string> | undefined
  decimals: number | undefined
  ticker: string | undefined
  url: string | undefined
  version: string | undefined
}

type NftMetadata = unknown

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
  total: string // total circulating supply of the token, without decimals.
  circulating: string | null // if set the circulating supply of the token, if null the amount in circulation is unknown.
}

type BalanceTokenStatus = 'verified' | 'unverified' | 'scam' | 'outdated'

export type BalanceToken = {
  info: BalanceTokenInfo
  price: BalanceTokenPrice
  supply: BalanceTokenSupply
  status: BalanceTokenStatus
}

export type BalanceQuantity = `${number}`

export type BalanceAmounts = {
  [tokenId: string]: BalanceQuantity
}

export type BalanceAmount = {
  tokenId: string
  quantity: BalanceQuantity
}
