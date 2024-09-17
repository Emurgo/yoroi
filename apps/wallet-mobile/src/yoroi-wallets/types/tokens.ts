type TokenCommonMetadata = {
  numberOfDecimals: number
  ticker: null | string
  longName: null | string
  maxSupply: null | string
}

type TokenMetadata = TokenCommonMetadata & {
  policyId: string // empty string for ADA
  assetName: string // empty string for ADA
}

export type Token = {
  isDefault: boolean
  identifier: string
  metadata: TokenMetadata
}

type DefaultAssetMetadata = TokenCommonMetadata & {
  policyId: string
  assetName: string
  ticker: string
}

export type DefaultAsset = Token & {
  metadata: DefaultAssetMetadata
}

export type LegacyToken = {
  isDefault: boolean
  identifier: string
  metadata: TokenMetadata
}
