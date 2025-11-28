import {Portfolio} from '@yoroi/types'

export type TokenType = 'ft' | 'nft'

export type MintFormData = {
  tokenType: TokenType
  // FT fields
  tokenName?: string
  quantity?: string
  decimals?: string
  imageBase64?: string
  // NFT fields
  assetName?: string
  imageUrl?: string
  name?: string
  // Common fields
  description?: string
}

export type MintedTokenInfo = {
  tokenId: Portfolio.Token.Id
  policyId: string
  assetName: string
  assetNameHex: string
  quantity: string
  tokenType: TokenType
  mintDate?: number
  mintTxId?: string
  isMintedByMe: boolean
}

export type BurnTokenInfo = {
  tokenId: Portfolio.Token.Id
  policyId: string
  assetName: string
  assetNameHex: string
  quantity: string
  availableQuantity: string
  tokenType: TokenType
  hasPolicyScript: boolean
  policyScriptStatus: 'stored' | 'basic' | 'recovery_needed'
}

export type PolicyRecoveryData = {
  policyId: string
  scriptHex: string
  scriptType: 'native' | 'plutus'
  params: {
    type: string
    keyHash?: string
    slot?: string
    scripts?: PolicyRecoveryData['params'][]
    required?: number
  }
  timestamp: number
}

export type PolicyScriptStatus =
  | 'stored'
  | 'basic'
  | 'recovery_needed'
  | 'not_found'
