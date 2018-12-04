import {BigNumber} from 'bignumber.js'
import moment from 'moment'
import l10n from '../l10n'
import ExtendableError from 'es6-error'

// 1 ADA = 1 000 000 micro ada
const MICRO = 1000000

export const formatAda = (amount: BigNumber) => {
  const num = amount.dividedBy(MICRO)
  return num.toFormat(6)
}

export class InvalidAdaAmount extends ExtendableError {}

const MAX_ADA = new BigNumber('45 000 000 000 000000'.replace(/ /g, ''), 10)

export const parseAdaDecimal = (amount) => {
  const parsed = new BigNumber(amount, 10)
  if (parsed.isNaN()) {
    throw new InvalidAdaAmount('Invalid amount')
  }

  if (parsed.decimalPlaces() > 6) {
    throw new InvalidAdaAmount('Too many decimal places')
  }

  const value = parsed.times(MICRO)

  if (value.gte(MAX_ADA)) {
    throw new InvalidAdaAmount('Too large amount')
  }

  if (value.lt(0)) {
    throw new InvalidAdaAmount('Amount must be positive')
  }

  return value
}

export const formatAdaInteger = (amount: BigNumber) => {
  const num = amount.dividedToIntegerBy(MICRO)
  if (amount.lt(0) && amount.gt(-MICRO)) {
    // -0 needs special handling
    return '-0'
  } else {
    return num.toFormat(0)
  }
}

export const formatAdaFractional = (amount: BigNumber) => {
  const fractional = amount
    .abs()
    .modulo(MICRO)
    .dividedBy(MICRO)
  // remove leading '0'
  return fractional.toFormat(6).substring(1)
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
