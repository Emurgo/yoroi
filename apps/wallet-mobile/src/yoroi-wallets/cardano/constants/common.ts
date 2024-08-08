export const WALLET_IMPLEMENTATION_ID = 'haskell-shelley'
export const COIN_TYPE = 2147485463
export const HARD_DERIVATION_START = 2147483648
export const CHIMERIC_ACCOUNT = 2
export const STAKING_KEY_INDEX = 0

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

export const COINS_PER_UTXO_WORD = '34482'

export const COINS_PER_UTXO_BYTE = '4310'
