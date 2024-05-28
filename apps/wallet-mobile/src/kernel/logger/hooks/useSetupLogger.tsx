import * as React from 'react'

import {getCrashReportsEnabled} from '../../../yoroi-wallets/hooks'
import {appInfo} from '../../appInfo'
import {loggerLevel} from '../../config'
import {isDev, isProduction, sentryDsn} from '../../env'
import {devAdapter} from '../adapters/dev-transporter'
import {Sentry} from '../adapters/sentry'
import {sentryAdapter} from '../adapters/sentry-transporter'
import {logger} from '../logger'

export const useSetupLogger = () => {
  const [done, setDone] = React.useState(false)

  React.useEffect(() => {
    const initLogger = async () => {
      const sampleRate = isProduction ? 0.25 : 1
      const isEnabled = await getCrashReportsEnabled()

      logger.level = loggerLevel
      if (isDev) logger.addTransport(devAdapter().transporter)

      if (isEnabled) {
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
          return isEnabled ? event : null
        },
      })

      logger.addTransport(sentryAdapter().transporter)

      setDone(true)
    }
    initLogger()
  }, [])

  return done
}
