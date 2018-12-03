// @flow
import {LogLevel} from './utils/logging'

const IS_DEBUG = __DEV__
// debugging flags
const SHOW_INIT_DEBUG_SCREEN = true
const PREFILL_WALLET_INFO = true

export const CARDANO_CONFIG = {
  TESTNET: {
    PROTOCOL_MAGIC: 633343913,
    API_ROOT: 'https://iohk-staging.yoroiwallet.com/api',
    EXPLORER_URL_FOR_TX: (tx: string) => `https://explorer.iohkdev.io/tx/${tx}`,
  },
  MAINNET: {
    PROTOCOL_MAGIC: 764824073,
    API_ROOT: 'https://iohk-mainnet.yoroiwallet.com/api',
    EXPLORER_URL_FOR_TX: (tx: string) => `https://cardanoexplorer.com/tx/${tx}`,
  },
}

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

const CARDANO = IS_DEBUG ? CARDANO_CONFIG.TESTNET : CARDANO_CONFIG.MAINNET

const LOG_LEVEL = IS_DEBUG ? LogLevel.Debug : LogLevel.Warn

export const CONFIG = {
  DEBUG: {
    PREFILL_FORMS: PREFILL_WALLET_INFO,
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
  API: {
    ROOT: CARDANO.API_ROOT,
    // backend limitations
    FETCH_UTXOS_MAX_ADDRESSES: 50,
    TX_HISTORY_MAX_ADDRESSES: 50,
    FILTER_USED_MAX_ADDRESSES: 50,
    // TODO(ppershing): verify this constant
    TX_HISTORY_RESPONSE_LIMIT: 20,
  },

  MAX_CONCURRENT_REQUESTS: 5,
  CARDANO,
  MNEMONIC_STRENGTH: 160,
  // TODO(ppershing): this should be configurable by user
  ASSURANCE_LEVELS: ASSURANCE_LEVELS.NORMAL,
  HISTORY_REFRESH_TIME: 10 * 1000,
  WALLET: {
    ACCOUNT_INDEX: 0,
    DISCOVERY_GAP_SIZE: 20,
    DISCOVERY_BLOCK_SIZE: 50, // should be less than API limitations
    MAX_GENERATED_UNUSED: 20, // must be <= gap size
  },
  PIN_LENGTH: 6,
  APP_LOCK_TIMEOUT: 3000,
  START_WITH_INDEX_SCREEN: SHOW_INIT_DEBUG_SCREEN,
  ALLOW_SHORT_PASSWORD: false,
  LOG_LEVEL,
}
