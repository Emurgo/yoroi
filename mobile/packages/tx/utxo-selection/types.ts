import {Balance} from '@yoroi/types'

import {ModernUtxo} from '../utxo/models'

/**
 * Coin selection strategy
 */
export type SelectionStrategy =
  | 'largestFirst'
  | 'keepRelevant'
  | 'largestFirstMultiAsset'

/**
 * Result of coin selection
 */
export type SelectionResult = {
  selected: ModernUtxo[]
  remaining: ModernUtxo[]
  selectedAmounts: Balance.Amounts
  missingAmounts: Balance.Amounts
}

/**
 * Options for coin selection
 */
export type SelectionOptions = {
  /**
   * Maximum number of UTXOs to select (optional)
   */
  maxUtxos?: number
  /**
   * Minimum ADA amount to keep in change (dust threshold)
   */
  minUtxoValue?: string
}
