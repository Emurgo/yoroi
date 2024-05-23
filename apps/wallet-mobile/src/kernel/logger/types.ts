export enum LoggerLevel {
  Debug = 'debug',
  Log = 'log',
  Info = 'info',
  Warn = 'warn',
  Error = 'error',
}

export type LoggerMessage = string | Error

export type LoggerMetadata = {
  // https://develop.sentry.dev/sdk/event-payloads/breadcrumbs/#breadcrumb-types
  type?: 'default' | 'debug' | 'error' | 'navigation' | 'http' | 'info' | 'query' | 'transaction' | 'ui' | 'user'

  origin?: string // origin package / module

  [key: string]: unknown
}

export type LoggerTransporter = (options: LoggerTransporterOptions) => void

export type LoggerTransporterOptions = {
  level: LoggerLevel
  message: LoggerMessage
  metadata: LoggerMetadata
  timestamp: number
}

export type LoggerEntry = {
  id: string
  level: LoggerLevel
  message: string
  metadata: LoggerMetadata
  timestamp: number
}

export interface LoggerManager {
  level: LoggerLevel
  debug(message: string, metadata?: LoggerMetadata): void
  log(message: string, metadata?: LoggerMetadata): void
  info(message: string, metadata?: LoggerMetadata): void
  warn(message: string, metadata?: LoggerMetadata): void
  error(error: Error | string, metadata?: LoggerMetadata): void
  addTransport(transport: LoggerTransporter): () => void
  disable(): void
  enable(): void
}
