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

export type NFTAsset = {
  key: '721'
  metadata?: unknown
}

export type TokenInfo = {
  kind: 'ft' | 'nft'
  id: string
  group: string
  fingerprint: string
  image: string | undefined
  icon: string | undefined
  decimals: number | undefined
  symbol: string | undefined
  name: string
  description: string | undefined
  ticker: string | undefined
  metadatas: {mintNft?: NftMetadata; mintFt?: FtMetadata; tokenRegistry?: FtMetadata}
}

type FtMetadata = {
  description: string | Array<string> | undefined
  icon: string | Array<string> | undefined
  decimals: number | undefined
  ticker: string | undefined
  url: string | undefined
  version: string | undefined
}

export type NftMetadata = unknown
