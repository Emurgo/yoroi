/* eslint-disable @typescript-eslint/no-explicit-any */
import {flatten} from 'lodash'

import {NUMBERS} from './numbers'
import type {NetworkId, YoroiProvider} from './types'
import {NETWORK_REGISTRY, YOROI_PROVIDER_IDS} from './types'
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
const BYRON_MAINNET = {
  PROVIDER_ID: YOROI_PROVIDER_IDS.BYRON_MAINNET,
  NETWORK_ID: NETWORK_REGISTRY.BYRON_MAINNET,
  MARKETING_NAME: 'Mainnet',
  ENABLED: false,
  IS_MAINNET: true,
  EXPLORER_URL_FOR_ADDRESS: (_addr: string) => '',
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
  EXPLORER_URL_FOR_ADDRESS: (address: string) => `https://explorer.cardano.org/en/address?address=${address}`,
  EXPLORER_URL_FOR_TX: (tx: string) => `https://explorer.cardano.org/tx/${tx}`,
  POOL_EXPLORER: 'https://adapools.yoroiwallet.com/?source=mobile',
  BACKEND: {
    API_ROOT: 'https://iohk-mainnet.yoroiwallet.com/api',
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
  MINIMUM_UTXO_VAL: '1000000',
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
  EXPLORER_URL_FOR_ADDRESS: (address: string) =>
    `https://explorer.cardano-testnet.iohkdev.io/address?address=${address}`,
  EXPLORER_URL_FOR_TX: (tx: string) => `https://explorer.cardano-testnet.iohkdev.io/tx/${tx}`,
  POOL_EXPLORER: 'https://adapools.yoroiwallet.com/?source=mobile',
  BACKEND: {
    API_ROOT: 'https://testnet-backend.yoroiwallet.com/api',
    TOKEN_INFO_SERVICE: 'https://metadata.cardano-testnet.iohkdev.io',
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
  POOL_DEPOSIT: '500000000',
  KEY_DEPOSIT: '2000000',
}
const JORMUNGANDR = {
  PROVIDER_ID: YOROI_PROVIDER_IDS.JORMUNGANDR,
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
    `https://testnet.seiza-website.emurgo.io/staking-simple/list?sortBy=RANDOM&searchText=&performance[]=0&performance[]=100&source=mobile&userAda=${ADA}`,
  EXPLORER_URL_FOR_ADDRESS: (address: string) => `https://shelleyexplorer.cardano.org/address/?id=${address}`,
  EXPLORER_URL_FOR_TX: (_tx: string) => {
    throw new Error('non supported network')
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
  GENESISHASH: '8e4d2a343f3dcf9330ad9035b3e8d168e6728904262f2c434a4f8f934ec7b676',
  BLOCK0_DATE: 1576264417000,
  SLOTS_PER_EPOCH: 43200,
  SLOT_DURATION: 2,
  PER_EPOCH_PERCENTAGE_REWARD: 19666,
  BECH32_PREFIX: {
    ADDRESS: 'addr',
  },
}
// ALONZO
const ALONZO_MAINNET = {
  PROVIDER_ID: YOROI_PROVIDER_IDS.ALONZO_MAINNET,
  ...(HASKELL_SHELLEY as any),
  MARKETING_NAME: 'Alonzo Main Net',
}
const ALONZO_TESTNET = {
  PROVIDER_ID: YOROI_PROVIDER_IDS.ALONZO_TESTNET,
  ...(HASKELL_SHELLEY_TESTNET as any),
  BACKEND: {
    ...HASKELL_SHELLEY_TESTNET.BACKEND,
    API_ROOT: 'https://alonzo-backend.yoroiwallet.com',
  },
  MARKETING_NAME: 'Alonzo Test Net',
  EXPLORER_URL_FOR_ADDRESS: (address: string) =>
    `https://explorer.alonzo-purple.dev.cardano.org/address?address=${address}`,
  EXPLORER_URL_FOR_TX: (tx: string) => `https://explorer.alonzo-purple.dev.cardano.org/tx/${tx}`,
}
export const NETWORKS = {
  // Deprecated
  BYRON_MAINNET,
  HASKELL_SHELLEY,
  HASKELL_SHELLEY_TESTNET,
  // Deprecated. Consider removing
  JORMUNGANDR,
}
type NetworkConfig =
  | typeof NETWORKS.BYRON_MAINNET
  | typeof NETWORKS.HASKELL_SHELLEY
  | typeof NETWORKS.HASKELL_SHELLEY_TESTNET
  | typeof NETWORKS.JORMUNGANDR
// PROVIDER
// NOTE: For now we are using the same obj, later we will decouple network/protocol/connection
export const PROVIDERS = {
  BYRON_MAINNET,
  HASKELL_SHELLEY,
  HASKELL_SHELLEY_TESTNET,
  ALONZO_MAINNET,
  ALONZO_TESTNET,
  JORMUNGANDR,
}
export type YoroiProviderConfig =
  | typeof BYRON_MAINNET
  | typeof HASKELL_SHELLEY
  | typeof HASKELL_SHELLEY_TESTNET
  | typeof ALONZO_MAINNET
  | typeof ALONZO_TESTNET
  | typeof JORMUNGANDR
export const getYoroiProvider = (
  networkConfig: NetworkConfig,
  provider: YoroiProvider | null | undefined,
): YoroiProviderConfig => {
  if (provider === 'emurgo-alonzo') {
    if (networkConfig.NETWORK_ID === NETWORK_REGISTRY.HASKELL_SHELLEY) {
      return PROVIDERS.ALONZO_MAINNET
    } else if (networkConfig.NETWORK_ID === NETWORK_REGISTRY.HASKELL_SHELLEY_TESTNET) {
      return PROVIDERS.ALONZO_TESTNET
    }
  }

  return networkConfig
}

/**
 * queries related to blockchain/network parameters
 */
// TODO: perhaps rename as isJormungandrNetwork for better naming consistency
export const isJormungandr = (networkId: NetworkId): boolean => networkId === NETWORK_REGISTRY.JORMUNGANDR
export const isHaskellShelleyNetwork = (networkId: NetworkId): boolean =>
  networkId === NETWORK_REGISTRY.HASKELL_SHELLEY || networkId === NETWORK_REGISTRY.HASKELL_SHELLEY_TESTNET
export const getCardanoByronConfig = () => NETWORKS.BYRON_MAINNET
export const getNetworkConfigById = (id: NetworkId, provider?: YoroiProvider | null | undefined): NetworkConfig => {
  const idx = Object.values(NETWORK_REGISTRY).indexOf(id)
  const network = Object.keys(NETWORK_REGISTRY)[idx]

  if (network != null && network !== 'UNDEFINED' && NETWORKS[network] != null) {
    return getYoroiProvider(NETWORKS[network], provider)
  }

  throw new Error('invalid networkId')
}
export type CardanoHaskellShelleyNetwork = typeof NETWORKS.HASKELL_SHELLEY | typeof NETWORKS.HASKELL_SHELLEY_TESTNET
export const getCardanoNetworkConfigById = (
  networkId: NetworkId,
  provider?: YoroiProvider | null | undefined,
): CardanoHaskellShelleyNetwork => {
  switch (networkId) {
    case NETWORKS.HASKELL_SHELLEY.NETWORK_ID:
      if (provider === 'emurgo-alonzo') {
        return PROVIDERS.ALONZO_MAINNET
      }

      return NETWORKS.HASKELL_SHELLEY

    case NETWORKS.HASKELL_SHELLEY_TESTNET.NETWORK_ID:
      if (provider === 'emurgo-alonzo') {
        return PROVIDERS.ALONZO_TESTNET
      }

      return NETWORKS.HASKELL_SHELLEY_TESTNET

    default:
      throw new Error('network id is not a valid Haskell Shelley id')
  }
}
export const PRIMARY_ASSET_CONSTANTS = {
  CARDANO: '', // ERGO: '',
  // JORMUNGANDR: '',
}
export const DEFAULT_ASSETS: Array<Record<string, any>> = flatten(
  Object.keys(NETWORKS)
    .map((key) => NETWORKS[key])
    .filter((network) => network.ENABLED)
    .map((network) => {
      if (isHaskellShelleyNetwork(network.NETWORK_ID)) {
        return [
          {
            NETWORK_ID: network.NETWORK_ID,
            IDENTIFIER: PRIMARY_ASSET_CONSTANTS.CARDANO,
            IS_DEFAULT: true,
            METADATA: {
              TYPE: 'Cardano',
              POLICY_ID: PRIMARY_ASSET_CONSTANTS.CARDANO,
              ASSET_NAME: PRIMARY_ASSET_CONSTANTS.CARDANO,
              TICKER: network.IS_MAINNET ? 'ADA' : 'TADA',
              LONG_NAME: null,
              NUMBER_OF_DECIMALS: 6,
              MAX_SUPPLY: '45 000 000 000 000000'.replace(/ /g, ''),
            },
          },
        ]
      }

      throw new Error(`Missing default asset for network type ${JSON.stringify(network)}`)
    }),
)
export const MAX_VALUE_BYTES = 5000
export const MAX_TX_BYTES = 16 * 1024
