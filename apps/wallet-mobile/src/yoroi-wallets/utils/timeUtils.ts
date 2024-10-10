export const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

const sec_in_day = 86400
const sec_in_hour = 3600
const sec_in_min = 60
const ms_in_sec = 1000

export const formatTimeSpan = (ms: number): string => {
  if (ms < 0) return ''

  const totalSeconds = Math.round(Math.abs(ms) / ms_in_sec)

  const days = Math.floor(totalSeconds / sec_in_day)
  const hours = Math.floor((totalSeconds % sec_in_day) / sec_in_hour)
  const minutes = Math.floor((totalSeconds % sec_in_hour) / sec_in_min)

  const fmtDays = padWithZero(days) + 'd'
  const fmtHours = padWithZero(hours) + 'h'
  const fmtMinutes = padWithZero(minutes) + 'm'

  return `${fmtDays} : ${fmtHours} : ${fmtMinutes}`
}
const padWithZero = (n: number): string => (n < 10 ? `0${n}` : n.toString())
