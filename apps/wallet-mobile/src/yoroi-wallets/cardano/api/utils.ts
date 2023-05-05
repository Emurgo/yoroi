import AssetFingerprint from '@emurgo/cip14-js'

import {LegacyToken, TokenInfo} from '../../types'
import {TokenRegistryEntry} from './api'

export const tokenInfo = (entry: TokenRegistryEntry): TokenInfo<'ft'> => {
  const policyId = toPolicyId(entry.subject)
  const assetName = toAssetName(entry.subject)

  return {
    kind: 'ft',
    name: assetName,
    description: entry.description?.value,
    id: toTokenId(entry.subject),
    fingerprint: toTokenFingerprint({
      policyId,
      assetNameHex: assetName ? asciiToHex(assetName) : undefined,
    }),
    metadata: {
      group: policyId,
      decimals: entry.decimals?.value ?? 0,
      symbol: undefined,
      ticker: entry.ticker?.value,
      url: entry.url?.value,
      logo: entry.logo?.value,
    },
  }
}

export const fallbackTokenInfo = (tokenId: string): TokenInfo<'ft'> => {
  const policyId = toPolicyId(tokenId)
  const assetName = toAssetName(tokenId)

  return {
    kind: 'ft',
    id: toTokenId(tokenId),
    name: assetName,
    fingerprint: toTokenFingerprint({
      policyId,
      assetNameHex: assetName ? asciiToHex(assetName) : undefined,
    }),
    description: undefined,
    metadata: {
      group: policyId,
      decimals: 0,
      logo: undefined,
      symbol: undefined,
      ticker: undefined,
      url: undefined,
    },
  }
}

export const toPolicyId = (tokenIdentifier: string) => {
  const tokenSubject = toTokenSubject(tokenIdentifier)
  return tokenSubject.slice(0, 56)
}
export const toAssetName = (tokenIdentifier: string) => {
  return hexToAscii(toAssetNameHex(tokenIdentifier)) || undefined
}

export const toAssetNameHex = (tokenIdentifier: string) => {
  const tokenSubject = toTokenSubject(tokenIdentifier)
  const maxAssetNameLengthInBytes = 32
  return tokenSubject.slice(56, 56 + maxAssetNameLengthInBytes * 2)
}

export const toTokenSubject = (tokenIdentifier: string) => tokenIdentifier.replace('.', '')
export const toTokenId = (tokenIdentifier: string) => {
  const tokenSubject = toTokenSubject(tokenIdentifier)
  return `${tokenSubject.slice(0, 56)}.${toAssetNameHex(tokenIdentifier)}`
}

export const hexToAscii = (hex: string) => Buffer.from(hex, 'hex').toLocaleString()
export const asciiToHex = (ascii: string) => {
  const result: Array<string> = []
  for (let n = 0, l = ascii.length; n < l; n++) {
    const hex = Number(ascii.charCodeAt(n)).toString(16)
    result.push(hex)
  }

  return result.join('')
}

export const toTokenInfo = (token: LegacyToken): TokenInfo<'ft'> => {
  const policyId = toPolicyId(token.identifier)
  const assetName = toAssetName(token.identifier)

  return {
    kind: 'ft',
    id: toTokenId(token.identifier),
    name: assetName,
    fingerprint: toTokenFingerprint({policyId: token.metadata.policyId, assetNameHex: token.metadata.assetName}),
    description: token.metadata.longName ?? undefined,
    metadata: {
      group: policyId,
      decimals: token.metadata.numberOfDecimals,
      symbol: undefined,
      url: undefined,
      logo: undefined,
      ticker: token.metadata?.ticker ?? undefined,
    },
  }
}

export const toTokenFingerprint = ({
  policyId,
  assetNameHex = '',
}: {
  policyId: string
  assetNameHex: string | undefined
}) => {
  const assetFingerprint = AssetFingerprint.fromParts(Buffer.from(policyId, 'hex'), Buffer.from(assetNameHex, 'hex'))
  return assetFingerprint.fingerprint()
}
