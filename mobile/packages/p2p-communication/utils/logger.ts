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
 * Get logger or return no-op logger
 */
export const getLogger = (logger?: App.Logger.Manager): App.Logger.Manager =>
  logger ?? noOpLogger
