// @flow
import {BigNumber} from 'bignumber.js'

import {LogLevel} from './utils/logging'
import env from './env'

const IS_DEBUG = __DEV__
// debugging flags
const _SHOW_INIT_DEBUG_SCREEN = true
const _PREFILL_WALLET_INFO = true
const _USE_TESTNET = env.getBoolean('USE_TESTNET', true)
const _SENTRY = env.getString('SENTRY')
const _LOG_LEVEL = IS_DEBUG ? LogLevel.Debug : LogLevel.Warn
const _ASSURANCE_STRICT = false

const _COMMIT = env.getString('COMMIT')

export const CARDANO_CONFIG = {
  TESTNET: {
    PROTOCOL_MAGIC: 764824073,
    API_ROOT: 'https://iohk-mainnet.yoroiwallet.com/api',
    EXPLORER_URL_FOR_TX: (tx: string) => `https://cardanoexplorer.com/tx/${tx}`,
  },
  MAINNET: {
    PROTOCOL_MAGIC: 764824073,
    API_ROOT: 'https://iohk-mainnet.yoroiwallet.com/api',
    EXPLORER_URL_FOR_TX: (tx: string) => `https://cardanoexplorer.com/tx/${tx}`,
  },
  SHELLEY: {
    PROTOCOL_MAGIC: 764824073,
    API_ROOT: 'https://shelley-testnet-yoroi-backend.yoroiwallet.com/api',
    EXPLORER_URL_FOR_ADDRESS: (address: string) =>
      `https://shelleyexplorer.cardano.org/address/?id=${address}`,
    LINEAR_FEE: {
      CONSTANT: '155381',
      COEFFICIENT: '1',
      CERTIFICATE: '4',
    },
    ADDRESS_DISCRIMINATION: {
      PRODUCTION: '0',
      TEST: '1',
    },
    GENESISHASH:
      'adbdd5ede31637f6c9bad5c271eec0bc3d0cb9efb86a5b913bb55cba549d0770',
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

export const NUMBERS = {
  DECIMAL_PLACES_IN_ADA: 6,
  LOVELACES_PER_ADA: new BigNumber('1 000 000'.replace(/ /g, ''), 10),
  HARD_DERIVATION_START: 2147483648,
  WALLET_TYPE_PURPOSE: {
    BIP44: 2147483692, // HARD_DERIVATION_START + 44;
    CIP1852: 2147485500, // HARD_DERIVATION_START + 1852;
  },
  COIN_TYPES: {
    CARDANO: 2147485463, // HARD_DERIVATION_START + 1812;
  },
  CHAIN_DERIVATIONS: {
    EXTERNAL: 0,
    INTERNAL: 1,
    CHIMERIC_ACCOUNT: 2,
  },
  STAKING_KEY_INDEX: 0,
}

export const CONFIG = {
  DEBUG: {
    START_WITH_INDEX_SCREEN: _SHOW_INIT_DEBUG_SCREEN,
    PREFILL_FORMS: _PREFILL_WALLET_INFO,
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
    ROOT: _USE_TESTNET
      ? CARDANO_CONFIG.TESTNET.API_ROOT
      : CARDANO_CONFIG.MAINNET.API_ROOT,
    // backend limitations
    FETCH_UTXOS_MAX_ADDRESSES: 50,
    TX_HISTORY_MAX_ADDRESSES: 50,
    FILTER_USED_MAX_ADDRESSES: 50,
    // TODO(ppershing): verify this constant
    TX_HISTORY_RESPONSE_LIMIT: 20,
  },

  MAX_CONCURRENT_REQUESTS: 5,
  CARDANO: _USE_TESTNET ? CARDANO_CONFIG.TESTNET : CARDANO_CONFIG.MAINNET,
  SENTRY: _SENTRY,
  MNEMONIC_STRENGTH: 160,
  ASSURANCE_LEVELS: _ASSURANCE_STRICT
    ? ASSURANCE_LEVELS.STRICT
    : ASSURANCE_LEVELS.NORMAL,
  HISTORY_REFRESH_TIME: 10 * 1000,
  WALLET: {
    ACCOUNT_INDEX: 0,
    DISCOVERY_GAP_SIZE: 20,
    DISCOVERY_BLOCK_SIZE: 50, // should be less than API limitations
    MAX_GENERATED_UNUSED: 20, // must be <= gap size
  },
  PIN_LENGTH: 6,
  APP_LOCK_TIMEOUT: 30 * 1000,
  ALLOW_SHORT_PASSWORD: false,
  LOG_LEVEL: _LOG_LEVEL,
  NETWORK: _USE_TESTNET ? 'Testnet' : 'Mainnet',
  COMMIT: _COMMIT,
  BECH32_PREFIX: {
    ADDRESS: 'addr',
  },
}
