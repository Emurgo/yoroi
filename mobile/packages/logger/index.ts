// Export Logger namespace at top level
import {
  LoggerEntry,
  LoggerLevel,
  LoggerManager,
  LoggerMessage,
  LoggerMetadata,
  LoggerTransporter,
  LoggerTransporterOptions,
} from './types'

// Export types
export {
  LoggerEntry,
  LoggerLevel,
  LoggerManager,
  LoggerMessage,
  LoggerMetadata,
  LoggerTransporter,
  LoggerTransporterOptions,
} from './types'

// Export logger implementation
export {getLogger, noOpLogger, setLogger} from './logger'
export {throwLoggedError} from './throw-logged-error'
export {toLoggerMetadata} from './to-logger-metadata'

export namespace Logger {
  export type Level = LoggerLevel
  export const Level = LoggerLevel
  export type Message = LoggerMessage
  export type Metadata = LoggerMetadata
  export type Transporter = LoggerTransporter
  export type TransporterOptions = LoggerTransporterOptions
  export type Entry = LoggerEntry
  export type Manager = LoggerManager
}
