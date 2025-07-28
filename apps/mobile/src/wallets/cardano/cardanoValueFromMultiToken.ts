import {CardanoMobile} from '../wallets'
import {MultiToken} from './MultiToken'
import {identifierToCardanoAsset} from './utils'

export const cardanoValueFromMultiToken = (tokens: MultiToken) => {
  const value = CardanoMobile.Value.new(
    CardanoMobile.BigNum.fromStr(tokens.getDefaultEntry().amount.toString()),
  )
  // recall: primary asset counts towards size
  if (tokens.size() === 1) return value
  const assets = CardanoMobile.MultiAsset.new()

  for (const entry of tokens.nonDefaultEntries()) {
    const {policyId, name} = identifierToCardanoAsset(entry.identifier)
    const asset = assets.get(policyId)
    const policyContent = asset?.hasValue() ? asset : CardanoMobile.Assets.new()

    policyContent.insert(
      name,
      CardanoMobile.BigNum.fromStr(entry.amount.toString()),
    )
    // recall: we always have to insert since WASM returns copies of objects
    assets.insert(policyId, policyContent)
  }

  if (assets.len() > 0) {
    value.setMultiasset(assets)
  }

  return value
}
