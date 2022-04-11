/* eslint-disable @typescript-eslint/no-explicit-any */
import * as Sentry from '@sentry/react-native'

import {Logger} from '../legacy/logging'
import {CONFIG} from './config'
let _enabled = false

const addLog = (message: string, level: Sentry.Severity = Sentry.Severity.Error) => {
  _enabled && Sentry.captureMessage(message, level)
}

/* eslint-disable no-console */
const enable = () => {
  if (!CONFIG.SENTRY.ENABLE) {
    return
  }

  // TODO(v-almonacid): test new setup
  Sentry.init({
    dsn: CONFIG.SENTRY.DSN,
  })
  _enabled = true
  Logger.setLogger({
    debug: console.debug,
    info: console.info,
    warn: (message: string, ...args) => {
      console.warn(message, ...args)
      addLog(`WARN: ${message}`, Sentry.Severity.Warning)
    },
    error: (message: string, ...args: any) => {
      console.error(message, ...args)
      addLog(`ERROR: ${message}`, Sentry.Severity.Error)
    },
  })
}

// Warning(ppershing): ALWAYS use _enabled in the next methods
// because before crashlytics is enabled all
// firebase.crashlytics() calls would crash the app :-(
const setUserId = (userId: string | null | undefined) => {
  _enabled &&
    Sentry.setUser({
      id: userId || '',
    })
}

const setStringValue = (key: string, value: string | null | undefined) => {
  _enabled &&
    Sentry.setExtras({
      key: value || '',
    })
}

const setBoolValue = (key: string, value: boolean | null | undefined) => {
  _enabled &&
    Sentry.setExtras({
      key: value || false,
    })
}

// Note(ppershing): crashing here is fine :-)
const crash = () => {
  _enabled && (Sentry as any).crash()
}

const testNativeCrash = () => {
  _enabled && Sentry.nativeCrash()
}

export default {
  enable,
  setUserId,
  crash,
  testNativeCrash,
  setStringValue,
  setBoolValue,
}
