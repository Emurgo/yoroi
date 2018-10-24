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
    UTXO_ADDRESS_FETCH_BLOCK_SIZE: 50,
  },
}
