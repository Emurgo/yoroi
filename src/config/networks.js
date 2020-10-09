// @flow
import {NETWORK_REGISTRY} from './types'
import {NUMBERS} from './numbers'

import type {NetworkId} from './types'

const _DEFAULT_BACKEND_RULES = {
  FETCH_UTXOS_MAX_ADDRESSES: 50,
  TX_HISTORY_MAX_ADDRESSES: 50,
  FILTER_USED_MAX_ADDRESSES: 50,
  TX_HISTORY_RESPONSE_LIMIT: 50,
}

export const NETWORKS = {
  BYRON_MAINNET: {
    NETWORK_ID: NETWORK_REGISTRY.BYRON_MAINNET,
    MARKETING_NAME: 'Mainnet',
    IS_MAINNET: true,
    EXPLORER_URL_FOR_ADDRESS: (address: string) =>
      `https://explorer.cardano.org/en/address?address=${address}`,
    EXPLORER_URL_FOR_TX: (tx: string) =>
      `https://explorer.cardano.org/tx/${tx}`,
    PROTOCOL_MAGIC: 764824073,
    BACKEND: {
      API_ROOT: 'https://iohk-mainnet.yoroiwallet.com/api',
      ..._DEFAULT_BACKEND_RULES,
    },
    GENESIS_DATE: '1506203091000',
    START_AT: 0,
    SLOTS_PER_EPOCH: 21600,
    SLOT_DURATION: 20,
    COIN_TYPE: NUMBERS.COIN_TYPES.CARDANO,
  },
  HASKELL_SHELLEY: {
    NETWORK_ID: NETWORK_REGISTRY.HASKELL_SHELLEY,
    MARKETING_NAME: 'Mainnet',
    CHAIN_NETWORK_ID: '1',
    IS_MAINNET: true,
    EXPLORER_URL_FOR_ADDRESS: (address: string) =>
      `https://explorer.cardano.org/en/address?address=${address}`,
    EXPLORER_URL_FOR_TX: (tx: string) =>
      `https://explorer.cardano.org/tx/${tx}`,
    POOL_EXPLORER: 'https://adapools.yoroiwallet.com/?source=mobile',
    BACKEND: {
      API_ROOT: 'https://iohk-mainnet.yoroiwallet.com/api',
      ..._DEFAULT_BACKEND_RULES,
    },
    GENESIS_DATE: '1506203091000',
    START_AT: 208,
    SLOTS_PER_EPOCH: 432000,
    SLOT_DURATION: 1,
    PER_EPOCH_PERCENTAGE_REWARD: 69344,
    COIN_TYPE: NUMBERS.COIN_TYPES.CARDANO,
    LINEAR_FEE: {
      COEFFICIENT: '44',
      CONSTANT: '155381',
    },
    MINIMUM_UTXO_VAL: '1000000',
    POOL_DEPOSIT: '500000000',
    KEY_DEPOSIT: '2000000',
  },
  JORMUNGANDR: {
    NETWORK_ID: NETWORK_REGISTRY.JORMUNGANDR,
    MARKETING_NAME: 'Incentivized Testnet (ITN)',
    ENABLED: false,
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
    EXPLORER_URL_FOR_TX: (tx: string) => {
      throw new Error('not supported network')
    },
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
    PER_EPOCH_PERCENTAGE_REWARD: 19666,
    BECH32_PREFIX: {
      ADDRESS: 'addr',
    },
  },
}

export const isJormungandr = (networkId: NetworkId): boolean =>
  networkId === NETWORK_REGISTRY.JORMUNGANDR

type NetworkConfig =
  | typeof NETWORKS.BYRON_MAINNET
  | typeof NETWORKS.HASKELL_SHELLEY
  | typeof NETWORKS.JORMUNGANDR
export const getNetworkConfigById = (id: NetworkId): NetworkConfig => {
  const idx = Object.values(NETWORK_REGISTRY).indexOf(id)
  const network = Object.keys(NETWORK_REGISTRY)[idx]
  if (network != null && network !== 'UNDEFINED' && NETWORKS[network] != null) {
    return NETWORKS[network]
  }
  throw new Error('invalid networkId')
}
