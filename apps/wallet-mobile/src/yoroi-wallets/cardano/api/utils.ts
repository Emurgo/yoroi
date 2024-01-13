import AssetFingerprint from '@emurgo/cip14-js'
import {AssetNameUtils} from '@emurgo/yoroi-lib/dist/internals/utils/assets'
import {Balance} from '@yoroi/types'
import {Buffer} from 'memfs/lib/internal/buffer'

import {LegacyToken, YoroiTokenId} from '../../types'
import {TokenRegistryEntry} from './tokenRegistry'

export const tokenInfo = (entry: TokenRegistryEntry): Balance.TokenInfo => {
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

export const toPolicyId = (tokenIdentifier: string) => {
  const tokenSubject = toTokenSubject(tokenIdentifier)
  return tokenSubject.slice(0, 56)
}
export const toDisplayAssetName = (tokenIdentifier: string) => {
  const hexName = toAssetNameHex(tokenIdentifier)
  const properties = AssetNameUtils.resolveProperties(hexName)
  const untaggedName = properties.asciiName ?? properties.hexName
  return untaggedName
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

export const asTokenId = (tokenIdentifier: string): YoroiTokenId => {
  const tokenSubject = toTokenSubject(tokenIdentifier)
  return `${tokenSubject.slice(0, 56)}.${toAssetNameHex(tokenIdentifier)}`
}

export const hexToUtf8 = (hex: string) => Buffer.from(hex, 'hex').toString('utf-8')
export const utf8ToHex = (text: string) => Buffer.from(text, 'utf-8').toString('hex')

export const toTokenInfo = (token: LegacyToken): Balance.TokenInfo => {
  const policyId = toPolicyId(token.identifier)
  const assetName = toDisplayAssetName(token.identifier)

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
