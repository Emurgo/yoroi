// @flow
import {BigNumber} from 'bignumber.js'
import moment from 'moment'
import utfSymbols from './utfSymbols'
import {LOVELACES_PER_ADA, DECIMAL_PLACES_IN_ADA} from '../config'
import l10n from '../l10n'

export const formatAda = (amount: BigNumber) => {
  const num = amount.dividedBy(LOVELACES_PER_ADA)
  return num.toFormat(DECIMAL_PLACES_IN_ADA)
}

export const formatAdaWithSymbol = (amount: BigNumber) =>
  `${formatAda(amount)}${utfSymbols.NBSP}${utfSymbols.ADA}`

// We assume that "ADA" is non-localized
export const formatAdaWithText = (amount: BigNumber) =>
  `${formatAda(amount)}${utfSymbols.NBSP}ADA`

export const formatAdaInteger = (amount: BigNumber) => {
  const num = amount.dividedToIntegerBy(LOVELACES_PER_ADA)
  if (amount.lt(0) && amount.gt(LOVELACES_PER_ADA.negated())) {
    // -0 needs special handling
    return '-0'
  } else {
    return num.toFormat(0)
  }
}

export const formatAdaFractional = (amount: BigNumber) => {
  const fractional = amount
    .abs()
    .modulo(LOVELACES_PER_ADA)
    .dividedBy(LOVELACES_PER_ADA)
  // remove leading '0'
  return fractional.toFormat(DECIMAL_PLACES_IN_ADA).substring(1)
}

export const formatTimeToSeconds = (ts: string | moment) => {
  return moment(ts).format(moment(0)._locale._format.timeToSeconds)
}

export const formatDateToSeconds = (ts: string | moment) => {
  return moment(ts).format(moment(0)._locale._format.dateToSeconds)
}

export const formatDateRelative = (ts: string | moment) => {
  const config = {
    sameDay: `[${l10n.translations.global.datetime.today}]`,
    lastDay: `[${l10n.translations.global.datetime.yesterday}]`,
    nextDay: 'L', // we don't really have dates in future
    lastWeek: 'L',
    nextWeek: 'L',
    sameElse: 'L',
  }
  return moment(ts).calendar(null, config)
}
