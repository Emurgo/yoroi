// @flow

export const CARDANO_CONFIG = {
  TESTNET: {
    PROTOCOL_MAGIC: 633343913,
    API_ROOT: 'https://iohk-staging.yoroiwallet.com/api',
  },
  MAINNET: {
    PROTOCOL_MAGIC: 764824073,
    API_ROOT: 'https://iohk-mainnet.yoroiwallet.com/api',
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

const CARDANO = CARDANO_CONFIG.TESTNET

export const CONFIG = {
  USE_MOCK_API: false,
  API_ROOT: CARDANO.API_ROOT,
  CARDANO,
  MNEMONIC_STRENGTH: 160,
  // TODO(ppershing): this should be configurable by user
  ASSURANCE_LEVELS: ASSURANCE_LEVELS.NORMAL,
  HISTORY_REFRESH_TIME: 10 * 1000,
  DISCOVERY_GAP_SIZE: 20, // displayed to the user
  DISCOVERY_SEARCH_SIZE: 50, // should be >= GAP_SIZE*2+1 as we hate extreme corner cases
}
