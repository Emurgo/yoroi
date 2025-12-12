import {numberReplacer} from '@yoroi/common'
import {Logger} from '@yoroi/logger'

import {freeze} from 'immer'

const TRAIL_LIMIT = 500

type LoggerState = {
  enabled: boolean
  trail: Array<Logger.Entry>
  filter: RegExp | null
  level: Logger.Level
  transporters: Logger.Transporter[]
}

let loggerInstance: LoggerState | null = null

function createLoggerState(): LoggerState {
  return {
    enabled: false,
    trail: [],
    filter: null,
    level: Logger.Level.Info,
    transporters: [],
  }
}

function getLoggerState(): LoggerState {
  if (!loggerInstance) {
    loggerInstance = createLoggerState()
  }
  return loggerInstance
}

function transport({
  level,
  message,
  metadata,
}: Pick<Logger.TransporterOptions, 'level' | 'message' | 'metadata'>) {
  const state = getLoggerState()
  if (!state.enabled) return
  if (loggerHierarchy[level] > loggerHierarchy[state.level]) return
  if (
    state.filter &&
    !state.filter.test(JSON.stringify({message, metadata}, numberReplacer))
  )
    return

  const timestamp = Date.now()
  const entry = {level, message, metadata, timestamp}

  trailTransporter(entry)
  for (const transport of state.transporters) transport(entry)
}

function trailTransporter(options: Logger.TransporterOptions) {
  const state = getLoggerState()
  const newEntry: Logger.Entry = {
    ...options,
    message: options.message.toString(),
    id: `${Math.random().toString(36).slice(2)}`,
  }
  state.trail.unshift(newEntry)
  state.trail = state.trail.slice(0, TRAIL_LIMIT)
}

function createLogger(): Logger.Manager {
  return {
    debug(message: string, metadata: Logger.Metadata = {}) {
      const entry = {level: Logger.Level.Debug, message, metadata}
      transport(entry)
    },

    log(message: string, metadata: Logger.Metadata = {}) {
      const entry = {level: Logger.Level.Log, message, metadata}
      transport(entry)
    },

    info(message: string, metadata: Logger.Metadata = {}) {
      const entry = {level: Logger.Level.Info, message, metadata}
      transport(entry)
    },

    warn(message: string, metadata: Logger.Metadata = {}) {
      const entry = {level: Logger.Level.Warn, message, metadata}
      transport(entry)
    },

    error(error: Error | string, metadata: Logger.Metadata = {}) {
      const entry = {level: Logger.Level.Error, message: error, metadata}
      transport(entry)
    },

    addTransport(transport: Logger.Transporter) {
      const state = getLoggerState()
      state.transporters.push(transport)
      return () => {
        const index = state.transporters.indexOf(transport)
        if (index > -1) {
          state.transporters.splice(index, 1)
        }
      }
    },

    disable() {
      const state = getLoggerState()
      state.enabled = false
    },

    enable() {
      const state = getLoggerState()
      state.enabled = true
    },

    get trail() {
      const state = getLoggerState()
      return state.trail.slice(0)
    },

    get filter() {
      const state = getLoggerState()
      return state.filter
    },

    set filter(value: RegExp | null) {
      const state = getLoggerState()
      state.filter = value
    },

    get level() {
      const state = getLoggerState()
      return state.level
    },

    set level(value: Logger.Level) {
      const state = getLoggerState()
      state.level = value
    },
  }
}

let loggerSingleton: Logger.Manager | null = null

export function getLogger(): Logger.Manager {
  if (!loggerSingleton) {
    loggerSingleton = createLogger()
  }
  return loggerSingleton
}

export const logger = getLogger()

const loggerHierarchy = freeze({
  [Logger.Level.Debug]: 4,
  [Logger.Level.Log]: 3,
  [Logger.Level.Info]: 2,
  [Logger.Level.Warn]: 1,
  [Logger.Level.Error]: 0,
})
