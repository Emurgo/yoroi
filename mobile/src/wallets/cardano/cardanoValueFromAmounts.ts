import {Balance} from '@yoroi/types'

import {WasmModuleProxy} from '@emurgo/cross-csl-core'

import {identifierToCardanoAsset} from './assetHelpers'

export const cardanoValueFromAmounts = (
  amounts: Balance.Amounts,
  primaryTokenId: string,
  csl: WasmModuleProxy,
) => {
  const adaAmount = amounts[primaryTokenId] || '0'
  const value = csl.Value.new(csl.BigNum.fromStr(adaAmount))

  // Get all asset IDs except primary token
  const assetIds = Object.keys(amounts).filter((id) => id !== primaryTokenId)

  if (assetIds.length === 0) return value

  const multiAsset = csl.MultiAsset.new()

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
    if (!assetGroup) continue

    // Get policyId from first asset in group (all have same policy)
    const firstAssetId = assetGroup[0]!
    const {policyId} = identifierToCardanoAsset(firstAssetId)
    const assets = csl.Assets.new()

    for (const assetId of assetGroup) {
      const {name} = identifierToCardanoAsset(assetId)
      const amount = csl.BigNum.fromStr(amounts[assetId] ?? '0')
      assets.insert(name, amount)
    }

    multiAsset.insert(policyId, assets)
  }

  if (multiAsset.len() > 0) {
    value.setMultiasset(multiAsset)
  }

  return value
}
