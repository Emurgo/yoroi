/* eslint-disable @typescript-eslint/no-explicit-any */
import AssetFingerprint from '@emurgo/cip14-js'
import {BigNumber} from 'bignumber.js'
import moment from 'moment'
import type {IntlShape} from 'react-intl'
import {defineMessages} from 'react-intl'

import {DefaultAsset, Token} from '../yoroi-wallets/types'
import {getCardanoDefaultAsset} from './config'
import utfSymbols from './utfSymbols'

const getTokenFingerprint = ({policyId, assetNameHex}) => {
  const assetFingerprint = new AssetFingerprint(Buffer.from(policyId, 'hex'), Buffer.from(assetNameHex, 'hex'))
  return assetFingerprint.fingerprint()
}

const decodeHexAscii = (text: string) => {
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

export const normalizeTokenAmount = (amount: BigNumber, token: Token | DefaultAsset): BigNumber => {
  const normalizationFactor = Math.pow(10, token.metadata.numberOfDecimals)
  return amount.dividedBy(normalizationFactor).decimalPlaces(token.metadata.numberOfDecimals)
}

export const formatTokenAmount = (amount: BigNumber, token: Token | DefaultAsset): string => {
  const normalized = normalizeTokenAmount(amount, token)
  const amountStr = normalized.toFormat(token.metadata.numberOfDecimals)

  return amountStr
}

export const formatTokenWithSymbol = (amount: BigNumber, token: Token | DefaultAsset): string => {
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

export const formatTokenWithText = (amount: BigNumber, token: Token | DefaultAsset) => {
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

export const formatTokenInteger = (amount: BigNumber, token: Token | DefaultAsset) => {
  const normalizationFactor = Math.pow(10, token.metadata.numberOfDecimals)
  const num = amount.dividedToIntegerBy(normalizationFactor)

  if (amount.lt(0) && amount.gt(-normalizationFactor)) {
    // -0 needs special handling
    return '-0'
  } else {
    return num.toFormat(0)
  }
}

export const formatTokenFractional = (amount: BigNumber, token: Token | DefaultAsset) => {
  const normalizationFactor = Math.pow(10, token.metadata.numberOfDecimals)
  const fractional = amount.abs().modulo(normalizationFactor).dividedBy(normalizationFactor)
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
const defaultAssetMeta = getCardanoDefaultAsset().metadata
const normalizationFactor = Math.pow(10, defaultAssetMeta.numberOfDecimals)

const formatAda = (amount: BigNumber) => {
  const num = amount.dividedBy(normalizationFactor)
  return num.toFormat(6)
}

export const formatAdaWithText = (amount: BigNumber) =>
  `${formatAda(amount)}${utfSymbols.NBSP}${defaultAssetMeta.ticker}`

export const formatTimeToSeconds = (ts: string | any) => {
  return moment(ts).format((moment(0) as any)._locale._format.timeToSeconds)
}

export const formatDateToSeconds = (ts: string | any) => {
  return moment(ts).format((moment(0) as any)._locale._format.dateToSeconds)
}

export const formatDateRelative = (ts: string | any, intl: IntlShape) => {
  const config = {
    sameDay: `[${intl.formatMessage(messages.today)}]`,
    lastDay: `[${intl.formatMessage(messages.yesterday)}]`,
    nextDay: 'L',
    // we don't really have dates in future
    lastWeek: 'L',
    nextWeek: 'L',
    sameElse: 'L',
  }
  return moment(ts).calendar(null, config)
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
