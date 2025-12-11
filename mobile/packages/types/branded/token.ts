import {String} from './utils'

/**
 * Token identification types
 */
export type TokenId = String<'TokenId'> // Full token ID (policyId.assetName format: `${string}.${string}`)
export type PolicyId = String<'PolicyId'> // 28-byte hex (56 chars)
export type AssetName = String<'AssetName'> // Hex-encoded asset name
export type AssetNameUtf8 = String<'AssetNameUtf8'> // UTF-8 asset name
export type TokenFingerprint = String<'TokenFingerprint'>

/**
 * PortfolioTokenId is an alias for TokenId - they represent the same concept
 */
export type PortfolioTokenId = TokenId
