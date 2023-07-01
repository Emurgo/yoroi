import AssetFingerprint from '@emurgo/cip14-js'
import {Buffer} from 'memfs/lib/internal/buffer'

import {LegacyToken, TokenInfo} from '../../types'
import {TokenRegistryEntry} from './tokenRegistry'

export const tokenInfo = (entry: TokenRegistryEntry): TokenInfo => {
  const policyId = toPolicyId(entry.subject)
  const assetName = toAssetName(entry.subject)

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
      assetNameHex: assetName ? utf8ToHex(assetName) : undefined,
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

export const fallbackTokenInfo = (tokenId: string): TokenInfo => {
  const policyId = toPolicyId(tokenId)
  const assetName = toAssetName(tokenId)

  return {
    kind: 'ft',
    id: toTokenId(tokenId),
    name: assetName,
    fingerprint: toTokenFingerprint({policyId, assetNameHex: assetName ? utf8ToHex(assetName) : undefined}),
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

export const toPolicyId = (tokenIdentifier: string) => {
  const tokenSubject = toTokenSubject(tokenIdentifier)
  return tokenSubject.slice(0, 56)
}
export const toAssetName = (tokenIdentifier: string) => {
  return hexToUtf8(toAssetNameHex(tokenIdentifier))
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

export const hexToUtf8 = (hex: string) => Buffer.from(hex, 'hex').toString('utf-8')
export const utf8ToHex = (text: string) => Buffer.from(text, 'utf-8').toString('hex')

export const toTokenInfo = (token: LegacyToken): TokenInfo => {
  const policyId = toPolicyId(token.identifier)
  const assetName = toAssetName(token.identifier)

  return {
    kind: 'ft',
    id: toTokenId(token.identifier),
    name: assetName,
    fingerprint: toTokenFingerprint({policyId: token.metadata.policyId, assetNameHex: token.metadata.assetName}),
    description: token.metadata.longName ?? undefined,
    ticker: token.metadata.ticker ?? assetName,
    icon: undefined,
    image: undefined,
    group: policyId,
    decimals: token.metadata.numberOfDecimals,
    symbol: undefined,
    metadatas: {
      mintFt: {
        icon: undefined,
        description: token.metadata.longName ?? undefined,
        ticker: token.metadata.ticker ?? undefined,
        url: undefined,
        version: '1',
        decimals: token.metadata.numberOfDecimals,
      },
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
