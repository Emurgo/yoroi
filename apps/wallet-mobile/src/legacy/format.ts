/* eslint-disable @typescript-eslint/no-explicit-any */
import AssetFingerprint from '@emurgo/cip14-js'
import {BigNumber} from 'bignumber.js'
import type {IntlShape} from 'react-intl'
import {defineMessages} from 'react-intl'

import {DefaultAsset, Quantity, Token} from '../yoroi-wallets/types'
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

const getTicker = (token: Token | DefaultAsset) => token.metadata.ticker

const getSymbol = (token: Token | DefaultAsset) =>
  token.metadata.ticker
    ? utfSymbols.CURRENCIES[token.metadata.ticker]
      ? utfSymbols.CURRENCIES[token.metadata.ticker]
      : token.metadata.ticker
    : null

const getName = (token: Token | DefaultAsset) =>
  token.metadata.longName ||
  decodeHexAscii(token.metadata.assetName) ||
  getTokenFingerprint({
    policyId: token.metadata.policyId,
    assetNameHex: token.metadata.assetName,
  }) ||
  undefined

export const normalizeTokenAmount = (amount: Quantity, token: Token | DefaultAsset): BigNumber => {
  const normalizationFactor = Math.pow(10, token.metadata.numberOfDecimals)
  return new BigNumber(amount).dividedBy(normalizationFactor).decimalPlaces(token.metadata.numberOfDecimals)
}

export const formatTokenAmount = (amount: Quantity, token: Token | DefaultAsset): string => {
  const normalized = normalizeTokenAmount(amount, token)
  const amountStr = normalized.toFormat(token.metadata.numberOfDecimals)

  return amountStr
}

export const formatTokenWithSymbol = (amount: Quantity, token: Token | DefaultAsset): string => {
  const denomination =
    getSymbol(token) ??
    getTokenFingerprint({
      policyId: token.metadata.policyId,
      assetNameHex: token.metadata.assetName,
    })
  return `${formatTokenAmount(amount, token)}${utfSymbols.NBSP}${denomination}`
}
// We assume that tickers are non-localized. If ticker doesn't exist, default
// to identifier

export const formatTokenWithText = (amount: Quantity, token: Token | DefaultAsset) => {
  const tickerOrId =
    getTicker(token) ||
    getName(token) ||
    getTokenFingerprint({
      policyId: token.metadata.policyId,
      assetNameHex: token.metadata.assetName,
    })
  return `${formatTokenAmount(amount, token)}${utfSymbols.NBSP}${tickerOrId}`
}

export const formatTokenWithTextWhenHidden = (text: string, token: Token | DefaultAsset) => {
  const tickerOrId =
    getTicker(token) ||
    getName(token) ||
    getTokenFingerprint({
      policyId: token.metadata.policyId,
      assetNameHex: token.metadata.assetName,
    })
  return `${text}${utfSymbols.NBSP}${tickerOrId}`
}

export const formatTokenInteger = (amount: Quantity, token: Token | DefaultAsset) => {
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

export const formatTokenFractional = (amount: Quantity, token: Token | DefaultAsset) => {
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

const formatAda = (amount: Quantity, defaultAsset: DefaultAsset) => {
  const defaultAssetMeta = defaultAsset.metadata
  const normalizationFactor = Math.pow(10, defaultAssetMeta.numberOfDecimals)
  const num = new BigNumber(amount).dividedBy(normalizationFactor)
  return num.toFormat(6)
}

export const formatAdaWithText = (amount: Quantity, defaultAsset: DefaultAsset) => {
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

export const formatDateRelative = (ts: string | any, intl: IntlShape) => {
  const inputDateString = new Date(ts).toDateString()
  const today = new Date().toDateString()
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()

  if (inputDateString === today) {
    return intl.formatMessage(messages.today)
  }

  if (inputDateString === yesterday) {
    return intl.formatMessage(messages.yesterday)
  }

  return intl.formatDate(new Date(ts), {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  })
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
