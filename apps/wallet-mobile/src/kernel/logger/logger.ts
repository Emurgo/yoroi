import {App} from '@yoroi/types'
import {freeze} from 'immer'

import {replacer} from './helpers/replacer'

class Logger implements App.Logger.Manager {
  static readonly trailLimit = 500
  static #instance: Logger

  #enabled = false
  #trail: Array<App.Logger.Entry> = []

  filter: RegExp | null = null
  level = App.Logger.Level.Info

  readonly #transporters: App.Logger.Transporter[] = []

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

  debug(message: string, metadata: App.Logger.Metadata = {}) {
    const entry = {level: App.Logger.Level.Debug, message, metadata}
    this.transport(entry)
  }

  log(message: string, metadata: App.Logger.Metadata = {}) {
    const entry = {level: App.Logger.Level.Log, message, metadata}
    this.transport(entry)
  }

  info(message: string, metadata: App.Logger.Metadata = {}) {
    const entry = {level: App.Logger.Level.Info, message, metadata}
    this.transport(entry)
  }

  warn(message: string, metadata: App.Logger.Metadata = {}) {
    const entry = {level: App.Logger.Level.Warn, message, metadata}
    this.transport(entry)
  }

  error(error: Error | string, metadata: App.Logger.Metadata = {}) {
    const entry = {level: App.Logger.Level.Error, message: error, metadata}
    this.transport(entry)
  }

  addTransport(transport: App.Logger.Transporter) {
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
  private transport({level, message, metadata}: Pick<App.Logger.TransporterOptions, 'level' | 'message' | 'metadata'>) {
    if (!this.#enabled) return
    if (loggerHierarchy[level] > loggerHierarchy[this.level]) return
    if (this.filter && !this.filter.test(JSON.stringify({message, metadata}, replacer))) return

    const timestamp = Date.now()
    const entry = {level, message, metadata, timestamp}

    this.trailTransporter(entry)
    for (const transport of this.#transporters) transport(entry)
  }

  private trailTransporter(options: App.Logger.TransporterOptions) {
    const newEntry: App.Logger.Entry = {
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
  [App.Logger.Level.Debug]: 4,
  [App.Logger.Level.Log]: 3,
  [App.Logger.Level.Info]: 2,
  [App.Logger.Level.Warn]: 1,
  [App.Logger.Level.Error]: 0,
})
