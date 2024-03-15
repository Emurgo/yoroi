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

const AGREEMENT_DATE = 1691967600000

const UNSTOPPABLE_API_KEY = env.getString('UNSTOPPABLE_API_KEY')
const GOVERNANCE_ENABLED_SINCE_BLOCK = {
  SANCHONET: 0,
  MAINNET: Infinity, // TODO: Add block number once known
  PREPROD: Infinity, // TODO: Add block number once known
}

const DAPP_EXPLORER_ENABLED = !isProduction() && !isNightly()

export const CONFIG = {
  SENTRY_DSN,
  PIN_LENGTH: 6,
  LOG_LEVEL: _LOG_LEVEL,
  COMMIT: _COMMIT,
  FORCE_CRASH_REPORTS,
  AGREEMENT_DATE,
  UNSTOPPABLE_API_KEY,
  GOVERNANCE_ENABLED_SINCE_BLOCK,
  DAPP_EXPLORER_ENABLED,
}

export const SCHEME_URL = 'yoroi://'
export const RAMP_ON_OFF_PATH = 'ramp-on-off/result'
export const LINKING_PREFIXES = [SCHEME_URL]
export const LINKING_CONFIG = {
  screens: {
    'app-root': {
      screens: {
        'main-wallet-routes': {
          screens: {
            history: {
              initialRouteName: 'history-list',
              screens: {
                'exchange-result': {
                  path: RAMP_ON_OFF_PATH,
                },
              },
            },
          },
        },
      },
    },
  },
}
