import {primaryTokenId as defaultPrimaryTokenId} from '@yoroi/portfolio'
import {Balance, TokenId} from '@yoroi/types'

import {BigNumber} from 'bignumber.js'

import {ModernUtxo} from '../utxo/models'

/**
 * Sum amounts from multiple Balance.Amounts objects
 */
export function sumAmounts(amounts: Balance.Amounts[]): Balance.Amounts {
  const result: Balance.Amounts = {} as Balance.Amounts

  for (const amount of amounts) {
    for (const [tokenId, quantity] of Object.entries(amount)) {
      const current = result[tokenId as TokenId] || '0'
      result[tokenId as TokenId] = new BigNumber(current)
        .plus(quantity)
        .toString() as Balance.Quantity
    }
  }

  return result
}

/**
 * Subtract amounts2 from amounts1
 */
export function subtractAmounts(
  amounts1: Balance.Amounts,
  amounts2: Balance.Amounts,
): Balance.Amounts {
  const result: Balance.Amounts = {} as Balance.Amounts

  // Copy amounts1
  for (const [tokenId, quantity] of Object.entries(amounts1)) {
    result[tokenId as TokenId] = quantity
  }

  // Subtract amounts2
  for (const [tokenId, quantity] of Object.entries(amounts2)) {
    const current = result[tokenId as TokenId] || '0'
    const diff = new BigNumber(current).minus(quantity)
    if (diff.isLessThanOrEqualTo(0)) {
      delete result[tokenId as TokenId]
    } else {
      result[tokenId as TokenId] = diff.toString() as Balance.Quantity
    }
  }

  return result
}

/**
 * Check if amounts1 has at least the amounts in amounts2
 */
export function hasEnoughAmounts(
  amounts1: Balance.Amounts,
  amounts2: Balance.Amounts,
): boolean {
  for (const [tokenId, requiredQuantity] of Object.entries(amounts2)) {
    const available = amounts1[tokenId as TokenId] || '0'
    if (new BigNumber(available).isLessThan(requiredQuantity)) {
      return false
    }
  }
  return true
}

/**
 * Get total ADA amount from Balance.Amounts
 */
export function getAdaAmount(
  amounts: Balance.Amounts,
  primaryTokenId: TokenId = defaultPrimaryTokenId,
): BigNumber {
  return new BigNumber(amounts[primaryTokenId] || '0')
}

/**
 * Get total value of UTXO in ADA (for sorting)
 */
export function getUtxoValue(
  utxo: ModernUtxo,
  primaryTokenId: TokenId = defaultPrimaryTokenId,
): BigNumber {
  return getAdaAmount(utxo.balance, primaryTokenId)
}

/**
 * Check if UTXO contains any of the required assets
 */
export function utxoHasRelevantAssets(
  utxo: ModernUtxo,
  requiredAmounts: Balance.Amounts,
): boolean {
  for (const tokenId of Object.keys(requiredAmounts)) {
    if (utxo.balance[tokenId as TokenId]) {
      return true
    }
  }
  return false
}

/**
 * Get all token IDs from amounts
 */
export function getTokenIds(amounts: Balance.Amounts): string[] {
  return Object.keys(amounts).filter((id) => id !== '')
}
