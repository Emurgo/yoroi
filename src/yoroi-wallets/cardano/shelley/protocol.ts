import {DefaultAsset} from '../../types'
import {CardanoHaskellShelleyNetwork} from '..'

export const HISTORY_REFRESH_TIME = 25 * 1000

export const NETWORK_ID = 1
export const WALLET_IMPLEMENTATION_ID = 'haskell-shelley'
export const MARKETING_NAME = 'Cardano Mainnet'
export const ENABLED = true
export const CHAIN_NETWORK_ID = 1
export const IS_MAINNET = true

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
}

export const LINEAR_FEE = {
  COEFFICIENT: '44',
  CONSTANT: '155381',
}
export const MINIMUM_UTXO_VAL = '1000000'
export const POOL_DEPOSIT = '500000000'
export const KEY_DEPOSIT = '2000000'

export const DISCOVERY_GAP_SIZE = 20
export const DISCOVERY_BLOCK_SIZE = 50 // should be less than API limitations
export const MAX_GENERATED_UNUSED = 20 // must be <= gap size

export const CHAIN_DERIVATIONS = {
  EXTERNAL: 0,
  INTERNAL: 1,
  CHIMERIC_ACCOUNT: 2,
}

export const STAKING_KEY_INDEX = 0

export const HARD_DERIVATION_START = 2147483648

export const CIP1852 = 2147485500 // HARD_DERIVATION_START + 1852;

export const COIN_TYPE = 2147485463 // HARD_DERIVATION_START + 1815;

export const ACCOUNT_INDEX = 0

export const BIP44_DERIVATION_LEVELS = {
  ROOT: 0,
  PURPOSE: 1,
  COIN_TYPE: 2,
  ACCOUNT: 3,
  CHAIN: 4,
  ADDRESS: 5,
}

type AddressType = 'Internal' | 'External'
export const ADDRESS_TYPE_TO_CHANGE: Record<AddressType, number> = {
  External: 0,
  Internal: 1,
}

export const STAKING_KEY_PATH = [
  CIP1852,
  COIN_TYPE,
  ACCOUNT_INDEX + HARD_DERIVATION_START,
  CHAIN_DERIVATIONS.CHIMERIC_ACCOUNT,
  STAKING_KEY_INDEX,
]

export const REWARD_ADDRESS_ADDRESSING = {
  path: [
    CIP1852,
    COIN_TYPE,
    ACCOUNT_INDEX + HARD_DERIVATION_START,
    CHAIN_DERIVATIONS.CHIMERIC_ACCOUNT,
    STAKING_KEY_INDEX,
  ],
  startLevel: BIP44_DERIVATION_LEVELS.PURPOSE,
}

export const CARDANO_HASKELL_CONFIG = {
  linearFee: {
    coefficient: LINEAR_FEE.COEFFICIENT,
    constant: LINEAR_FEE.CONSTANT,
  },
  minimumUtxoVal: MINIMUM_UTXO_VAL,
  poolDeposit: POOL_DEPOSIT,
  keyDeposit: KEY_DEPOSIT,
  networkId: NETWORK_ID,
}

export const _PER_EPOCH_PERCENTAGE_REWARD = 69344
export const DERIVATION_TYPES = {
  BIP44: 'bip44',
  CIP1852: 'cip1852',
}
export const _TYPE = DERIVATION_TYPES.CIP1852
export const _MNEMONIC_LEN = 15

export const SHELLEY_BASE_CONFIG = {
  // shelley-era
  START_AT: 208,
  SLOTS_PER_EPOCH: 432000,
  SLOT_DURATION: 1,
}

export const BYRON_BASE_CONFIG = {
  // byron-era
  PROTOCOL_MAGIC: 764824073,
  // aka byron network id
  START_AT: 0,
  GENESIS_DATE: '1506203091000',
  SLOTS_PER_EPOCH: 21600,
  SLOT_DURATION: 20,
}

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
}

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
}
