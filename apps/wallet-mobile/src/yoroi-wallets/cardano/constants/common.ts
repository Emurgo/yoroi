export const WALLET_IMPLEMENTATION_ID = 'haskell-shelley'
export const DISCOVERY_GAP_SIZE = 20
export const DISCOVERY_BLOCK_SIZE = 50 // should be less than API limitations
export const MAX_GENERATED_UNUSED = 20 // must be <= gap size
export const PURPOSE = 2147485500
export const COIN_TYPE = 2147485463
export const ACCOUNT_INDEX = 0
export const HARD_DERIVATION_START = 2147483648
export const CHIMERIC_ACCOUNT = 2
export const STAKING_KEY_INDEX = 0

export const WALLET_CONFIG = {
  WALLET_IMPLEMENTATION_ID,
  TYPE: 'cip1852',
  MNEMONIC_LEN: 15,
  DISCOVERY_GAP_SIZE,
  DISCOVERY_BLOCK_SIZE, // should be less than API limitations
  MAX_GENERATED_UNUSED, // must be <= gap size
} as const

export const WALLET_CONFIG_24 = {
  ...WALLET_CONFIG,
  WALLET_IMPLEMENTATION_ID: 'haskell-shelley-24',
  MNEMONIC_LEN: 24,
} as const

export const STAKING_KEY_PATH = [
  PURPOSE,
  COIN_TYPE,
  ACCOUNT_INDEX + HARD_DERIVATION_START,
  CHIMERIC_ACCOUNT,
  STAKING_KEY_INDEX,
]

export const BIP44_DERIVATION_LEVELS = {
  ROOT: 0,
  PURPOSE: 1,
  COIN_TYPE: 2,
  ACCOUNT: 3,
  CHAIN: 4,
  ADDRESS: 5,
} as const

export const REWARD_ADDRESS_ADDRESSING = {
  path: [PURPOSE, COIN_TYPE, ACCOUNT_INDEX + HARD_DERIVATION_START, CHIMERIC_ACCOUNT, STAKING_KEY_INDEX],
  startLevel: BIP44_DERIVATION_LEVELS.PURPOSE,
}

export const KEY_DEPOSIT = '2000000'
export const POOL_DEPOSIT = '500000000'
export const LINEAR_FEE = {
  COEFFICIENT: '44',
  CONSTANT: '155381',
} as const
export const MINIMUM_UTXO_VAL = '1000000'

export const HISTORY_REFRESH_TIME = 25000

export const COINS_PER_UTXO_WORD = '34482'
