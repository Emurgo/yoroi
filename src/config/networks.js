// @flow
import {NETWORK_REGISTRY} from './types'
import {NUMBERS} from './numbers'

const _DEFAULT_BACKEND_RULES = {
  FETCH_UTXOS_MAX_ADDRESSES: 50,
  TX_HISTORY_MAX_ADDRESSES: 50,
  FILTER_USED_MAX_ADDRESSES: 50,
  TX_HISTORY_RESPONSE_LIMIT: 50,
}

export const NETWORKS = {
  BYRON_MAINNET: {
    NETWORK_ID: NETWORK_REGISTRY.BYRON_MAINNET,
    IS_MAINNET: true,
    // API_ROOT: 'https://iohk-mainnet.yoroiwallet.com/api',
    EXPLORER_URL_FOR_TX: (tx: string) => `https://cardanoexplorer.com/tx/${tx}`,
    PROTOCOL_MAGIC: 764824073,
    BACKEND: {
      API_ROOT: 'https://iohk-mainnet.yoroiwallet.com/api',
      ..._DEFAULT_BACKEND_RULES,
    },
    COIN_TYPE: NUMBERS.COIN_TYPES.CARDANO,
  },
  HASKELL_SHELLEY: {
    NETWORK_ID: NETWORK_REGISTRY.HASKELL_SHELLEY,
    IS_MAINNET: true,
    BACKEND: {
      API_ROOT: 'TODO',
      ..._DEFAULT_BACKEND_RULES,
    },
    API_ROOT: 'https://iohk-mainnet.yoroiwallet.com/api', // TODO
    START_AT: 208,
    SLOTS_PER_EPOCH: 432000,
    SLOT_DURATION: 1,
    PER_EPOCH_PERCENTAGE_REWARD: 69344,
    COIN_TYPE: NUMBERS.COIN_TYPES.CARDANO,
  },
  JORMUNGANDR: {
    NETWORK_ID: NETWORK_REGISTRY.JORMUNGANDR,
    IS_MAINNET: false, // for now, assume testnet by default
    PROTOCOL_MAGIC: 764824073,
    BACKEND: {
      API_ROOT: 'https://shelley-itn-yoroi-backend.yoroiwallet.com/api',
      ..._DEFAULT_BACKEND_RULES,
    },
    SEIZA_STAKING_SIMPLE: (ADA: string) =>
      // eslint-disable-next-line max-len
      `https://testnet.seiza-website.emurgo.io/staking-simple/list?sortBy=RANDOM&searchText=&performance[]=0&performance[]=100&source=mobile&userAda=${ADA}`,
    EXPLORER_URL_FOR_ADDRESS: (address: string) =>
      `https://shelleyexplorer.cardano.org/address/?id=${address}`,
    LINEAR_FEE: {
      CONSTANT: '200000',
      COEFFICIENT: '100000',
      CERTIFICATE: '400000',
      PER_CERTIFICATE_FEES: {
        CERTIFICATE_POOL_REGISTRATION: '500000000',
        CERTIFICATE_STAKE_DELEGATION: '400000',
      },
    },
    ADDRESS_DISCRIMINATION: {
      PRODUCTION: '0',
      TEST: '1',
    },
    GENESISHASH:
      '8e4d2a343f3dcf9330ad9035b3e8d168e6728904262f2c434a4f8f934ec7b676',
    BLOCK0_DATE: 1576264417000,
    SLOTS_PER_EPOCH: 43200,
    SLOT_DURATION: 2,
    EPOCH_REWARD: 19666,
    BECH32_PREFIX: {
      ADDRESS: 'addr',
    },
  },
}
