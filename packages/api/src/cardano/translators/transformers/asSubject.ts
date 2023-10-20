import {Balance} from '@yoroi/types'

/**
 * Concatenates the policyId and assetName from a given token ID by removing the separating dot.
 *
 * @param {Balance.TokenInfo['id']} tokenId - The token ID string containing policyId and assetName separated by a dot.
 * @returns {string} A new string formed by removing the separating dot from the tokenId.
 */
export function asSubject(tokenId: Balance.TokenInfo['id']): string {
  return tokenId.replace('.', '')
}
