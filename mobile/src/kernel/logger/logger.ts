import {numberReplacer} from '@yoroi/common'
import {App} from '@yoroi/types'

import {freeze} from 'immer'

const TRAIL_LIMIT = 500

type LoggerState = {
  enabled: boolean
  trail: Array<App.Logger.Entry>
  filter: RegExp | null
  level: App.Logger.Level
  transporters: App.Logger.Transporter[]
}

let loggerInstance: LoggerState | null = null

function createLoggerState(): LoggerState {
  return {
    enabled: false,
    trail: [],
    filter: null,
    level: App.Logger.Level.Info,
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
}: Pick<App.Logger.TransporterOptions, 'level' | 'message' | 'metadata'>) {
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

function trailTransporter(options: App.Logger.TransporterOptions) {
  const state = getLoggerState()
  const newEntry: App.Logger.Entry = {
    ...options,
    message: options.message.toString(),
    id: `${Math.random().toString(36).slice(2)}`,
  }
  state.trail.unshift(newEntry)
  state.trail = state.trail.slice(0, TRAIL_LIMIT)
}

function createLogger(): App.Logger.Manager {
  return {
    debug(message: string, metadata: App.Logger.Metadata = {}) {
      const entry = {level: App.Logger.Level.Debug, message, metadata}
      transport(entry)
    },

    log(message: string, metadata: App.Logger.Metadata = {}) {
      const entry = {level: App.Logger.Level.Log, message, metadata}
      transport(entry)
    },

    info(message: string, metadata: App.Logger.Metadata = {}) {
      const entry = {level: App.Logger.Level.Info, message, metadata}
      transport(entry)
    },

    warn(message: string, metadata: App.Logger.Metadata = {}) {
      const entry = {level: App.Logger.Level.Warn, message, metadata}
      transport(entry)
    },

    error(error: Error | string, metadata: App.Logger.Metadata = {}) {
      const entry = {level: App.Logger.Level.Error, message: error, metadata}
      transport(entry)
    },

    addTransport(transport: App.Logger.Transporter) {
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

    set level(value: App.Logger.Level) {
      const state = getLoggerState()
      state.level = value
    },
  }
}

let loggerSingleton: App.Logger.Manager | null = null

export function getLogger(): App.Logger.Manager {
  if (!loggerSingleton) {
    loggerSingleton = createLogger()
  }
  return loggerSingleton
}

export const logger = getLogger()

const loggerHierarchy = freeze({
  [App.Logger.Level.Debug]: 4,
  [App.Logger.Level.Log]: 3,
  [App.Logger.Level.Info]: 2,
  [App.Logger.Level.Warn]: 1,
  [App.Logger.Level.Error]: 0,
})
