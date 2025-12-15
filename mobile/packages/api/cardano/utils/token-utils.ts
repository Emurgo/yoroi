import {AssetNameUtils} from '@yoroi/tx'
import {
  Api,
  AssetName,
  Balance,
  Branded,
  PolicyId,
  TokenFingerprint,
  TokenId,
} from '@yoroi/types'

import AssetFingerprint from '@emurgo/cip14-js'

/**
 * Converts a TokenRegistryEntry from the Cardano Token Registry to Balance.TokenInfo
 */
export const tokenInfo = (
  entry: Api.Cardano.TokenRegistryEntry,
): Balance.TokenInfo => {
  const policyId = toPolicyId(entry.subject)
  const assetName = toDisplayAssetName(entry.subject)
  const nameHex = toAssetNameHex(entry.subject)

  return {
    kind: 'ft',
    name: Branded.asAssetName(assetName),
    group: policyId,
    decimals: entry.decimals?.value ?? 0,
    ticker: entry.ticker?.value,
    icon: entry.logo?.value,
    image: entry.logo?.value,
    description: entry.description?.value,
    id: toTokenId(entry.subject),
    fingerprint: Branded.asTokenFingerprint(
      toTokenFingerprint({
        policyId,
        assetNameHex: nameHex,
      }),
    ),
    symbol: undefined,
    metadatas: {
      mintFt: {
        icon: entry.logo?.value,
        description: entry.description?.value,
        version: '1',
        decimals: entry.decimals?.value ?? 0,
        ticker: entry.ticker?.value,
        url: entry.url?.value,
      },
    },
  }
}

/**
 * Creates a fallback Balance.TokenInfo from a tokenId string
 */
export const fallbackTokenInfo = (
  tokenId: TokenId | string,
): Balance.TokenInfo => {
  const tokenIdStr = typeof tokenId === 'string' ? tokenId : tokenId
  const policyId = toPolicyId(tokenIdStr)
  const nameHex = toAssetNameHex(tokenIdStr)
  const assetName = toDisplayAssetName(tokenIdStr)

  return {
    kind: 'ft',
    id: toTokenId(tokenIdStr),
    name: Branded.asAssetName(assetName),
    fingerprint: Branded.asTokenFingerprint(
      toTokenFingerprint({policyId, assetNameHex: nameHex}),
    ),
    description: undefined,
    group: policyId,
    decimals: 0,
    image: undefined,
    icon: undefined,
    ticker: undefined,
    symbol: undefined,
    metadatas: {},
  }
}

/**
 * Extracts the policy ID from a token identifier (handles both policyId.assetName and policyIdassetName formats)
 */
export const toPolicyId = (tokenIdentifier: TokenId | string): PolicyId => {
  const tokenIdStr =
    typeof tokenIdentifier === 'string' ? tokenIdentifier : tokenIdentifier
  const tokenSubject = toTokenSubject(tokenIdStr)
  return tokenSubject.slice(0, 56) as PolicyId
}

/**
 * Extracts and formats the display name from a token identifier
 * Handles tagged asset names using AssetNameUtils
 */
export const toDisplayAssetName = (
  tokenIdentifier: TokenId | string,
): string => {
  const tokenIdStr =
    typeof tokenIdentifier === 'string' ? tokenIdentifier : tokenIdentifier
  const hexName = toAssetNameHex(tokenIdStr)
  const properties = AssetNameUtils.resolveProperties(hexName)
  const untaggedName = properties.asciiName ?? hexName
  return untaggedName
}

/**
 * Extracts the asset name hex from a token identifier
 */
export const toAssetNameHex = (
  tokenIdentifier: TokenId | string,
): AssetName => {
  const tokenIdStr =
    typeof tokenIdentifier === 'string' ? tokenIdentifier : tokenIdentifier
  const tokenSubject = toTokenSubject(tokenIdStr)
  const maxAssetNameLengthInBytes = 32
  return tokenSubject.slice(56, 56 + maxAssetNameLengthInBytes * 2) as AssetName
}

/**
 * Converts a token identifier to subject format (removes dot separator)
 * Handles both policyId.assetName and policyIdassetName formats
 */
export const toTokenSubject = (tokenIdentifier: TokenId | string): string => {
  const tokenIdStr =
    typeof tokenIdentifier === 'string' ? tokenIdentifier : tokenIdentifier
  return tokenIdStr.replace('.', '')
}

/**
 * Converts a token identifier to standard tokenId format (policyId.assetName)
 */
export const toTokenId = (
  tokenIdentifier: TokenId | string,
): Balance.TokenInfo['id'] => {
  const tokenIdStr =
    typeof tokenIdentifier === 'string' ? tokenIdentifier : tokenIdentifier
  const tokenSubject = toTokenSubject(tokenIdStr)
  return `${tokenSubject.slice(0, 56)}.${toAssetNameHex(tokenIdStr)}` as Balance.TokenInfo['id']
}

/**
 * Converts UTF-8 text to hex string
 */
export const utf8ToHex = (text: string): string =>
  Buffer.from(text, 'utf-8').toString('hex')

/**
 * Creates a CIP14 asset fingerprint from policyId and assetNameHex
 */
export const toTokenFingerprint = ({
  policyId,
  assetNameHex = '',
}: {
  policyId: PolicyId | string
  assetNameHex: AssetName | string | undefined
}): TokenFingerprint => {
  const policyIdStr = typeof policyId === 'string' ? policyId : policyId
  const assetNameStr =
    typeof assetNameHex === 'string' ? assetNameHex : assetNameHex || ''
  const assetFingerprint = AssetFingerprint.fromParts(
    Buffer.from(policyIdStr, 'hex'),
    Buffer.from(assetNameStr, 'hex'),
  )
  return Branded.asTokenFingerprint(assetFingerprint.fingerprint())
}
