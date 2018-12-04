import {BigNumber} from 'bignumber.js'
import moment from 'moment'
import l10n from '../l10n'

// 1 ADA = 1 000 000 micro ada
const MICRO = 1000000

export const formatAda = (amount: BigNumber) => {
  const num = amount.dividedBy(MICRO)
  return num.toFormat(6)
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
