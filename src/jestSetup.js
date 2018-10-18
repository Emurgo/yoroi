// @flow
/* This module sets up Jest */
import fetch from 'node-fetch'
import {Logger, LogLevel} from './utils/logging'


export default {
  setup: () => {
    global.fetch = fetch
    Logger.setLogLevel(LogLevel.Warn)
  },
  debug: () => Logger.setLogLevel(LogLevel.Debug),
}
