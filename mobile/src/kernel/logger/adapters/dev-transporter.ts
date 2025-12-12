import {numberReplacer} from '@yoroi/common'
import {Logger, toLoggerMetadata} from '@yoroi/logger'

import {freeze} from 'immer'

const devLogger = freeze({
  [Logger.Level.Debug]: console.log, // console.debug is hidden by default in chrome
  [Logger.Level.Log]: console.log,
  [Logger.Level.Info]: console.info,
  [Logger.Level.Warn]: console.warn,
  [Logger.Level.Error]: console.error,
})

export const devAdapter = (transport = devLogger) => {
  const transporter: Logger.Transporter = ({
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
