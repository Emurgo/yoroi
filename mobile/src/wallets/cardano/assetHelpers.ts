import {toAssetNameHex, toPolicyId} from '@yoroi/api'

import {WasmModuleProxy} from '@emurgo/cross-csl-core'
import {Buffer} from 'buffer'

import {CardanoTypes} from './types'

/**
 * Multi-asset related helper functions
 * Extracted to avoid circular dependencies
 *
 * NOTE: This function must use the same csl instance as the caller to avoid
 * NULL pointer errors. All CSL objects must be created from the same instance.
 */
export const identifierToCardanoAsset = (
  csl: WasmModuleProxy,
  tokenId: string,
): {
  policyId: CardanoTypes.ScriptHash
  name: CardanoTypes.AssetName
} => {
  const policyId = toPolicyId(tokenId)
  const assetNameHex = toAssetNameHex(tokenId)

  const policyIdObj = csl.ScriptHash.fromBytes(
    new Uint8Array(Buffer.from(policyId, 'hex')),
  )
  if (!policyIdObj) {
    throw new Error(
      `identifierToCardanoAsset: Failed to create ScriptHash from policy ID: ${policyId}`,
    )
  }

  const nameObj = csl.AssetName.new(
    new Uint8Array(Buffer.from(assetNameHex, 'hex')),
  )
  if (!nameObj) {
    throw new Error(
      `identifierToCardanoAsset: Failed to create AssetName from hex: ${assetNameHex}`,
    )
  }

  return {
    policyId: policyIdObj,
    name: nameObj,
  }
}
