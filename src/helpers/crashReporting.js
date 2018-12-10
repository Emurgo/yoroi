// @flow

// $FlowFixMe we have turned off this module in .flowconfig
import firebase from 'react-native-firebase'
import {Logger} from '../utils/logging'

let _enabled = false

const addLog = (message: string) => {
  _enabled && firebase.crashlytics().log(message)
}

/* eslint-disable no-console */
const enable = () => {
  firebase.crashlytics().enableCrashlyticsCollection()
  Logger.setLogger({
    debug: console.debug,
    info: console.info,
    warn: (message: string, ...args) => {
      console.warn(message, ...args)
      addLog(`WARN: ${message}`)
    },
    error: (message: string, ...args: any) => {
      console.error(message, ...args)
      addLog(`ERROR: ${message}`)
    },
  })

  _enabled = true
}

// Warning(ppershing): ALWAYS use _enabled in the next methods
// because before crashlytics is enabled all
// firebase.crashlytics() calls would crash the app :-(

const setUserId = (userId: ?string) => {
  _enabled && firebase.crashlytics().setUserIdentifier(userId || '')
}

const setStringValue = (key: string, value: ?string) => {
  _enabled && firebase.crashlytics().setStringValue(key, value || '')
}

const setBoolValue = (key: string, value: ?boolean) => {
  _enabled && firebase.crashlytics().setBoolValue(key, value || false)
}

// Note(ppershing): crashing here is fine :-)
const crash = () => {
  firebase.crashlytics().crash()
}

export default {
  enable,
  setUserId,
  crash,
  setStringValue,
  setBoolValue,
}
