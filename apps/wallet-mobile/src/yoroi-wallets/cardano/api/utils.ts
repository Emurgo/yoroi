import AssetFingerprint from '@emurgo/cip14-js'
import {Portfolio} from '@yoroi/types'
import {Buffer} from 'memfs/lib/internal/buffer'

import {LegacyToken} from '../../types'

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

export const toTokenInfo = (token: LegacyToken): Portfolio.TokenInfo => {
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
        name: token.metadata.longName ?? '',
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
