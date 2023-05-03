import {LogLevel} from '../legacy/logging'
import env from './env'

const BUILD_VARIANT = env.getString('BUILD_VARIANT')
export const isNightly = () => BUILD_VARIANT === 'NIGHTLY'

// TODO(v-almonacid): consider adding 'ENABLE' as an env variable
const SENTRY = {
  DSN: env.getString('SENTRY'),
  ENABLE: __DEV__ || BUILD_VARIANT === 'NIGHTLY',
}
const _COMMIT = env.getString('COMMIT') ?? ''

const _LOG_LEVEL = __DEV__ ? LogLevel.Debug : LogLevel.Warn

export const CONFIG = {
  SENTRY,
  PIN_LENGTH: 6,
  LOG_LEVEL: _LOG_LEVEL,
  COMMIT: _COMMIT,
}
