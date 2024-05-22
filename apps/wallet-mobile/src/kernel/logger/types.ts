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

  [key: string]: unknown
}

export type LoggerTransporter = (options: LoggerTransporterOptions) => void

export type LoggerTransporterOptions = {
  level: LoggerLevel
  message: LoggerMessage
  metadata: LoggerMetadata
  timestamp: number
  origin: string
}

export interface LoggerManager {
  level: LoggerLevel
  debug(message: string, metadata?: LoggerMetadata, origin?: string): void
  log(message: string, metadata?: LoggerMetadata, origin?: string): void
  info(message: string, metadata?: LoggerMetadata, origin?: string): void
  warn(message: string, metadata?: LoggerMetadata, origin?: string): void
  error(error: Error | string, metadata?: LoggerMetadata, origin?: string): void
  addTransport(transport: LoggerTransporter): () => void
  disable(): void
  enable(): void
}
