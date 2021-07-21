// @flow

import {Sentry, SentrySeverity} from '@sentry/react-native'

import {CONFIG} from '../config/config'
import {Logger} from '../utils/logging'

let _enabled = false

const addLog = (message: string, level: SentrySeverity = SentrySeverity.Error) => {
  _enabled && Sentry.captureMessage(message, {level})
}

/* eslint-disable no-console */
const enable = () => {
  if (!CONFIG.SENTRY.ENABLE) {
    return
  }
  // TODO(v-almonacid): test new setup
  Sentry.init({
    dsn: CONFIG.SENTRY.DSN,
  }).then(() => {
    _enabled = true
  })

  Logger.setLogger({
    debug: console.debug,
    info: console.info,
    warn: (message: string, ...args) => {
      console.warn(message, ...args)
      addLog(`WARN: ${message}`, SentrySeverity.Warning)
    },
    error: (message: string, ...args: any) => {
      console.error(message, ...args)
      addLog(`ERROR: ${message}`, SentrySeverity.Error)
    },
  })
}

// Warning(ppershing): ALWAYS use _enabled in the next methods
// because before crashlytics is enabled all
// firebase.crashlytics() calls would crash the app :-(

const setUserId = (userId: ?string) => {
  _enabled &&
    Sentry.setUserContext({
      id: userId || '',
    })
}

const setStringValue = (key: string, value: ?string) => {
  _enabled && Sentry.setExtraContext({key: value || ''})
}

const setBoolValue = (key: string, value: ?boolean) => {
  _enabled && Sentry.setExtraContext({key: value || false})
}

// Note(ppershing): crashing here is fine :-)
const crash = () => {
  _enabled && Sentry.crash()
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
