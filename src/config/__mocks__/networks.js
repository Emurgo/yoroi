// @flow
import {NETWORK_REGISTRY} from '../types'
import {NUMBERS} from '../numbers'

import type {NetworkId} from '../types'

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
    START_AT: 208,
    SLOTS_PER_EPOCH: 432000,
    SLOT_DURATION: 1,
    PER_EPOCH_PERCENTAGE_REWARD: 69344,
    COIN_TYPE: NUMBERS.COIN_TYPES.CARDANO,
  },
  JORMUNGANDR: {
    NETWORK_ID: NETWORK_REGISTRY.JORMUNGANDR,
    IS_MAINNET: false,
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
      CONSTANT: '155381',
      COEFFICIENT: '1',
      CERTIFICATE: '4',
      PER_CERTIFICATE_FEES: {
        CERTIFICATE_POOL_REGISTRATION: '5',
        CERTIFICATE_STAKE_DELEGATION: '6',
      },
    },
    ADDRESS_DISCRIMINATION: {
      PRODUCTION: '0',
      TEST: '1',
    },
    GENESISHASH:
      'adbdd5ede31637f6c9bad5c271eec0bc3d0cb9efb86a5b913bb55cba549d0770',
    BLOCK0_DATE: 1576264417000,
    SLOTS_PER_EPOCH: 5000,
    SLOT_DURATION: 10,
    EPOCH_REWARD: 21414,
    BECH32_PREFIX: {
      ADDRESS: 'addr',
    },
  },
}

export const isJormungandr = (networkId: NetworkId): boolean =>
  networkId === NETWORK_REGISTRY.JORMUNGANDR
