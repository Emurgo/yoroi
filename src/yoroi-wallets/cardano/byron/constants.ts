import {DefaultAsset, TokenInfo} from '../../types'

export * from '../../cardano/constants'

export const NETWORK_ID = 1
export const WALLET_IMPLEMENTATION_ID = 'haskell-byron'
export const PURPOSE = 2147483692 // BIP44
export const COIN_TYPE = 2147485463
export const ACCOUNT_INDEX = 0
export const HARD_DERIVATION_START = 2147483648
export const CHAIN_NETWORK_ID = '1'
export const BIP44_DERIVATION_LEVELS = {
  ROOT: 0,
  PURPOSE: 1,
  COIN_TYPE: 2,
  ACCOUNT: 3,
  CHAIN: 4,
  ADDRESS: 5,
} as const
export const KEY_DEPOSIT = '2000000'
export const POOL_DEPOSIT = '500000000'
export const LINEAR_FEE = {
  COEFFICIENT: '44',
  CONSTANT: '155381',
} as const
export const MINIMUM_UTXO_VAL = '1000000'

export const IS_MAINNET = true
export const API_ROOT = 'https://api.yoroiwallet.com/api'
export const TOKEN_INFO_SERVICE = 'https://cdn.yoroiwallet.com'
export const BACKEND = {
  API_ROOT,
  TOKEN_INFO_SERVICE,
  FETCH_UTXOS_MAX_ADDRESSES: 50,
  TX_HISTORY_MAX_ADDRESSES: 50,
  FILTER_USED_MAX_ADDRESSES: 50,
  TX_HISTORY_RESPONSE_LIMIT: 50,
} as const

export const PROTOCOL_MAGIC = 764824073
export const BYRON_BASE_CONFIG = {
  // byron-era
  PROTOCOL_MAGIC,
  // aka byron network id
  START_AT: 0,
  GENESIS_DATE: '1506203091000',
  SLOTS_PER_EPOCH: 21600,
  SLOT_DURATION: 20,
} as const
export const SHELLEY_BASE_CONFIG = {
  // shelley-era
  START_AT: 208,
  SLOTS_PER_EPOCH: 432000,
  SLOT_DURATION: 1,
}
export const BASE_CONFIG = {
  GENESIS_DATE: '1506203091000',
  PROTOCOL_MAGIC,
  SLOTS_PER_EPOCH: 432000,
  SLOT_DURATION: 1,
  START_AT: 208,
}

const BASE_CONFIG1 = [BYRON_BASE_CONFIG, SHELLEY_BASE_CONFIG]
export const NETWORK_CONFIG = {
  BACKEND,
  BASE_CONFIG: BASE_CONFIG1,
  CHAIN_NETWORK_ID: CHAIN_NETWORK_ID.toString(),
  COIN_TYPE,
  ENABLED: true,
  EXPLORER_URL_FOR_ADDRESS: () => '',
  EXPLORER_URL_FOR_TOKEN: () => '',
  EXPLORER_URL_FOR_TX: () => '',
  POOL_EXPLORER: 'https://adapools.yoroiwallet.com/?source=mobile',
  IS_MAINNET,
  KEY_DEPOSIT,
  LINEAR_FEE,
  MARKETING_NAME: 'Cardano Mainnet',
  MINIMUM_UTXO_VAL,
  NETWORK_ID,
  PER_EPOCH_PERCENTAGE_REWARD: 69344,
  POOL_DEPOSIT,
  PROVIDER_ID: 1,
} as const

export const DISCOVERY_GAP_SIZE = 20
export const DISCOVERY_BLOCK_SIZE = 50 // should be less than API limitations
export const MAX_GENERATED_UNUSED = 20 // must be <= gap size
export const WALLET_CONFIG = {
  WALLET_IMPLEMENTATION_ID: 'haskell-byron',
  TYPE: 'bip44',
  MNEMONIC_LEN: 15,
  DISCOVERY_GAP_SIZE,
  DISCOVERY_BLOCK_SIZE, // should be less than API limitations
  MAX_GENERATED_UNUSED, // must be <= gap size
} as const

export const PRIMARY_TOKEN_INFO: TokenInfo = {
  id: '',
  name: 'ADA',
  decimals: 6,
  description: 'Cardano',
  ticker: 'ADA',
  symbol: '₳',
  logo: '',
  url: '',
  fingerprint: '',
  group: '',
} as const

export const PRIMARY_TOKEN: DefaultAsset = {
  identifier: '',
  networkId: NETWORK_ID,
  isDefault: true,
  metadata: {
    type: 'Cardano',
    policyId: '',
    assetName: '',
    numberOfDecimals: 6,
    ticker: 'ADA',
    longName: null,
    maxSupply: '45000000000000000',
  },
} as const
