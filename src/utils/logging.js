// @flow

export const LogLevel = {
  Debug: 0,
  Info: 1,
  Warn: 2,
  Error: 3,
  Nothing: 4,
}

let logLevel = LogLevel.Debug

/* eslint-disable no-console */
const logger = {
  debug: console.log, // console.debug is hidden by default in chrome
  info: console.info,
  warn: console.warn,
  error: console.error,
}
/* eslint-enable no-console */

export const setLogLevel = (level: $Values<typeof LogLevel>) => {
  logLevel = level
}

export const Logger = {
  debug: (...args: any) => LogLevel.Debug >= logLevel && logger.debug(...args),
  info: (...args: any) => LogLevel.Info >= logLevel && logger.info(...args),
  warn: (message: string, ...args: any) =>
    LogLevel.Warn >= logLevel && logger.warn(message, ...args),
  error: (message: string, ...args: any) =>
    LogLevel.Error >= logLevel && logger.error(message, ...args),
  setLogLevel,
}
