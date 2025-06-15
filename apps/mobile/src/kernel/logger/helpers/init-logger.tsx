import {
  distribution,
  environment,
  isDev,
  isProduction,
  loggerFilter,
  loggerLevel,
  release,
  sentryDsn,
} from '../../constants'
import {crashReportsStorageKeyManager} from '../../storage/storages'
import {devAdapter} from '../adapters/dev-transporter'
import {Sentry} from '../adapters/sentry'
import {sentryAdapter} from '../adapters/sentry-transporter'
import {logger} from '../logger'

const isEnabled = crashReportsStorageKeyManager.read() || isDev

const sampleRate = isProduction ? 0.25 : 1

logger.level = loggerLevel
if (isDev) {
  logger.addTransport(devAdapter().transporter)
  logger.filter = loggerFilter
}

if (isEnabled) {
  logger.enable()
} else {
  logger.disable()
}

Sentry.init({
  dsn: sentryDsn,
  tracesSampleRate: sampleRate,
  environment,
  release,
  dist: distribution,
  beforeSend(event) {
    // https://github.com/getsentry/sentry-javascript/issues/2039
    // TODO: this will require to close the app when changing in the settings to take effect
    return isEnabled ? event : null
  },
})

logger.addTransport(sentryAdapter().transporter)
