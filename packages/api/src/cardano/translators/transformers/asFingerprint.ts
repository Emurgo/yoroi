import AssetFingerprint from '@emurgo/cip14-js'
import {Balance} from '@yoroi/types'
import {getTokenIdentity} from '../helpers/getTokenIdentity'

/**
 * Calculates the fingerprint of a given token ID based on the Cardano CIP14 standard.
 *
 * The function first calls `getTokenIdentity` to extract the `policyId` and `assetName`
 * from the provided `tokenId`. It then generates the asset fingerprint based on these values.
 *
 * @param {Balance.TokenInfo['id']} tokenId - The token ID used to generate the fingerprint.
 * @returns {Readonly<string>} The calculated fingerprint string.
 * @throws {Error} Throws an error if the policy ID extracted from `tokenId` is invalid or has incorrect length.
 */
export function asFingerprint(tokenId: Balance.TokenInfo['id']): string {
  const {policyId, assetName} = getTokenIdentity(tokenId)

  const assetFingerprint = AssetFingerprint.fromParts(
    Buffer.from(policyId, 'hex'),
    Buffer.from(assetName, 'hex'),
  )

  return assetFingerprint.fingerprint()
}
