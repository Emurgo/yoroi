import {freeze} from 'immer'

const oneSecond = 1e3
const oneMinute = 60 * 1e3
const fiveMinutes = 5 * 60 * 1e3
const halfHour = 30 * 60 * 1e3
const oneHour = 60 * 60 * 1e3
const oneDay = 24 * 60 * 60 * 1e3
const oneWeek = 7 * 24 * 60 * 60 * 1e3
const oneMonth = 30 * 24 * 60 * 60 * 1e3
const sixMonths = 182.5 * 24 * 60 * 60 * 1e3
const oneYear = 365 * 24 * 60 * 60 * 1e3

export const time = freeze({
  oneSecond,
  oneMinute,
  fiveMinutes,
  halfHour,
  oneHour,
  oneDay,
  oneWeek,
  oneMonth,
  sixMonths,
  oneYear,

  // helpers
  seconds: (seconds: number) => seconds * oneSecond,
  minutes: (minutes: number) => minutes * oneMinute,
  hours: (hours: number) => hours * oneHour,
  days: (days: number) => days * oneDay,
  weeks: (weeks: number) => weeks * oneWeek,
  months: (months: number) => months * oneMonth,
  years: (years: number) => years * oneYear,

  // session here means while the wallet is open
  session: Infinity,
})
