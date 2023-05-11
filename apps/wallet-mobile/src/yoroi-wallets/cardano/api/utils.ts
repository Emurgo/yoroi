import AssetFingerprint from '@emurgo/cip14-js'
import {Buffer} from 'memfs/lib/internal/buffer'

import {LegacyToken, TokenInfo} from '../../types'
import {YoroiWallet} from '../types'
import {TokenRegistryEntry} from './api'

export const tokenInfo = (entry: TokenRegistryEntry): TokenInfo => {
  const policyId = toPolicyId(entry.subject)
  const assetName = toAssetName(entry.subject)

  return {
    id: toTokenId(entry.subject),
    group: policyId,
    decimals: entry.decimals?.value ?? 0,
    fingerprint: toTokenFingerprint({
      policyId,
      assetNameHex: assetName ? utf8ToHex(assetName) : undefined,
    }),

    // optional values
    name: assetName,
    description: entry.description?.value,
    symbol: undefined,
    ticker: entry.ticker?.value,
    url: entry.url?.value,
    logo: entry.logo?.value,
  }
}

export const fallbackTokenInfo = (tokenId: string): TokenInfo => {
  const policyId = toPolicyId(tokenId)
  const assetName = toAssetName(tokenId)

  return {
    id: toTokenId(tokenId),
    name: assetName,
    group: policyId,
    decimals: 0,
    fingerprint: toTokenFingerprint({
      policyId,
      assetNameHex: assetName ? utf8ToHex(assetName) : undefined,
    }),
    description: undefined,
    logo: undefined,
    symbol: undefined,
    ticker: undefined,
    url: undefined,
  }
}

export const toPolicyId = (tokenIdentifier: string) => {
  const tokenSubject = toTokenSubject(tokenIdentifier)
  return tokenSubject.slice(0, 56)
}
export const toAssetName = (tokenIdentifier: string): string | undefined => {
  return hexToUtf8(toAssetNameHex(tokenIdentifier)) || undefined
}

export const toAssetNameHex = (tokenIdentifier: string): string => {
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

export const toToken = ({wallet, tokenInfo}: {wallet: YoroiWallet; tokenInfo: TokenInfo}): LegacyToken => {
  if (tokenInfo.id === wallet.primaryTokenInfo.id) return wallet.primaryToken
  const assetNameHex = tokenInfo.name ? utf8ToHex(tokenInfo.name) : ''

  return {
    identifier: `${tokenInfo.group}.${assetNameHex}`,
    networkId: wallet.networkId,
    isDefault: tokenInfo.id === wallet.primaryTokenInfo.id,
    metadata: {
      type: 'Cardano',
      policyId: tokenInfo.group,
      assetName: assetNameHex,
      numberOfDecimals: tokenInfo.decimals,
      ticker: tokenInfo.ticker ?? null,
      longName: tokenInfo.description ?? null,
      maxSupply: null,
    },
  }
}

export const toTokenInfo = (token: LegacyToken): TokenInfo => {
  const policyId = toPolicyId(token.identifier)
  const assetName = toAssetName(token.identifier)

  return {
    id: toTokenId(token.identifier),
    group: policyId,
    name: assetName,
    decimals: token.metadata.numberOfDecimals,
    fingerprint: toTokenFingerprint({policyId: token.metadata.policyId, assetNameHex: token.metadata.assetName}),
    description: token.metadata.longName ?? undefined,
    symbol: undefined,
    url: undefined,
    logo: undefined,
    ticker: token.metadata?.ticker ?? undefined,
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
