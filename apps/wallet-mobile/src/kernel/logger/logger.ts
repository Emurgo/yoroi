import {freeze} from 'immer'

import {
  LoggerEntry,
  LoggerLevel,
  LoggerManager,
  LoggerMetadata,
  LoggerTransporter,
  LoggerTransporterOptions,
} from './types'

class Logger implements LoggerManager {
  static readonly trailLimit = 500
  static #instance: Logger

  #enabled = false
  #trail: Array<LoggerEntry> = []

  filter: RegExp | null = null
  level = LoggerLevel.Info

  readonly #transporters: LoggerTransporter[] = []

  static instance(): Logger {
    if (!Logger.#instance) {
      Logger.#instance = new Logger()
    }
    return Logger.#instance
  }

  private constructor() {
    if (Logger.#instance) {
      return Logger.#instance
    }
    Logger.#instance = this
  }

  debug(message: string, metadata: LoggerMetadata = {}) {
    const entry = {level: LoggerLevel.Debug, message, metadata}
    // this.transport(entry)
  }

  log(message: string, metadata: LoggerMetadata = {}) {
    const entry = {level: LoggerLevel.Debug, message, metadata}
    this.transport(entry)
  }

  info(message: string, metadata: LoggerMetadata = {}) {
    const entry = {level: LoggerLevel.Debug, message, metadata}
    this.transport(entry)
  }

  warn(message: string, metadata: LoggerMetadata = {}) {
    const entry = {level: LoggerLevel.Debug, message, metadata}
    this.transport(entry)
  }

  error(error: Error | string, metadata: LoggerMetadata = {}) {
    const entry = {level: LoggerLevel.Debug, message: error, metadata}
    this.transport(entry)
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

  get trail() {
    return this.#trail.slice(0)
  }

  // NOTE: needs `@babel/plugin-transform-private-methods` to use as #transport
  private transport({level, message, metadata}: Pick<LoggerTransporterOptions, 'level' | 'message' | 'metadata'>) {
    if (!this.#enabled) return
    if (loggerHierarchy[level] > loggerHierarchy[this.level]) return
    if (this.filter && !this.filter.test(JSON.stringify({message, metadata}))) return

    const timestamp = Date.now()
    const entry = {level, message, metadata, timestamp}

    this.trailTransporter(entry)
    for (const transport of this.#transporters) transport(entry)
  }

  private trailTransporter(options: LoggerTransporterOptions) {
    const newEntry: LoggerEntry = {
      ...options,
      message: options.message.toString(),
      id: `${Math.random().toString(36).slice(2)}`,
    }
    this.#trail.unshift(newEntry)
    this.#trail = this.#trail.slice(0, Logger.trailLimit)
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
