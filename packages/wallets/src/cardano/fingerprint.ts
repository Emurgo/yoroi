import AssetFingerprint from '@emurgo/cip14-js'
import {Balance} from '@yoroi/types'

/**
 * Calculates the fingerprint of a given token id, CIP14
 * @param {Balance.Token['info']['id']} tokenId - The token ID.
 * @returns {string} The fingerprint string.
 * @throws Error if the policy ID is invalid.
 */
export const asFingerprint = (
  tokenId: Balance.Token['info']['id'],
): Readonly<string> => {
  const [policyId, assetNameHex] = tokenId.split('.')

  if (!policyId || policyId.length !== 56) throw new Error('Invalid policyId')

  const assetFingerprint = AssetFingerprint.fromParts(
    Buffer.from(policyId, 'hex'),
    Buffer.from(assetNameHex ?? '', 'hex'),
  )

  return assetFingerprint.fingerprint()
}
