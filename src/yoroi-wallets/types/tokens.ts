import BigNumber from 'bignumber.js'

export type TokenLookupKey = {
  identifier: string
  networkId: number
}

export type TokenEntry = TokenLookupKey & {
  amount: BigNumber
}

export type TokenEntryPlain = TokenLookupKey & {
  amount: string
  isDefault: boolean
}

export type DefaultTokenEntry = {
  defaultNetworkId: number
  defaultIdentifier: string
}

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
  networkId: number
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

export type TokenInfo = {
  id: string
  group: string // policyId
  decimals: number // default to 0
  fingerprint: string

  name: string | undefined // derived from token subject
  description: string | undefined
  ticker: string | undefined
  url: string | undefined
  logo: string | undefined
}

export type LegacyToken = {
  networkId: number
  isDefault: boolean
  identifier: string
  metadata: TokenMetadata
}
