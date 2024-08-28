import {App} from '@yoroi/types'
import {freeze} from 'immer'

import {toLoggerMetadata} from '../helpers/to-logger-metadata'
import {Sentry} from './sentry'

export const sentryAdapter = (sentryRuntime = Sentry) => {
  const transporter: App.Logger.Transporter = ({level, message, metadata, timestamp}) => {
    const {type, ...meta} = metadata
    const formattedMetadata = toLoggerMetadata(meta)

    // simple message, add a breadcrumb
    if (typeof message === 'string') {
      const formattedMessage = metadata.origin?.length ? `${origin} ${message}` : message
      sentryRuntime.addBreadcrumb({
        message: formattedMessage,
        data: formattedMetadata,
        type: type ?? 'default',
        level: level as Sentry.Breadcrumb['level'],
        timestamp: timestamp / 1000,
      })

      if (level === 'error' || level === 'warn' || level === 'log') {
        sentryRuntime.captureMessage(formattedMessage, {
          level: level as Sentry.Breadcrumb['level'],
          extra: meta,
        })
      }
    } else {
      sentryRuntime.captureException(message, {
        extra: formattedMetadata,
      })
    }
  }

  return freeze({transporter})
}
