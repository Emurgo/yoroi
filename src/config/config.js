// @flow
import {NUMBERS} from './numbers'
import {NETWORKS} from './networks'
import {LogLevel} from '../utils/logging'
import env from '../env'

const IS_DEBUG = __DEV__
/** debugging flags
 *
 * WARNING: NEVER change these flags direclty here.
 * ALWAYS use the corresponding .env files.
 */
const _SHOW_INIT_DEBUG_SCREEN = env.getBoolean('SHOW_INIT_DEBUG_SCREEN', false)
const _PREFILL_WALLET_INFO = env.getBoolean('PREFILL_WALLET_INFO', false)

// TODO(v-almonacid): consider adding 'ENABLE' as an env variable
const _SENTRY = {
  DSN: env.getString('SENTRY'),
  ENABLE: false,
}

const _LOG_LEVEL = IS_DEBUG ? LogLevel.Debug : LogLevel.Warn
const _ASSURANCE_STRICT = false

const _COMMIT = env.getString('COMMIT')

export const ASSURANCE_LEVELS = {
  NORMAL: {
    LOW: 3,
    MEDIUM: 9,
  },
  STRICT: {
    LOW: 5,
    MEDIUM: 15,
  },
}

const HARDWARE_WALLETS = {
  LEDGER_NANO: {
    ENABLED: false,
    DEFAULT_WALLET_NAME: 'My Ledger Wallet',
    VENDOR: 'ledger.com',
    MODEL: 'Nano',
    ENABLE_USB_TRANSPORT: true,
    USB_MIN_SDK: 24, // USB transport officially supported for Android SDK >= 24
  },
}

export const CONFIG = {
  DEBUG: {
    // WARNING: NEVER change these flags
    START_WITH_INDEX_SCREEN: __DEV__ ? _SHOW_INIT_DEBUG_SCREEN : false,
    PREFILL_FORMS: __DEV__ ? _PREFILL_WALLET_INFO : false,
    WALLET_NAME: 'My wallet',
    PASSWORD: 'aeg?eP3M:)(:',
    MNEMONIC1: [
      'dry balcony arctic what garbage sort',
      'cart shine egg lamp manual bottom',
      'slide assault bus',
    ].join(' '),
    MNEMONIC2: [
      'able grunt edge report orange wide',
      'amount decrease congress flee smile impulse',
      'parade perfect normal',
    ].join(' '),
    SEND_ADDRESS: 'Ae2tdPwUPEZAghGCdQykbGxc991wdoA8bXmSn7eCGuUKXF4EsRhWj4PJitn',
    SEND_AMOUNT: '1',
  },
  MAX_CONCURRENT_REQUESTS: 5,
  SENTRY: _SENTRY,
  MNEMONIC_STRENGTH: 160,
  ASSURANCE_LEVELS: _ASSURANCE_STRICT
    ? ASSURANCE_LEVELS.STRICT
    : ASSURANCE_LEVELS.NORMAL,
  HISTORY_REFRESH_TIME: 10 * 1000,
  WALLET: {
    DISCOVERY_GAP_SIZE: 20,
    DISCOVERY_BLOCK_SIZE: 50, // should be less than API limitations
    MAX_GENERATED_UNUSED: 20, // must be <= gap size
  },
  NUMBERS,
  NETWORKS,
  HARDWARE_WALLETS,
  PIN_LENGTH: 6,
  APP_LOCK_TIMEOUT: 30 * 1000,
  LOG_LEVEL: _LOG_LEVEL,
  COMMIT: _COMMIT,
}
