import {Branded, Portfolio} from '@yoroi/types'

import {primaryTokenId} from '../constants'

/**
 * Normalizes a token identifier string to a valid Portfolio.Token.Id
 * Handles legacy PT token IDs (primaryTokenId, '', '.') by returning primaryTokenId
 * For other identifiers, uses Branded.asPortfolioTokenId to convert
 *
 * @param identifier - The token identifier string to normalize
 * @returns A valid Portfolio.Token.Id
 */
export function normalizeTokenId(identifier: string): Portfolio.Token.Id {
  if (
    identifier === primaryTokenId ||
    identifier === '' ||
    identifier === '.'
  ) {
    return primaryTokenId as Portfolio.Token.Id
  }
  return Branded.asPortfolioTokenId(identifier) as Portfolio.Token.Id
}
