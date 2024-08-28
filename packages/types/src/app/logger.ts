export enum AppLoggerLevel {
  Debug = 'debug',
  Log = 'log',
  Info = 'info',
  Warn = 'warn',
  Error = 'error',
}

export type AppLoggerMessage = string | Error

export type AppLoggerMetadata = {
  // https://develop.sentry.dev/sdk/event-payloads/breadcrumbs/#breadcrumb-types
  type?:
    | 'default'
    | 'debug'
    | 'error'
    | 'navigation'
    | 'http'
    | 'info'
    | 'query'
    | 'transaction'
    | 'ui'
    | 'user'

  origin?: string // origin package / module

  [key: string]: unknown
}

export type AppLoggerTransporter = (
  options: AppLoggerTransporterOptions,
) => void

export type AppLoggerTransporterOptions = {
  level: AppLoggerLevel
  message: AppLoggerMessage
  metadata: AppLoggerMetadata
  timestamp: number
}

export type AppLoggerEntry = {
  id: string
  level: AppLoggerLevel
  message: string
  metadata: AppLoggerMetadata
  timestamp: number
}

export interface AppLoggerManager {
  level: AppLoggerLevel
  debug(message: string, metadata?: AppLoggerMetadata): void
  log(message: string, metadata?: AppLoggerMetadata): void
  info(message: string, metadata?: AppLoggerMetadata): void
  warn(message: string, metadata?: AppLoggerMetadata): void
  error(error: Error | string, metadata?: AppLoggerMetadata): void
  addTransport(transport: AppLoggerTransporter): () => void
  disable(): void
  enable(): void
}
