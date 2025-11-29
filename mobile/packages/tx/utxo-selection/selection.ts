import {primaryTokenId as defaultPrimaryTokenId} from '@yoroi/portfolio'
import {Balance, TokenId} from '@yoroi/types'

import {ModernUtxo} from '../utxo/models'
import {keepRelevant} from './keep-relevant'
import {largestFirst} from './largest-first'
import {largestFirstMultiAsset} from './multi-asset'
import type {
  SelectionOptions,
  SelectionResult,
  SelectionStrategy,
} from './types'

export {keepRelevant} from './keep-relevant'
export {largestFirst} from './largest-first'
export {largestFirstMultiAsset} from './multi-asset'
export * from './types'
export * from './utils'

/**
 * Select UTXOs using the specified strategy
 *
 * @param requiredAmounts - Required amounts to satisfy
 * @param availableUtxos - Available UTXOs to select from
 * @param strategy - Selection strategy to use
 * @param primaryTokenId - Primary token ID (usually '.')
 * @param options - Selection options
 * @returns Selection result with selected UTXOs
 */
export function selectUtxos(
  requiredAmounts: Balance.Amounts,
  availableUtxos: ModernUtxo[],
  strategy: SelectionStrategy = 'largestFirst',
  primaryTokenId: TokenId = defaultPrimaryTokenId,
  options: SelectionOptions = {},
): SelectionResult {
  switch (strategy) {
    case 'largestFirst':
      return largestFirst(
        requiredAmounts,
        availableUtxos,
        primaryTokenId,
        options,
      )
    case 'keepRelevant':
      return keepRelevant(
        requiredAmounts,
        availableUtxos,
        primaryTokenId,
        options,
      )
    case 'largestFirstMultiAsset':
      return largestFirstMultiAsset(
        requiredAmounts,
        availableUtxos,
        primaryTokenId,
        options,
      )
    default:
      return largestFirst(
        requiredAmounts,
        availableUtxos,
        primaryTokenId,
        options,
      )
  }
}
