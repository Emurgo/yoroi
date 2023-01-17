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
  /**
   * For Ergo, this is the tokenId (box id of first input in tx)
   * for Cardano, this is policyId || assetName
   * Note: we don't use null for the primary token of the chain
   * As some blockchains have multiple primary tokens
   */
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
  name: string
  decimals?: number
  assetName: string
  policyId: string
  longName?: string
  ticker?: string
}

// https://github.com/cardano-foundation/cardano-token-registry#semantic-content-of-registry-entries
export type TokenRegistryEntry = {
  subject: string
  name: string
  description: string
  policy?: string
  ticker?: string
  url?: string
  logo?: string
  decimals?: number
}

export type NFTMetadata = {
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
  [policyID: string]: {
    [assetNameHex: string]: NFTMetadata
  }
}

export type NFTAsset = {
  key: '721'
  metadata: AssetMetadata
}
