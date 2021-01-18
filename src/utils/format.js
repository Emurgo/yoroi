// @flow
import {BigNumber} from 'bignumber.js'
import {defineMessages} from 'react-intl'
import moment from 'moment'
import utfSymbols from './utfSymbols'

import {getCardanoDefaultAsset} from '../config/config'

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

const defaultAssetMeta = getCardanoDefaultAsset().metadata
const normalizationFactor = Math.pow(10, defaultAssetMeta.numberOfDecimals)

export const formatAda = (amount: BigNumber) => {
  const num = amount.dividedBy(normalizationFactor)
  return num.toFormat(6)
}

export const formatAdaWithSymbol = (amount: BigNumber) =>
  `${formatAda(amount)}${utfSymbols.NBSP}${utfSymbols.ADA}`

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
