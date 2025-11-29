import {primaryTokenId as defaultPrimaryTokenId} from '@yoroi/portfolio'
import {Balance, TokenId} from '@yoroi/types'

import {ModernUtxo} from '../utxo/models'
import type {SelectionOptions, SelectionResult} from './types'
import {
  getUtxoValue,
  hasEnoughAmounts,
  subtractAmounts,
  sumAmounts,
  utxoHasRelevantAssets,
} from './utils'

/**
 * Largest First Multi-Asset coin selection algorithm
 *
 * Variant of largest first that prioritizes UTXOs containing required assets,
 * then uses largest first for remaining requirements.
 *
 * @param requiredAmounts - Required amounts to satisfy
 * @param availableUtxos - Available UTXOs to select from
 * @param primaryTokenId - Primary token ID (usually '.')
 * @param options - Selection options
 * @returns Selection result with selected UTXOs and remaining requirements
 */
export function largestFirstMultiAsset(
  requiredAmounts: Balance.Amounts,
  availableUtxos: ModernUtxo[],
  primaryTokenId: TokenId = defaultPrimaryTokenId,
  options: SelectionOptions = {},
): SelectionResult {
  const selected: ModernUtxo[] = []
  const remaining = [...availableUtxos]
  let selectedAmounts: Balance.Amounts = {} as Balance.Amounts

  // Get non-ADA token IDs
  const requiredTokenIds = Object.keys(requiredAmounts).filter(
    (id) => id !== primaryTokenId,
  )

  // Step 1: Prioritize UTXOs with required assets, sorted by total value
  if (requiredTokenIds.length > 0) {
    const relevantUtxos = availableUtxos
      .filter((utxo) => utxoHasRelevantAssets(utxo, requiredAmounts))
      .sort((a, b) => {
        const valueA = getUtxoValue(a, primaryTokenId)
        const valueB = getUtxoValue(b, primaryTokenId)
        return valueB.comparedTo(valueA) ?? 0 // Descending order, default to 0 if null
      })

    for (const utxo of relevantUtxos) {
      if (options.maxUtxos && selected.length >= options.maxUtxos) {
        break
      }

      if (hasEnoughAmounts(selectedAmounts, requiredAmounts)) {
        break
      }

      selected.push(utxo)
      remaining.splice(remaining.indexOf(utxo), 1)
      selectedAmounts = sumAmounts([selectedAmounts, utxo.balance])
    }
  }

  // Step 2: Fill remaining requirements with largest first
  if (!hasEnoughAmounts(selectedAmounts, requiredAmounts)) {
    const sortedRemaining = [...remaining].sort((a, b) => {
      const valueA = getUtxoValue(a, primaryTokenId)
      const valueB = getUtxoValue(b, primaryTokenId)
      return valueB.comparedTo(valueA) ?? 0 // Descending order, default to 0 if null
    })

    for (const utxo of sortedRemaining) {
      if (options.maxUtxos && selected.length >= options.maxUtxos) {
        break
      }

      if (hasEnoughAmounts(selectedAmounts, requiredAmounts)) {
        break
      }

      selected.push(utxo)
      remaining.splice(remaining.indexOf(utxo), 1)
      selectedAmounts = sumAmounts([selectedAmounts, utxo.balance])
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
