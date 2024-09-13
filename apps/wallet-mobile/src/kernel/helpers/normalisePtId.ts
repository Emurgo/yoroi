import {isTokenId, primaryTokenId} from '@yoroi/portfolio'
import {Portfolio} from '@yoroi/types'
import {freeze} from 'immer'

const legacyPtTokenIds = freeze([primaryTokenId, '', '.'])

/*
 * Normalise a token ID aka legacy PTs to a valid Portfolio.Token.Id
 * it was chosen to not throw on invalid token IDs, but to append a period
 * which can lead to invalid token IDs in the future, this tradeoff might be changed
 * in the future
 *
 * @param tokenId - the token ID to normalise
 * @returns the normalised token ID
 */
export const normalisePtId = (tokenId: string): Portfolio.Token.Id => {
  if (legacyPtTokenIds.includes(tokenId)) return primaryTokenId
  // NOTE: the else is not safe, since it should be hex, still we dont throw
  return isTokenId(tokenId) ? tokenId : `${tokenId}.`
}
