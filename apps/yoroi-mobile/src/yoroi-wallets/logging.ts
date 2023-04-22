/* eslint-disable @typescript-eslint/no-explicit-any */
export const LogLevel = {
  Debug: 0,
  Info: 1,
  Warn: 2,
  Error: 3,
  Nothing: 4,
}

let _logLevel = LogLevel.Debug

/* eslint-disable no-console */
const consoleLogger = {
  debug: console.log, // console.debug is hidden by default in chrome
  info: console.info,
  warn: console.warn,
  error: console.error,
}
/* eslint-enable no-console */

let _logger = consoleLogger

export const setLogger = (logger: any) => {
  _logger = logger
}

export const setLogLevel = (level: typeof LogLevel[keyof typeof LogLevel]) => {
  _logLevel = level
}

export const Logger = {
  debug: (message: string, ...args: any) => LogLevel.Debug >= _logLevel && _logger.debug(message, ...args),
  info: (message: string, ...args: any) => LogLevel.Info >= _logLevel && _logger.info(message, ...args),
  warn: (message: string, ...args: any) => LogLevel.Warn >= _logLevel && _logger.warn(message, ...args),
  error: (message: string, ...args: any) => LogLevel.Error >= _logLevel && _logger.error(message, ...args),
  setLogLevel,
  setLogger,
}
