import {NetworkId} from './other'

export type TokenCommonMetadata = {
  numberOfDecimals: number
  ticker: null | string
  longName: null | string
  maxSupply: null | string
}

export type TokenMetadata = TokenCommonMetadata & {
  type: 'Cardano'
  policyId: string // empty string for ADA
  assetName: string // empty string for ADA
}

export type Token = {
  networkId: NetworkId
  isDefault: boolean
  identifier: string
  metadata: TokenMetadata
}

type SendToken = {
  token: Token
  amount: string // in lovelaces
}
type SendAllToken = {
  token: Token
  shouldSendAll: true
}
export type SendTokenList = Array<SendToken | SendAllToken>

export type DefaultAssetMetadata = TokenCommonMetadata & {
  type: 'Cardano'
  policyId: string // empty string for ADA
  assetName: string // empty string for ADA
  ticker: string
}

export type DefaultAsset = Token & {
  metadata: DefaultAssetMetadata
}

export type LegacyToken = {
  networkId: NetworkId
  isDefault: boolean
  identifier: string
  metadata: TokenMetadata
}

export type NftMetadata = {
  name: string
  image: string | Array<string>
  mediaType?: string
  description?: string | Array<string>
  authors?: string
  author?: string
  files?: Array<{
    name?: string
    mediaType?: string
    src?: string | Array<string>
  }>
}

export type AssetMetadata = {
  [policyID: string]: {[assetNameHex: string]: NftMetadata | undefined} | undefined
}

export type NFTAsset = {
  key: '721'
  metadata: AssetMetadata
}

type TokeInfoCommon = {
  id: string
  fingerprint: string
  name?: string
  description?: string
}

type TokenInfoNFT = TokeInfoCommon & {
  kind: 'nft'
  metadata: {
    image?: string
    thumbnail?: string
    policyId: string
    assetNameHex: string
    originalMetadata?: NftMetadata
  }
}

type TokenInfoFT = TokeInfoCommon & {
  kind: 'ft'
  metadata: {
    group: string // policyId
    decimals: number // default to 0

    ticker: string | undefined
    symbol: string | undefined
    url: string | undefined
    logo: string | undefined
  }
}

export type TokenInfo<T extends 'ft' | 'nft' | 'all' = 'all'> = {
  ft: TokenInfoFT
  nft: TokenInfoNFT
  all: TokenInfoFT | TokenInfoNFT
}[T]
