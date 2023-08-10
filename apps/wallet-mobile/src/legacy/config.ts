import {LogLevel} from '../legacy/logging'
import env from './env'

const BUILD_VARIANT = env.getString('BUILD_VARIANT')
export const isNightly = () => BUILD_VARIANT === 'NIGHTLY'
export const isProduction = () => BUILD_VARIANT === 'PROD'

// TODO(v-almonacid): consider adding 'ENABLE' as an env variable
const SENTRY_DSN = env.getString('SENTRY_DSN')
const _COMMIT = env.getString('COMMIT') ?? ''

const _LOG_LEVEL = __DEV__ ? LogLevel.Debug : LogLevel.Warn

const FORCE_CRASH_REPORTS = isNightly()

const LATEST_TERMS_AND_CONDITIONS_VERSION = 1
const LATEST_ANALYTICS_AGREEMENT_VERSION = 1

export const CONFIG = {
  SENTRY_DSN,
  PIN_LENGTH: 6,
  LOG_LEVEL: _LOG_LEVEL,
  COMMIT: _COMMIT,
  FORCE_CRASH_REPORTS,
  LATEST_TERMS_AND_CONDITIONS_VERSION,
  LATEST_ANALYTICS_AGREEMENT_VERSION,
}
