import {freeze} from 'immer'

import {LoggerLevel, LoggerManager, LoggerMetadata, LoggerTransporter, LoggerTransporterOptions} from './types'

export class Logger implements LoggerManager {
  #enabled = false
  static #instance: Logger

  level = LoggerLevel.Info

  readonly #transporters: LoggerTransporter[] = []

  static instance() {
    if (!Logger.#instance) return new Logger()
    return Logger.#instance
  }

  private constructor() {
    if (Logger.#instance) return Logger.#instance
    Logger.#instance = this
  }

  debug(message: string, metadata: LoggerMetadata = {}, origin = '') {
    this.transport({level: LoggerLevel.Debug, message, metadata, origin})
  }

  log(message: string, metadata: LoggerMetadata = {}, origin = '') {
    this.transport({level: LoggerLevel.Log, message, metadata, origin})
  }

  info(message: string, metadata: LoggerMetadata = {}, origin = '') {
    this.transport({level: LoggerLevel.Info, message, metadata, origin})
  }

  warn(message: string, metadata: LoggerMetadata = {}, origin = '') {
    this.transport({level: LoggerLevel.Warn, message, metadata, origin})
  }

  error(error: Error | string, metadata: LoggerMetadata = {}, origin = '') {
    this.transport({level: LoggerLevel.Error, message: error, metadata, origin})
  }

  addTransport(transport: LoggerTransporter) {
    this.#transporters.push(transport)
    return () => this.#transporters.splice(this.#transporters.indexOf(transport), 1)
  }

  disable() {
    this.#enabled = false
  }

  enable() {
    this.#enabled = true
  }

  // NOTE: needs `@babel/plugin-transform-private-methods` to use as #transport
  private transport({
    level,
    message,
    metadata,
    origin,
  }: Pick<LoggerTransporterOptions, 'level' | 'message' | 'metadata' | 'origin'>) {
    if (!this.#enabled) return
    if (loggerHierarchy[this.level] <= loggerHierarchy[level]) return

    const timestamp = Date.now()

    for (const transport of this.#transporters) {
      transport({
        level,
        message,
        metadata,
        timestamp,
        origin,
      })
    }
  }
}

export const logger = Logger.instance()

const loggerHierarchy = freeze({
  [LoggerLevel.Debug]: 4,
  [LoggerLevel.Log]: 3,
  [LoggerLevel.Info]: 2,
  [LoggerLevel.Warn]: 1,
  [LoggerLevel.Error]: 0,
})
