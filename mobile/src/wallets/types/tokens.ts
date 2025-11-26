type TokenCommonMetadata = {
  numberOfDecimals: number
  ticker: null | string
  longName: null | string
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

export type LegacyToken = {
  isDefault: boolean
  identifier: string
  metadata: TokenMetadata
}

// Minimal token metadata for transaction processing
export type TransactionToken = {
  isDefault: boolean
  identifier: string
  // Minimal metadata for transaction display
  policyId: string
  assetName: string
  numberOfDecimals: number
  ticker: string | null
  longName: string | null
}
