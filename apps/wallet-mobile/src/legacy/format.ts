/* eslint-disable @typescript-eslint/no-explicit-any */
import AssetFingerprint from '@emurgo/cip14-js'
import {Balance} from '@yoroi/types'
import {BigNumber} from 'bignumber.js'
import type {IntlShape} from 'react-intl'
import {defineMessages} from 'react-intl'

import {isTokenInfo} from '../yoroi-wallets/cardano/utils'
import {DefaultAsset, Token} from '../yoroi-wallets/types'
import utfSymbols from './utfSymbols'

export const getTokenFingerprint = ({policyId, assetNameHex}) => {
  const assetFingerprint = AssetFingerprint.fromParts(Buffer.from(policyId, 'hex'), Buffer.from(assetNameHex, 'hex'))
  return assetFingerprint.fingerprint()
}

export const getAssetFingerprint = (policyId: string, assetNameHex: string) => {
  return getTokenFingerprint({policyId, assetNameHex})
}

export const decodeHexAscii = (text: string) => {
  const bytes = [...Buffer.from(text, 'hex')]
  const isAscii = bytes.every((byte) => byte > 32 && byte < 127)
  return isAscii ? String.fromCharCode(...bytes) : undefined
}

const getTicker = (token: Balance.TokenInfo | DefaultAsset) => {
  if (isTokenInfo(token)) {
    return token.kind === 'ft' ? token.ticker : undefined
  }
  return token.metadata.ticker
}
const getSymbol = (token: Balance.TokenInfo | DefaultAsset) => {
  const ticker = getTicker(token)
  return (ticker && utfSymbols.CURRENCIES[ticker]) ?? ticker
}

const getName = (token: Balance.TokenInfo | DefaultAsset) => {
  if (isTokenInfo(token)) {
    return token.name || token.ticker || token.fingerprint || ''
  }
  return (
    token.metadata.longName ||
    decodeHexAscii(token.metadata.assetName) ||
    getTokenFingerprint({
      policyId: token.metadata.policyId,
      assetNameHex: token.metadata.assetName,
    }) ||
    ''
  )
}

export const getDecimals = (token: Balance.TokenInfo | DefaultAsset) => {
  if (isTokenInfo(token)) {
    return token.kind === 'nft' ? 0 : token.decimals
  }
  return token.metadata.numberOfDecimals
}

export const normalizeTokenAmount = (amount: Balance.Quantity, token: Balance.TokenInfo | DefaultAsset): BigNumber => {
  const decimals = getDecimals(token) ?? 0
  const normalizationFactor = Math.pow(10, decimals)
  return new BigNumber(amount).dividedBy(normalizationFactor).decimalPlaces(decimals)
}

export const formatTokenAmount = (amount: Balance.Quantity, token: Balance.TokenInfo | DefaultAsset): string => {
  const decimals = getDecimals(token)
  const normalized = normalizeTokenAmount(amount, token)
  return normalized.toFormat(decimals)
}

const getTokenV2Fingerprint = (token: Balance.TokenInfo | DefaultAsset): string => {
  if (isTokenInfo(token)) {
    return token.fingerprint
  }
  return getTokenFingerprint({
    policyId: token.metadata.policyId,
    assetNameHex: token.metadata.assetName,
  })
}

export const formatTokenWithSymbol = (amount: Balance.Quantity, token: Balance.TokenInfo | DefaultAsset): string => {
  const denomination = getSymbol(token) ?? getTokenV2Fingerprint(token)
  return `${formatTokenAmount(amount, token)}${utfSymbols.NBSP}${denomination}`
}
// We assume that tickers are non-localized. If ticker doesn't exist, default
// to identifier

export const formatTokenWithText = (amount: Balance.Quantity, token: Balance.TokenInfo | DefaultAsset) => {
  if (isTokenInfo(token)) {
    switch (token.kind) {
      case 'nft':
        return `${formatTokenAmount(amount, token)}${utfSymbols.NBSP}${token.name || token.fingerprint}`
      case 'ft':
        return `${formatTokenAmount(amount, token)}${utfSymbols.NBSP}${token.ticker || token.name || token.fingerprint}`
    }
  }

  const tickerOrId = getTicker(token) || getName(token) || getTokenV2Fingerprint(token)
  return `${formatTokenAmount(amount, token)}${utfSymbols.NBSP}${tickerOrId}`
}

export const formatTokenWithTextWhenHidden = (text: string, token: Balance.TokenInfo | DefaultAsset) => {
  const tickerOrId = getTicker(token) || getName(token) || getTokenV2Fingerprint(token)
  return `${text}${utfSymbols.NBSP}${tickerOrId}`
}

export const formatTokenInteger = (amount: Balance.Quantity, token: Token | DefaultAsset) => {
  const normalizationFactor = Math.pow(10, token.metadata.numberOfDecimals)
  const bigNumber = new BigNumber(amount)
  const num = bigNumber.dividedToIntegerBy(normalizationFactor)

  if (bigNumber.lt(0) && bigNumber.gt(-normalizationFactor)) {
    // -0 needs special handling
    return '-0'
  } else {
    return num.toFormat(0)
  }
}

export const formatTokenFractional = (amount: Balance.Quantity, token: Token | DefaultAsset) => {
  const normalizationFactor = Math.pow(10, token.metadata.numberOfDecimals)
  const fractional = new BigNumber(amount).abs().modulo(normalizationFactor).dividedBy(normalizationFactor)
  // remove leading '0'
  return fractional.toFormat(token.metadata.numberOfDecimals).substring(1)
}

export const truncateWithEllipsis = (s: string, n: number) => {
  if (s.length > n) {
    return `${s.substr(0, Math.floor(n / 2))}...${s.substr(s.length - Math.floor(n / 2))}`
  }

  return s
}

// TODO(multi-asset): consider removing these

const formatAda = (amount: Balance.Quantity, defaultAsset: DefaultAsset) => {
  const defaultAssetMeta = defaultAsset.metadata
  const normalizationFactor = Math.pow(10, defaultAssetMeta.numberOfDecimals)
  const num = new BigNumber(amount).dividedBy(normalizationFactor)
  return num.toFormat(6)
}

export const formatAdaWithText = (amount: Balance.Quantity, defaultAsset: DefaultAsset) => {
  const defaultAssetMeta = defaultAsset.metadata
  return `${formatAda(amount, defaultAsset)}${utfSymbols.NBSP}${defaultAssetMeta.ticker}`
}

export const formatTime = (timestamp: string, intl: IntlShape) => {
  if (timestamp.length === 0) {
    return ''
  }
  return intl.formatTime(new Date(timestamp), {
    timeStyle: 'medium',
  })
}

export const formatDateAndTime = (timestamp: string, intl: IntlShape) => {
  if (timestamp.length === 0) {
    return ''
  }
  return intl.formatDate(new Date(timestamp), {
    dateStyle: 'long',
    timeStyle: 'medium',
  })
}

export const formatDateRelative = (timestamp: string, intl: IntlShape) => {
  if (timestamp.length === 0) {
    return ''
  }
  const inputDateString = getDateString(new Date(timestamp))
  const today = getToday()
  const yesterday = getYesterday()

  if (inputDateString === today) {
    return intl.formatMessage(messages.today)
  }

  if (inputDateString === yesterday) {
    return intl.formatMessage(messages.yesterday)
  }

  return intl.formatDate(new Date(timestamp), {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  })
}

function getDateString(date: Date) {
  return date.toISOString().split('T')[0]
}

function getYesterday() {
  const date = new Date()
  date.setDate(date.getDate() - 1)
  return getDateString(date)
}

function getToday() {
  return getDateString(new Date())
}

const messages = defineMessages({
  today: {
    id: 'utils.format.today',
    defaultMessage: '!!!Today',
  },
  yesterday: {
    id: 'utils.format.yesterday',
    defaultMessage: '!!!Yesterday',
  },
  unknownAssetName: {
    id: 'utils.format.unknownAssetName',
    defaultMessage: '!!![Unknown asset name]',
  },
})
