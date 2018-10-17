// @flow
/* This module sets up Jest */
import fetch from 'node-fetch'
import {Logger, LogLevel} from './utils/logging'

global.fetch = fetch
Logger.setLogLevel(LogLevel.Warn)

