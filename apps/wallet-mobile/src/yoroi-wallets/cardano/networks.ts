/* eslint-disable @typescript-eslint/no-explicit-any */
import {isKeyOf} from '@yoroi/common'

import * as SANCHONET_CONFIG from '../cardano/constants/sanchonet/constants'
import type {NetworkId} from '../types/other'
import {NETWORK_REGISTRY, YOROI_PROVIDER_IDS} from '../types/other'
import {NUMBERS} from './numbers'

const _DEFAULT_BACKEND_RULES = {
  FETCH_UTXOS_MAX_ADDRESSES: 50,
  TX_HISTORY_MAX_ADDRESSES: 50,
  FILTER_USED_MAX_ADDRESSES: 50,
  TX_HISTORY_RESPONSE_LIMIT: 50,
}

/**
 * note(v-almonacid): this list contains configuration data for current and
 * deprecated networks. Naturally, these are not normalized (some networks
 * require parameters that other networks don't).
 * To keep in mind:
 * - each blockchain protocol can have multiple networks (eg. a mainnet and a
     testnet)
 * - the app can be built on mainnet or testnet mode. When built on testnet mode,
 *   we'll use testnet configuration if available (see ./config.js).
 * - mainnet and testnet are two separate builds.
 * - as a general rule, all configuration data should be accessed from a single
 *   global object -> ./config.js and not from here.
 */
export const BYRON_MAINNET = {
  PROVIDER_ID: YOROI_PROVIDER_IDS.BYRON_MAINNET,
  NETWORK_ID: NETWORK_REGISTRY.BYRON_MAINNET,
  MARKETING_NAME: 'Mainnet',
  ENABLED: false,
  IS_MAINNET: true,
  EXPLORER_URL_FOR_ADDRESS: (_addr: string) => '',
  EXPLORER_URL_FOR_TOKEN: (_addr: string) => '',
  CEXPLORER_URL_FOR_TOKEN: (_addr: string) => '',
  EXPLORER_URL_FOR_TX: (_addr: string) => '',
  PROTOCOL_MAGIC: 764824073,
  GENESIS_DATE: '1506203091000',
  START_AT: 0,
  SLOTS_PER_EPOCH: 21600,
  SLOT_DURATION: 20,
  COIN_TYPE: NUMBERS.COIN_TYPES.CARDANO,
}
const HASKELL_SHELLEY = {
  PROVIDER_ID: YOROI_PROVIDER_IDS.HASKELL_SHELLEY,
  NETWORK_ID: NETWORK_REGISTRY.HASKELL_SHELLEY,
  MARKETING_NAME: 'Cardano Mainnet',
  ENABLED: true,
  CHAIN_NETWORK_ID: '1',
  IS_MAINNET: true,

  EXPLORER_URL_FOR_ADDRESS: (address: string) => `https://cardanoscan.io/address/${address}`,
  EXPLORER_URL_FOR_TOKEN: (fingerprint: string) =>
    fingerprint.length > 0 ? `https://cardanoscan.io/token/${fingerprint}` : `https://cardanoscan.io/tokens`,
  CEXPLORER_URL_FOR_TOKEN: (fingerprint: string) =>
    fingerprint.length > 0 ? `https://cexplorer.io/asset/${fingerprint}` : `https://cexplorer.io/asset`,
  EXPLORER_URL_FOR_TX: (txid: string) => `https://cardanoscan.io/transaction/${txid}`,
  POOL_EXPLORER: 'https://adapools.yoroiwallet.com/?source=mobile',

  BACKEND: {
    API_ROOT: 'https://api.yoroiwallet.com/api',
    NFT_STORAGE_URL: 'https://fibo-validated-nft-images.s3.amazonaws.com',
    TOKEN_INFO_SERVICE: 'https://cdn.yoroiwallet.com',
    ..._DEFAULT_BACKEND_RULES,
  },
  BASE_CONFIG: [
    {
      // byron-era
      PROTOCOL_MAGIC: 764824073,
      // aka byron network id
      START_AT: 0,
      GENESIS_DATE: '1506203091000',
      SLOTS_PER_EPOCH: 21600,
      SLOT_DURATION: 20,
    },
    {
      // shelley-era
      START_AT: 208,
      SLOTS_PER_EPOCH: 432000,
      SLOT_DURATION: 1,
    },
  ],
  PER_EPOCH_PERCENTAGE_REWARD: 69344,
  COIN_TYPE: NUMBERS.COIN_TYPES.CARDANO,
  LINEAR_FEE: {
    COEFFICIENT: '44',
    CONSTANT: '155381',
  },
  // @deprecated
  MINIMUM_UTXO_VAL: '1000000',
  COINS_PER_UTXO_WORD: '34482',
  POOL_DEPOSIT: '500000000',
  KEY_DEPOSIT: '2000000',
}
const HASKELL_SHELLEY_TESTNET = {
  PROVIDER_ID: YOROI_PROVIDER_IDS.HASKELL_SHELLEY_TESTNET,
  NETWORK_ID: NETWORK_REGISTRY.HASKELL_SHELLEY_TESTNET,
  MARKETING_NAME: 'Cardano testnet',
  ENABLED: true,
  CHAIN_NETWORK_ID: '0',
  IS_MAINNET: false,

  EXPLORER_URL_FOR_ADDRESS: (address: string) => `https://preprod.cardanoscan.io/address/${address}`,
  EXPLORER_URL_FOR_TOKEN: (fingerprint: string) =>
    fingerprint.length > 0
      ? `https://preprod.cardanoscan.io/token/${fingerprint}`
      : `https://preprod.cardanoscan.io/tokens`,
  CEXPLORER_URL_FOR_TOKEN: (fingerprint: string) =>
    fingerprint.length > 0 ? `https://preprod.cexplorer.io/asset/${fingerprint}` : `https://preprod.cexplorer.io/asset`,
  EXPLORER_URL_FOR_TX: (txid: string) => `https://preprod.cardanoscan.io/transaction/${txid}`,
  POOL_EXPLORER: 'https://adapools.yoroiwallet.com/?source=mobile',

  BACKEND: {
    API_ROOT: 'https://preprod-backend.yoroiwallet.com/api',
    NFT_STORAGE_URL: 'https://validated-nft-images.s3.amazonaws.com',
    TOKEN_INFO_SERVICE: 'https://stage-cdn.yoroiwallet.com',
    ..._DEFAULT_BACKEND_RULES,
  },
  BASE_CONFIG: [
    {
      PROTOCOL_MAGIC: 1097911063,
      // aka byron network id
      START_AT: 0,
      GENESIS_DATE: '1563999616000',
      SLOTS_PER_EPOCH: 21600,
      SLOT_DURATION: 20,
    },
    {
      // shelley-era
      START_AT: 74,
      SLOTS_PER_EPOCH: 432000,
      SLOT_DURATION: 1,
    },
  ],
  PER_EPOCH_PERCENTAGE_REWARD: 69344,
  COIN_TYPE: NUMBERS.COIN_TYPES.CARDANO,
  LINEAR_FEE: {
    COEFFICIENT: '44',
    CONSTANT: '155381',
  },
  MINIMUM_UTXO_VAL: '1000000',
  COINS_PER_UTXO_WORD: '34482',
  POOL_DEPOSIT: '500000000',
  KEY_DEPOSIT: '2000000',
}

export const NETWORKS = {
  // Deprecated
  BYRON_MAINNET,

  HASKELL_SHELLEY,
  HASKELL_SHELLEY_TESTNET,
  SANCHONET: SANCHONET_CONFIG.NETWORK_CONFIG,
}
export type NetworkConfig =
  | typeof NETWORKS.BYRON_MAINNET
  | typeof NETWORKS.HASKELL_SHELLEY
  | typeof NETWORKS.HASKELL_SHELLEY_TESTNET
  | typeof NETWORKS.SANCHONET

/**
 * queries related to blockchain/network parameters
 */
export const isHaskellShelleyNetwork = (networkId: NetworkId): boolean =>
  networkId === NETWORK_REGISTRY.HASKELL_SHELLEY ||
  networkId === NETWORK_REGISTRY.HASKELL_SHELLEY_TESTNET ||
  networkId === NETWORK_REGISTRY.SANCHONET
export const getCardanoByronConfig = () => NETWORKS.BYRON_MAINNET

export const getNetworkConfigById = (id: NetworkId): NetworkConfig => {
  const idx = Object.values(NETWORK_REGISTRY).indexOf(id)
  const network: string = Object.keys(NETWORK_REGISTRY)[idx]

  if (network != null && network !== 'UNDEFINED' && isKeyOf(network, NETWORKS) && NETWORKS[network] != null) {
    return NETWORKS[network]
  }

  throw new Error('invalid networkId')
}
export type CardanoHaskellShelleyNetwork =
  | typeof NETWORKS.HASKELL_SHELLEY
  | typeof NETWORKS.HASKELL_SHELLEY_TESTNET
  | typeof NETWORKS.SANCHONET
export const getCardanoNetworkConfigById = (networkId: NetworkId): CardanoHaskellShelleyNetwork => {
  switch (networkId) {
    case NETWORKS.HASKELL_SHELLEY.NETWORK_ID:
      return NETWORKS.HASKELL_SHELLEY

    case NETWORKS.HASKELL_SHELLEY_TESTNET.NETWORK_ID:
      return NETWORKS.HASKELL_SHELLEY_TESTNET

    case NETWORKS.SANCHONET.NETWORK_ID:
      return NETWORKS.SANCHONET

    default:
      throw new Error('network id is not a valid Haskell Shelley id')
  }
}
