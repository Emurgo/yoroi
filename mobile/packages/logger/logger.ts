import {LoggerLevel, LoggerManager} from './types'

/**
 * No-op logger that does nothing
 * Used as default when no logger is provided
 */
export const noOpLogger: LoggerManager = {
  level: LoggerLevel.Debug,
  trail: [],
  filter: null,
  debug: () => {},
  log: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
  addTransport: () => () => {},
  disable: () => {},
  enable: () => {},
}

/**
 * Module-level logger instance
 * Defaults to noOpLogger until initialized by the app
 */
let sharedLogger: LoggerManager = noOpLogger

/**
 * Set the shared logger instance
 * Called by the app during initialization
 */
export const setLogger = (logger: LoggerManager): void => {
  sharedLogger = logger
}

/**
 * Get the current logger instance
 * Returns the shared logger (initialized by app) or noOpLogger
 */
export const getLogger = (): LoggerManager => sharedLogger
