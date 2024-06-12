import {freeze} from 'immer'

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

export const COINS_PER_UTXO_WORD = '34482'

export const COINS_PER_UTXO_BYTE = '4310'

export const denominations = freeze({
  ada: 1_000_000n,
})

export const catalystConfig = freeze({
  minAda: 450n * denominations.ada,
  displayedMinAda: 500n * denominations.ada,
})
