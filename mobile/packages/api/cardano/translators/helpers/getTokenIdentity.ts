import {Balance} from '@yoroi/types'

/**
 * Extracts the identity components of a Cardano token.
 * It parses the provided `tokenId` to extract the `policyId`,
 * `assetName`, and human-readable `name`.
 *
 * The `tokenId` is expected to follow a specific format, usually `policyId.assetName`.
 *
 * @param {Balance.TokenInfo['id']} tokenId - The tokenId string from which to extract information.
 * @returns {Readonly<{policyId: string; name: string; assetName: string}>} An immutable object containing:
 *  - `policyId`: The policy ID of the token.
 *  - `name`: The human-readable name of the asset, derived from its hex-encoded `assetName`.
 *  - `assetName`: The hex-encoded asset name from the tokenId.
 * @throws {Error} Throws an error if the policy ID extracted from `tokenId` is invalid or has incorrect length.
 */
export function getTokenIdentity(
  tokenId: Balance.TokenInfo['id'],
): Readonly<{policyId: string; name: string; assetName: string}> {
  const [policyId, assetName = ''] = tokenId.split('.')

  if (!policyId || policyId.length !== 56) throw new Error('Invalid policyId')

  const name = Buffer.from(assetName, 'hex').toString('utf8')

  return {policyId, assetName, name} as const
}
