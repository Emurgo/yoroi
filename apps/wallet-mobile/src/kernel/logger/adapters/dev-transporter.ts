import {App} from '@yoroi/types'
import {freeze} from 'immer'

import {replacer} from '../helpers/replacer'
import {toLoggerMetadata} from '../helpers/to-logger-metadata'

/* eslint-disable no-console */
const devLogger = freeze({
  [App.Logger.Level.Debug]: console.debug, // console.debug is hidden by default in chrome
  [App.Logger.Level.Log]: console.log,
  [App.Logger.Level.Info]: console.info,
  [App.Logger.Level.Warn]: console.warn,
  [App.Logger.Level.Error]: console.error,
})
/* eslint-enable no-console */

export const devAdapter = (transport = devLogger) => {
  const transporter: App.Logger.Transporter = ({level, message, metadata, timestamp}) => {
    const formattedMetadata = Object.keys(metadata).length
      ? ' ' + JSON.stringify(toLoggerMetadata(metadata), replacer, 2)
      : ''
    const formattedMessage = metadata.origin?.length ? `${origin} ${message}` : message

    transport[level](`${new Date(timestamp).toISOString()} ${formattedMessage}${formattedMetadata}`)
  }

  return freeze({transporter})
}
