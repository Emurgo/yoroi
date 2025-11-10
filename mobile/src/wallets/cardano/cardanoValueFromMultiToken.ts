import {WasmModuleProxy} from '@emurgo/cross-csl-core'

import {MultiToken} from './MultiToken'
import {identifierToCardanoAsset} from './assetHelpers'

export const cardanoValueFromMultiToken = (
  tokens: MultiToken,
  csl: WasmModuleProxy,
) => {
  const value = csl.Value.new(
    csl.BigNum.fromStr(tokens.getDefaultEntry().amount.toString()),
  )
  if (tokens.size() === 1) return value
  const assets = csl.MultiAsset.new()

  for (const entry of tokens.nonDefaultEntries()) {
    const {policyId, name} = identifierToCardanoAsset(entry.identifier)
    const asset = assets.get(policyId)
    const policyContent = asset?.hasValue() ? asset : csl.Assets.new()

    policyContent.insert(name, csl.BigNum.fromStr(entry.amount.toString()))
    assets.insert(policyId, policyContent)
  }

  if (assets.len() > 0) {
    value.setMultiasset(assets)
  }

  return value
}
