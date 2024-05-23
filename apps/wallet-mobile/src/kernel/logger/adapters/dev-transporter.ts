import {freeze} from 'immer'

import {replacer} from '../helpers/replacer'
import {toLoggerMetadata} from '../helpers/to-logger-metadata'
import {LoggerLevel, LoggerTransporter} from '../types'

/* eslint-disable no-console */
const devLogger = freeze({
  [LoggerLevel.Debug]: console.debug, // console.debug is hidden by default in chrome
  [LoggerLevel.Log]: console.log,
  [LoggerLevel.Info]: console.info,
  [LoggerLevel.Warn]: console.warn,
  [LoggerLevel.Error]: console.error,
})
/* eslint-enable no-console */

export const devAdapter = (transport = devLogger) => {
  const transporter: LoggerTransporter = ({level, message, metadata, timestamp}) => {
    const formattedMetadata = Object.keys(metadata).length
      ? ' ' + JSON.stringify(toLoggerMetadata(metadata), replacer, 2)
      : ''
    const formattedMessage = metadata.origin?.length ? `${origin} ${message}` : message

    transport[level](`${new Date(timestamp).toISOString()} ${formattedMessage}${formattedMetadata}`)
  }

  return freeze({transporter})
}
