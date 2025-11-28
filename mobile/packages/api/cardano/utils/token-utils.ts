import {AssetNameUtils} from '@yoroi/tx'
import {Api, Balance} from '@yoroi/types'

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
    name: assetName,
    group: policyId,
    decimals: entry.decimals?.value ?? 0,
    ticker: entry.ticker?.value,
    icon: entry.logo?.value,
    image: entry.logo?.value,
    description: entry.description?.value,
    id: toTokenId(entry.subject),
    fingerprint: toTokenFingerprint({
      policyId,
      assetNameHex: nameHex,
    }),
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
export const fallbackTokenInfo = (tokenId: string): Balance.TokenInfo => {
  const policyId = toPolicyId(tokenId)
  const nameHex = toAssetNameHex(tokenId)
  const assetName = toDisplayAssetName(tokenId)

  return {
    kind: 'ft',
    id: toTokenId(tokenId),
    name: assetName,
    fingerprint: toTokenFingerprint({policyId, assetNameHex: nameHex}),
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
export const toPolicyId = (tokenIdentifier: string): string => {
  const tokenSubject = toTokenSubject(tokenIdentifier)
  return tokenSubject.slice(0, 56)
}

/**
 * Extracts and formats the display name from a token identifier
 * Handles tagged asset names using AssetNameUtils
 */
export const toDisplayAssetName = (tokenIdentifier: string): string => {
  const hexName = toAssetNameHex(tokenIdentifier)
  const properties = AssetNameUtils.resolveProperties(hexName)
  const untaggedName = properties.asciiName ?? hexName
  return untaggedName
}

/**
 * Extracts the asset name hex from a token identifier
 */
export const toAssetNameHex = (tokenIdentifier: string): string => {
  const tokenSubject = toTokenSubject(tokenIdentifier)
  const maxAssetNameLengthInBytes = 32
  return tokenSubject.slice(56, 56 + maxAssetNameLengthInBytes * 2)
}

/**
 * Converts a token identifier to subject format (removes dot separator)
 * Handles both policyId.assetName and policyIdassetName formats
 */
export const toTokenSubject = (tokenIdentifier: string): string =>
  tokenIdentifier.replace('.', '')

/**
 * Converts a token identifier to standard tokenId format (policyId.assetName)
 */
export const toTokenId = (tokenIdentifier: string): Balance.TokenInfo['id'] => {
  const tokenSubject = toTokenSubject(tokenIdentifier)
  return `${tokenSubject.slice(0, 56)}.${toAssetNameHex(tokenIdentifier)}` as Balance.TokenInfo['id']
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
  policyId: string
  assetNameHex: string | undefined
}): string => {
  const assetFingerprint = AssetFingerprint.fromParts(
    Buffer.from(policyId, 'hex'),
    Buffer.from(assetNameHex, 'hex'),
  )
  return assetFingerprint.fingerprint()
}
