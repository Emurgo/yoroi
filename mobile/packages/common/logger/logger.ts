import {App} from '@yoroi/types'

/**
 * No-op logger that does nothing
 * Used as default when no logger is provided
 */
export const noOpLogger: App.Logger.Manager = {
  level: App.Logger.Level.Debug,
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

/**
 * Get logger or return provided logger if given
 * Useful for edge cases where you might want to override the shared logger temporarily
 * @deprecated Prefer using getLogger() directly. This function is kept for backward compatibility.
 */
export const getLoggerOrDefault = (
  logger?: App.Logger.Manager,
): App.Logger.Manager => logger ?? sharedLogger
