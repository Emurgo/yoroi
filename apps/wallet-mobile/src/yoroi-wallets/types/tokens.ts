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
