import {BigNumber} from 'bignumber.js'
import moment from 'moment'

const fmt = {
  prefix: '',
  decimalSeparator: '.',
  groupSeparator: ',',
  groupSize: 3,
  secondaryGroupSize: 0,
  fractionGroupSize: 0,
  fractionGroupSeparator: ' ',
  suffix: '',
}

export const initializeLocalization = (language: string) => {
  BigNumber.config({
    FORMAT: fmt,
  })
  moment.locale('de')
  // TODO(ppershing): localize moment
}

// Hardcoded here for now
initializeLocalization('ignored')

// 1 ADA = 1 000 000 micro ada
const MICRO = 1000000

export const formatAda = (amount: BigNumber) => {
  const num = amount.dividedBy(MICRO)
  return num.toFormat(6)
}

export const formatAdaInteger = (amount: BigNumber) => {
  const num = amount.dividedBy(MICRO)
  return num.toFormat(0)
}

export const formatAdaFractional = (amount: BigNumber) => {
  const fractional = amount
    .abs()
    .modulo(MICRO)
    .dividedBy(MICRO)
  // remove leading 0.
  return fractional.toFormat(6).substring(1)
}

export const formatTimeToSeconds = (ts: string | moment) => {
  return moment(ts).format('LT')
}
