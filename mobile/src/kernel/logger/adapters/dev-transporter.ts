import {numberReplacer, toLoggerMetadata} from '@yoroi/common'
import {App} from '@yoroi/types'

import {freeze} from 'immer'

const devLogger = freeze({
  [App.Logger.Level.Debug]: console.log, // console.debug is hidden by default in chrome
  [App.Logger.Level.Log]: console.log,
  [App.Logger.Level.Info]: console.info,
  [App.Logger.Level.Warn]: console.warn,
  [App.Logger.Level.Error]: console.error,
})

export const devAdapter = (transport = devLogger) => {
  const transporter: App.Logger.Transporter = ({
    level,
    message,
    metadata,
    timestamp,
  }) => {
    const formattedMetadata = Object.keys(metadata).length
      ? ' ' + JSON.stringify(toLoggerMetadata(metadata), numberReplacer, 2)
      : ''
    const formattedMessage = metadata.origin?.length
      ? `${metadata.origin} ${message}`
      : message

    transport[level](
      `${new Date(
        timestamp,
      ).toISOString()} ${formattedMessage}${formattedMetadata}`,
    )
  }

  return freeze({transporter})
}
