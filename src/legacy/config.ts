import {LogLevel} from '../legacy/logging'
import env from './env'

const IS_DEBUG = __DEV__

/** env variables & debugging flags
 *
 * WARNING: NEVER change these flags direclty here.
 * ALWAYS use the corresponding .env files.
 */
const BUILD_VARIANT = env.getString('BUILD_VARIANT')
const SHOW_INIT_DEBUG_SCREEN = env.getBoolean('SHOW_INIT_DEBUG_SCREEN', false)
const PREFILL_WALLET_INFO = !__DEV__ ? false : env.getBoolean('PREFILL_WALLET_INFO', false)
const USE_TESTNET = env.getBoolean('USE_TESTNET', false)
export const SHOW_PROD_POOLS_IN_DEV = !__DEV__ ? false : env.getBoolean('SHOW_PROD_POOLS_IN_DEV', false)
export const DISABLE_BACKGROUND_SYNC = !__DEV__ ? false : env.getBoolean('DISABLE_BACKGROUND_SYNC', false)
export const SHOW_NFT_GALLERY = __DEV__ ? true : env.getBoolean('SHOW_NFT_GALLERY', false)
export const MODERATING_NFTS_ENABLED = __DEV__ ? false : env.getBoolean('MODERATING_NFTS_ENABLED', false)

// TODO(v-almonacid): consider adding 'ENABLE' as an env variable
const SENTRY = {
  DSN: env.getString('SENTRY'),
  ENABLE: __DEV__ || BUILD_VARIANT === 'NIGHTLY',
}
const _COMMIT = env.getString('COMMIT')

const _LOG_LEVEL = IS_DEBUG ? LogLevel.Debug : LogLevel.Warn

export const CONFIG = {
  DEBUG: {
    // WARNING: NEVER change these flags
    START_WITH_INDEX_SCREEN: __DEV__ ? SHOW_INIT_DEBUG_SCREEN : false,
    PREFILL_FORMS: __DEV__ ? PREFILL_WALLET_INFO : false,
    WALLET_NAME: USE_TESTNET ? 'Auto Testnet' : 'Auto Nightly',
    PASSWORD: '1234567890',
    MNEMONIC1: ['dry balcony arctic what garbage sort', 'cart shine egg lamp manual bottom', 'slide assault bus'].join(
      ' ',
    ),
    MNEMONIC2: [
      'able grunt edge report orange wide',
      'amount decrease congress flee smile impulse',
      'parade perfect normal',
    ].join(' '),
    MNEMONIC3: [
      'make exercise taxi asset',
      'reject seek brain volcano roof',
      'boss already cement scrub',
      'nut priority',
    ].join(' '),
    SEND_ADDRESS: USE_TESTNET
      ? 'addr_test1qpaufs29emf7r62prt8r0l072nuvs4vezrgve2ty5csvvjwr3y3kdut55a40jff00qmg74686vz44v6k363md06qkq0qj8n0y9'
      : 'addr1q8dewyn53xdjyzu20xjj6wg7kkxyqq63upxqevt24jga8fgcdwap96xuy84apchhj8u6r7uvl974sy9qz0sedc7ayjks3sxz7a',
    SEND_AMOUNT: USE_TESTNET ? '3.3333' : '1',
  },
  BUILD_VARIANT,
  IS_TESTNET_BUILD: BUILD_VARIANT === 'STAGING',
  MAX_CONCURRENT_REQUESTS: 8,
  SENTRY,
  HISTORY_REFRESH_TIME: 25 * 1000,
  PIN_LENGTH: 6,
  LOG_LEVEL: _LOG_LEVEL,
  COMMIT: _COMMIT,
}

export const isNightly = () => CONFIG.BUILD_VARIANT === 'NIGHTLY'
