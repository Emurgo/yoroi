// @flow
import {BigNumber} from 'bignumber.js'
import {defineMessages} from 'react-intl'
import moment from 'moment'
import utfSymbols from './utfSymbols'

import {getCardanoDefaultAsset} from '../config/config'

import type {Token, DefaultAsset} from '../types/HistoryTransaction'

const messages = defineMessages({
  today: {
    id: 'utils.format.today',
    defaultMessage: '!!!Today',
  },
  yesterday: {
    id: 'utils.format.yesterday',
    defaultMessage: '!!!Yesterday',
  },
})

// if we don't have a symbol for this asset, default to ticker first and
// then to identifier
export const getAssetDenomination = (token: Token | DefaultAsset): string =>
  token.metadata.ticker
    ? utfSymbols.CURRENCIES[token.metadata.ticker]
      ? utfSymbols.CURRENCIES[token.metadata.ticker]
      : token.metadata.ticker
    : token.identifier

export const formatTokenAmount = (
  amount: BigNumber,
  token: Token | DefaultAsset,
): string => {
  const normalizationFactor = Math.pow(10, token.metadata.numberOfDecimals)
  const num = amount.dividedBy(normalizationFactor)
  return num.toFormat(token.metadata.numberOfDecimals)
}

export const formatTokenWithSymbol = (
  amount: BigNumber,
  token: Token | DefaultAsset,
): string => {
  const denomination = getAssetDenomination(token)
  return `${formatTokenAmount(amount, token)}${utfSymbols.NBSP}${denomination}`
}

// We assume that tickers are non-localized. If ticker doesn't exist, default
// to identifier
export const formatTokenWithText = (
  amount: BigNumber,
  token: Token | DefaultAsset,
) => {
  const ticker = token.metadata.ticker
  if (ticker != null) {
    return `${formatTokenAmount(amount, token)}${utfSymbols.NBSP}${ticker}`
  }
  return `${formatTokenAmount(amount, token)}${utfSymbols.NBSP}${
    token.identifier
  }`
}

export const formatTokenInteger = (
  amount: BigNumber,
  token: Token | DefaultAsset,
) => {
  const normalizationFactor = Math.pow(10, token.metadata.numberOfDecimals)
  const num = amount.dividedToIntegerBy(normalizationFactor)
  if (amount.lt(0) && amount.gt(-normalizationFactor)) {
    // -0 needs special handling
    return '-0'
  } else {
    return num.toFormat(0)
  }
}

export const formatTokenFractional = (
  amount: BigNumber,
  token: Token | DefaultAsset,
) => {
  const normalizationFactor = Math.pow(10, token.metadata.numberOfDecimals)
  const fractional = amount
    .abs()
    .modulo(normalizationFactor)
    .dividedBy(normalizationFactor)
  // remove leading '0'
  return fractional.toFormat(token.metadata.numberOfDecimals).substring(1)
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
  const fractional = amount
    .abs()
    .modulo(normalizationFactor)
    .dividedBy(normalizationFactor)
  // remove leading '0'
  return fractional.toFormat(6).substring(1)
}

export const formatTimeToSeconds = (ts: string | moment) => {
  return moment(ts).format(moment(0)._locale._format.timeToSeconds)
}

export const formatDateToSeconds = (ts: string | moment) => {
  return moment(ts).format(moment(0)._locale._format.dateToSeconds)
}

export const formatDateRelative = (ts: string | moment, intl: any) => {
  const config = {
    sameDay: `[${intl.formatMessage(messages.today)}]`,
    lastDay: `[${intl.formatMessage(messages.yesterday)}]`,
    nextDay: 'L', // we don't really have dates in future
    lastWeek: 'L',
    nextWeek: 'L',
    sameElse: 'L',
  }
  return moment(ts).calendar(null, config)
}
