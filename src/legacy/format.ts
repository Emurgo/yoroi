/* eslint-disable @typescript-eslint/no-explicit-any */
import AssetFingerprint from '@emurgo/cip14-js'
import {BigNumber} from 'bignumber.js'
import moment from 'moment'
import type {IntlShape} from 'react-intl'
import {defineMessages} from 'react-intl'

import {getCardanoDefaultAsset} from './config'
import type {DefaultAsset, Token} from './HistoryTransaction'
import utfSymbols from './utfSymbols'
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
export const getTokenFingerprint = (token: Token | DefaultAsset) => {
  const {policyId, assetName} = token.metadata
  const assetFingerprint = new AssetFingerprint(Buffer.from(policyId, 'hex'), Buffer.from(assetName, 'hex'))
  return assetFingerprint.fingerprint()
}
export const ASSET_DENOMINATION = {
  TICKER: 'ticker',
  SYMBOL: 'symbol',
  NAME: 'name',
  FINGERPRINT: 'fingerprint',
}
export type AssetDenomination = typeof ASSET_DENOMINATION[keyof typeof ASSET_DENOMINATION]
export const decodeHexAscii = (text: string) => {
  const bytes = [...Buffer.from(text, 'hex')]
  const isAscii = bytes.every((byte) => byte > 32 && byte < 127)
  return isAscii ? String.fromCharCode(...bytes) : undefined
}
export const getTicker = (token: Token | DefaultAsset) => token.metadata.ticker
export const getSymbol = (token: Token | DefaultAsset) =>
  token.metadata.ticker
    ? utfSymbols.CURRENCIES[token.metadata.ticker]
      ? utfSymbols.CURRENCIES[token.metadata.ticker]
      : token.metadata.ticker
    : null
export const getName = (token: Token | DefaultAsset) =>
  token.metadata.longName || decodeHexAscii(token.metadata.assetName) || getTokenFingerprint(token) || undefined
// NOTE: There is a bug when starting fresh, the metadata is empty
export const getAssetDenomination = (
  token: Token | DefaultAsset,
  denomination: AssetDenomination,
): string | null | undefined => {
  switch (denomination) {
    case ASSET_DENOMINATION.TICKER:
      return getTicker(token)

    case ASSET_DENOMINATION.SYMBOL:
      return getSymbol(token)

    case ASSET_DENOMINATION.NAME:
      return getName(token)

    case ASSET_DENOMINATION.FINGERPRINT:
      return getTokenFingerprint(token)

    default:
      return null
  }
}
export const getAssetDenominationOrId = (token: Token | DefaultAsset, denomination?: AssetDenomination): string => {
  if (denomination !== undefined) {
    return getAssetDenomination(token, denomination) ?? getTokenFingerprint(token)
  }

  return (
    getAssetDenomination(token, ASSET_DENOMINATION.TICKER) ||
    getAssetDenomination(token, ASSET_DENOMINATION.NAME) ||
    getTokenFingerprint(token)
  )
}
export const getAssetDenominationOrUnknown = (
  token: Token | DefaultAsset,
  denomination: AssetDenomination,
  intl: IntlShape,
): string => getAssetDenomination(token, denomination) ?? intl.formatMessage(messages.unknownAssetName)
export const normalizeTokenAmount = (amount: BigNumber, token: Token | DefaultAsset): BigNumber => {
  const normalizationFactor = Math.pow(10, token.metadata.numberOfDecimals)
  return amount.dividedBy(normalizationFactor).decimalPlaces(token.metadata.numberOfDecimals)
}
export const formatTokenAmount = (amount: BigNumber, token: Token | DefaultAsset, maxLen: number | void): string => {
  const normalized = normalizeTokenAmount(amount, token)
  const amountStr = normalized.toFormat(token.metadata.numberOfDecimals)

  if (maxLen !== undefined && amountStr.length > maxLen) {
    return normalized.toExponential(maxLen)
  }

  return amountStr
}
export const formatTokenWithSymbol = (amount: BigNumber, token: Token | DefaultAsset): string => {
  const denomination = getAssetDenominationOrId(token, ASSET_DENOMINATION.SYMBOL)
  return `${formatTokenAmount(amount, token)}${utfSymbols.NBSP}${denomination}`
}
// We assume that tickers are non-localized. If ticker doesn't exist, default
// to identifier
export const formatTokenWithText = (amount: BigNumber, token: Token | DefaultAsset) => {
  const tickerOrId = getAssetDenominationOrId(token)
  return `${formatTokenAmount(amount, token)}${utfSymbols.NBSP}${tickerOrId}`
}
export const formatTokenWithTextWhenHidden = (text: string, token: Token | DefaultAsset) => {
  const tickerOrId = getAssetDenominationOrId(token)
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
export const formatAda = (amount: BigNumber) => {
  const num = amount.dividedBy(normalizationFactor)
  return num.toFormat(6)
}
export const formatAdaWithSymbol = (amount: BigNumber) =>
  `${formatAda(amount)}${utfSymbols.NBSP}${utfSymbols.CURRENCIES.ADA}`
// We assume that "ADA" is non-localized
export const formatAdaWithText = (amount: BigNumber) =>
  `${formatAda(amount)}${utfSymbols.NBSP}${defaultAssetMeta.ticker}`
export const formatAdaInteger = (amount: BigNumber) => {
  const num = amount.dividedToIntegerBy(normalizationFactor)

  if (amount.lt(0) && amount.gt(-normalizationFactor)) {
    // -0 needs special handling
    return '-0'
  } else {
    return num.toFormat(0)
  }
}
export const formatAdaFractional = (amount: BigNumber) => {
  const fractional = amount.abs().modulo(normalizationFactor).dividedBy(normalizationFactor)
  // remove leading '0'
  return fractional.toFormat(6).substring(1)
}
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
