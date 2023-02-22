import {DefaultAsset} from '../../../../../types'
import {CardanoHaskellShelleyNetwork} from '..'
import {COIN_TYPE, KEY_DEPOSIT, LINEAR_FEE, MINIMUM_UTXO_VAL, POOL_DEPOSIT} from '../shared/constants'

export const ENABLED = false

export const CHAIN_NETWORK_ID = 1

export const EXPLORER_URL_FOR_ADDRESS = (address: string) => `https://cardanoscan.io/address/${address}`

export const EXPLORER_URL_FOR_TOKEN = (fingerprint: string) =>
  fingerprint.length > 0 ? `https://cardanoscan.io/token/${fingerprint}` : `https://cardanoscan.io/tokens`

export const EXPLORER_URL_FOR_TX = (txid: string) => `https://cardanoscan.io/transaction/${txid}`

export const POOL_EXPLORER = 'https://adapools.yoroiwallet.com/?source=mobile'

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

export const CARDANO_CONFIG = {
  linearFee: {
    coefficient: LINEAR_FEE.COEFFICIENT,
    constant: LINEAR_FEE.CONSTANT,
  },
  minimumUtxoVal: MINIMUM_UTXO_VAL,
  poolDeposit: POOL_DEPOSIT,
  keyDeposit: KEY_DEPOSIT,
  networkId: NETWORK_ID,
} as const

export const PER_EPOCH_PERCENTAGE_REWARD = 69344

export const DERIVATION_TYPE = 'cip1852'

export const SHELLEY_BASE_CONFIG = {
  // shelley-era
  START_AT: 208,
  SLOTS_PER_EPOCH: 432000,
  SLOT_DURATION: 1,
} as const

export const BYRON_BASE_CONFIG = {
  // byron-era
  PROTOCOL_MAGIC: 764824073,
  // aka byron network id
  START_AT: 0,
  GENESIS_DATE: '1506203091000',
  SLOTS_PER_EPOCH: 21600,
  SLOT_DURATION: 20,
} as const

export const CARDANO_HASKELL_SHELLEY_NETWORK: CardanoHaskellShelleyNetwork = {
  NETWORK_ID,
  PROVIDER_ID: 1,
  MARKETING_NAME,
  ENABLED,
  CHAIN_NETWORK_ID: String(CHAIN_NETWORK_ID),
  IS_MAINNET,
  KEY_DEPOSIT,

  LINEAR_FEE,
  MINIMUM_UTXO_VAL,
  POOL_DEPOSIT,

  EXPLORER_URL_FOR_ADDRESS,
  EXPLORER_URL_FOR_TOKEN,
  EXPLORER_URL_FOR_TX,
  POOL_EXPLORER,

  BACKEND,
  BASE_CONFIG: [BYRON_BASE_CONFIG, SHELLEY_BASE_CONFIG],
  PER_EPOCH_PERCENTAGE_REWARD: 69344,
  COIN_TYPE,
}

export const primaryToken: DefaultAsset = {
  identifier: '',
  isDefault: true,
  metadata: {
    assetName: '',
    longName: null,
    maxSupply: '45000000000000000',
    numberOfDecimals: 6,
    policyId: '',
    ticker: 'ADA',
    type: 'Cardano',
  },
  networkId: NETWORK_ID,
} as const

export const primaryTokenInfo = {
  id: '',
  name: 'ADA',
  group: '',
  fingerprint: '',
  decimals: 6,
  description: 'Cardano',
  ticker: 'ADA',
  symbol: '₳',
  logo: '',
  url: '',
} as const
