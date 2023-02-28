/* eslint-disable @typescript-eslint/no-explicit-any */
import {flatten} from 'lodash'

import type {NetworkId} from '../types/other'
import {NETWORK_REGISTRY, YOROI_PROVIDER_IDS} from '../types/other'
import { BYRON_BASE_CONFIG, NETWORK_CONFIG as HASKELL_BYRON, PROTOCOL_MAGIC } from './byron/constants'
import {NETWORK_CONFIG as HASKELL_SHELLEY } from './shelley/constants'
import {NETWORK_CONFIG as HASKELL_SHELLEY_TESTNET } from './shelley-testnet/constants'
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
  PROVIDER_ID: HASKELL_BYRON.PROVIDER_ID,
  NETWORK_ID: HASKELL_BYRON.NETWORK_ID,
  MARKETING_NAME: HASKELL_BYRON.MARKETING_NAME,
  ENABLED: false,
  IS_MAINNET: HASKELL_BYRON.IS_MAINNET,
  EXPLORER_URL_FOR_ADDRESS: HASKELL_BYRON.EXPLORER_URL_FOR_ADDRESS,
  EXPLORER_URL_FOR_TOKEN: HASKELL_BYRON.EXPLORER_URL_FOR_TOKEN,
  EXPLORER_URL_FOR_TX: HASKELL_BYRON.EXPLORER_URL_FOR_TX,
  PROTOCOL_MAGIC: PROTOCOL_MAGIC,
  GENESIS_DATE: BYRON_BASE_CONFIG.GENESIS_DATE,
  START_AT: BYRON_BASE_CONFIG.START_AT,
  SLOTS_PER_EPOCH: BYRON_BASE_CONFIG.SLOTS_PER_EPOCH,
  SLOT_DURATION: BYRON_BASE_CONFIG.SLOT_DURATION,
  COIN_TYPE: HASKELL_BYRON.COIN_TYPE,
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
  EXPLORER_URL_FOR_TOKEN: (_addr: string) => {
    throw new Error('Deprecated network')
  },
  EXPLORER_URL_FOR_TX: (_tx: string) => {
    throw new Error('Deprecated network')
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

/**
 * queries related to blockchain/network parameters
 */
// TODO: perhaps rename as isJormungandrNetwork for better naming consistency
export const isJormungandr = (networkId: NetworkId): boolean => networkId === NETWORK_REGISTRY.JORMUNGANDR
export const isHaskellShelleyNetwork = (networkId: NetworkId): boolean =>
  networkId === NETWORK_REGISTRY.HASKELL_SHELLEY || networkId === NETWORK_REGISTRY.HASKELL_SHELLEY_TESTNET
export const getCardanoByronConfig = () => NETWORKS.BYRON_MAINNET
export const getNetworkConfigById = (id: NetworkId): NetworkConfig => {
  const idx = Object.values(NETWORK_REGISTRY).indexOf(id)
  const network = Object.keys(NETWORK_REGISTRY)[idx]

  if (network != null && network !== 'UNDEFINED' && NETWORKS[network] != null) {
    return NETWORKS[network]
  }

  throw new Error('invalid networkId')
}
export type CardanoHaskellShelleyNetwork = typeof NETWORKS.HASKELL_SHELLEY | typeof NETWORKS.HASKELL_SHELLEY_TESTNET
export const getCardanoNetworkConfigById = (networkId: NetworkId): CardanoHaskellShelleyNetwork => {
  switch (networkId) {
    case NETWORKS.HASKELL_SHELLEY.NETWORK_ID:
      return NETWORKS.HASKELL_SHELLEY

    case NETWORKS.HASKELL_SHELLEY_TESTNET.NETWORK_ID:
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
