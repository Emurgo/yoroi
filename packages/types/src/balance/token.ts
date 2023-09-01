type BalanceTokenInfo<Meta = BalanceCardanoMetadatas> = {
  kind: 'ft' | 'nft'

  id: string // TODO: is set based on rawUtxo if tokens don't contain `.` it will fail (empty name)
  fingerprint: string // fingerprint is temporary since we can't use it as id for now
  group: string // for cardano policy id
  name: string // for cardano asset name

  description: string | null
  image: string | null // link to image
  icon: string | null // base64 encoded
  mediaType: string | null // image mimetype (e.g. image/png)

  decimals: number | null // if null decimals are unknown
  symbol: string | null // shorthand as monetary i.e Ω
  ticker: string | null // shorthand as token e.g. ADA

  // metatada should be used only for NFT gallery
  metadatas: Meta
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
  total: string // total circulating supply of the token, without decimals.
  circulating: string | null // if set the circulating supply of the token, if null the amount in circulation is unknown.
}

type BalanceTokenStatus = 'verified' | 'unverified' | 'scam' | 'outdated'

export type BalanceToken = {
  info: BalanceTokenInfo
  price: BalanceTokenPrice
  supply: BalanceTokenSupply | null
  status: BalanceTokenStatus | null
  balance: BalanceQuantity
}

export type BalanceQuantity = `${number}`

export type BalanceAmounts = {
  [tokenId: string]: BalanceQuantity
}

export type BalanceAmount = {
  tokenId: string
  quantity: BalanceQuantity
}

export type BalanceCardanoMetadatas = {
  mintNft?: CardanoNftMetadata
  isValidMintNft?: boolean
  mintFt?: CardanoFtMetadata
  isValidMintFt?: boolean
  tokenRegistry?: CardanoFtMetadata
  isValidTokenRegistry?: boolean
}

type CardanoFtMetadata = {
  name: string
  description: string | Array<string> | null
  icon: string | Array<string> | null
  decimals: number | null
  ticker: string | null
  url: string | null
  [key: string]: unknown
}

type CardanoNftMetadataFile = {
  name?: string
  mediaType?: string
  src?: string | Array<string>
  [key: string]: unknown
}

type CardanoNftMetadata = {
  name: string
  image: string | Array<string>
  mediaType?: string
  description?: string | Array<string>
  // It adds support to files as object (some erroneous NFTs have this)
  files?: Array<CardanoNftMetadataFile> | CardanoNftMetadataFile
  [key: string]: unknown
}
