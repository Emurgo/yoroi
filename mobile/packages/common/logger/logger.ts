import {App, AppLoggerLevel} from '@yoroi/types'

/**
 * No-op logger that does nothing
 * Used as default when no logger is provided
 */
export const noOpLogger: App.Logger.Manager = {
  level: AppLoggerLevel.Debug,
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
let sharedLogger: App.Logger.Manager = noOpLogger

/**
 * Set the shared logger instance
 * Called by the app during initialization
 */
export const setLogger = (logger: App.Logger.Manager): void => {
  sharedLogger = logger
}

/**
 * Get the current logger instance
 * Returns the shared logger (initialized by app) or noOpLogger
 */
export const getLogger = (): App.Logger.Manager => sharedLogger
