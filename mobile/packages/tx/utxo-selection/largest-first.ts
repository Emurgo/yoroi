import {primaryTokenId as defaultPrimaryTokenId} from '@yoroi/portfolio'
import {Balance, TokenId} from '@yoroi/types'

import {ModernUtxo} from '../utxo/models'
import type {SelectionOptions, SelectionResult} from './types'
import {
  getUtxoValue,
  hasEnoughAmounts,
  subtractAmounts,
  sumAmounts,
} from './utils'

/**
 * Largest First coin selection algorithm (CIP-2 compliant)
 *
 * Selects UTXOs starting with the largest ADA value until requirements are met.
 * This minimizes the number of UTXOs used.
 *
 * @param requiredAmounts - Required amounts to satisfy
 * @param availableUtxos - Available UTXOs to select from
 * @param primaryTokenId - Primary token ID (usually '.')
 * @param options - Selection options
 * @returns Selection result with selected UTXOs and remaining requirements
 */
export function largestFirst(
  requiredAmounts: Balance.Amounts,
  availableUtxos: ModernUtxo[],
  primaryTokenId: TokenId = defaultPrimaryTokenId,
  options: SelectionOptions = {},
): SelectionResult {
  // Sort UTXOs by ADA value (largest first)
  const sortedUtxos = [...availableUtxos].sort((a, b) => {
    const valueA = getUtxoValue(a, primaryTokenId)
    const valueB = getUtxoValue(b, primaryTokenId)
    return valueB.comparedTo(valueA) ?? 0 // Descending order, default to 0 if null
  })

  const selected: ModernUtxo[] = []
  const remaining = [...sortedUtxos]
  let selectedAmounts: Balance.Amounts = {} as Balance.Amounts

  // Select UTXOs until we have enough
  for (const utxo of sortedUtxos) {
    if (options.maxUtxos && selected.length >= options.maxUtxos) {
      break
    }

    selected.push(utxo)
    remaining.splice(remaining.indexOf(utxo), 1)
    selectedAmounts = sumAmounts([selectedAmounts, utxo.balance])

    // Check if we have enough
    if (hasEnoughAmounts(selectedAmounts, requiredAmounts)) {
      break
    }
  }

  // Calculate missing amounts
  const missingAmounts = subtractAmounts(requiredAmounts, selectedAmounts)

  return {
    selected,
    remaining,
    selectedAmounts,
    missingAmounts,
  }
}
