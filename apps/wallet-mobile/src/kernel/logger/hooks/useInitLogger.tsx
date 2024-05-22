import * as React from 'react'

import {appInfo} from '../../appInfo'
import {loggerLevel} from '../../config'
import {isDev, isProduction, sentryDsn} from '../../env'
import {devAdapter} from '../adapters/dev-transporter'
import {Sentry} from '../adapters/sentry'
import {sentryAdapter} from '../adapters/sentry-transporter'
import {logger} from '../logger'

export const useInitLogger = (initialState: {enabled: boolean}) => {
  const ref = React.useRef(initialState.enabled)
  ref.current = initialState.enabled

  React.useEffect(() => {
    const sampleRate = isProduction ? 0.25 : 1

    logger.level = loggerLevel
    if (isDev) logger.addTransport(devAdapter().transporter)

    if (ref.current === true) {
      logger.enable()
    } else {
      logger.disable()
    }

    Sentry.init({
      dsn: sentryDsn,
      tracesSampleRate: sampleRate,
      environment: appInfo.environment,
      release: appInfo.release,
      dist: appInfo.distribution,
      beforeSend(event) {
        // https://github.com/getsentry/sentry-javascript/issues/2039
        // TODO: this will require to close the app when changing in the settings to take effect
        const isEnabled = ref.current
        return isEnabled ? event : null
      },
    })

    logger.addTransport(sentryAdapter().transporter)
  }, [])
}
