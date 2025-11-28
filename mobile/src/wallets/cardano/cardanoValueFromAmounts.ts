import {toAssetNameHex} from '@yoroi/api'
import {Balance} from '@yoroi/types'

import {WasmModuleProxy} from '@emurgo/cross-csl-core'
import {Buffer} from 'buffer'

export const cardanoValueFromAmounts = (
  csl: WasmModuleProxy,
  amounts: Balance.Amounts,
  primaryTokenId: string,
) => {
  const adaAmount = amounts[primaryTokenId] || '0'
  const adaBigNum = csl.BigNum.fromStr(adaAmount)
  if (!adaBigNum) {
    throw new Error(
      `cardanoValueFromAmounts: Failed to create BigNum from ADA amount: ${adaAmount}`,
    )
  }

  const value = csl.Value.new(adaBigNum)
  if (!value) {
    throw new Error(
      `cardanoValueFromAmounts: Failed to create Value from ADA amount: ${adaAmount}`,
    )
  }

  // Get all asset IDs except primary token
  const assetIds = Object.keys(amounts).filter((id) => id !== primaryTokenId)

  if (assetIds.length === 0) return value

  const multiAsset = csl.MultiAsset.new()
  if (!multiAsset) {
    throw new Error('cardanoValueFromAmounts: Failed to create MultiAsset')
  }

  // Group assets by policy ID
  const groupedByPolicyId = assetIds.reduce(
    (acc, assetId) => {
      const policyId = assetId.substring(0, 56) // Policy ID is first 56 hex chars
      acc[policyId] = acc[policyId] ?? []
      acc[policyId]!.push(assetId)
      return acc
    },
    {} as Record<string, Array<string>>,
  )

  // Create MultiAsset structure
  for (const policyIdStr of Object.keys(groupedByPolicyId)) {
    const assetGroup = groupedByPolicyId[policyIdStr]
    if (!assetGroup || assetGroup.length === 0) continue

    // Create ScriptHash using the csl instance (not CardanoMobile)
    const policyId = csl.ScriptHash.fromBytes(
      new Uint8Array(Buffer.from(policyIdStr, 'hex')),
    )
    if (!policyId) {
      throw new Error(
        `cardanoValueFromAmounts: Failed to create ScriptHash from policy ID: ${policyIdStr}`,
      )
    }

    const assets = csl.Assets.new()
    if (!assets) {
      throw new Error(
        `cardanoValueFromAmounts: Failed to create Assets for policy: ${policyIdStr}`,
      )
    }

    for (const assetId of assetGroup) {
      if (!assetId) continue
      try {
        const assetNameHex = toAssetNameHex(assetId)
        const name = csl.AssetName.new(
          new Uint8Array(Buffer.from(assetNameHex, 'hex')),
        )
        if (!name) {
          throw new Error(
            `cardanoValueFromAmounts: Failed to create AssetName for: ${assetId}`,
          )
        }

        const amountStr = amounts[assetId] ?? '0'
        const amount = csl.BigNum.fromStr(amountStr)
        if (!amount) {
          throw new Error(
            `cardanoValueFromAmounts: Failed to create BigNum from amount: ${amountStr} for asset: ${assetId}`,
          )
        }

        assets.insert(name, amount)
      } catch (error) {
        throw new Error(
          `cardanoValueFromAmounts: Error processing asset ${assetId}: ${error instanceof Error ? error.message : String(error)}`,
        )
      }
    }

    multiAsset.insert(policyId, assets)
  }

  if (multiAsset.len() > 0) {
    value.setMultiasset(multiAsset)
  }

  return value
}
