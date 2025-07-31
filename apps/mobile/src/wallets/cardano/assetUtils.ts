import {CardanoMobile} from '../wallets'
import {toAssetNameHex, toPolicyId} from './api/utils'
import {CardanoTypes} from './types'

/**
 * Multi-asset related
 */
export const identifierToCardanoAsset = (
  tokenId: string,
): {
  policyId: CardanoTypes.ScriptHash
  name: CardanoTypes.AssetName
} => {
  const policyId = toPolicyId(tokenId)
  const assetNameHex = toAssetNameHex(tokenId)

  return {
    policyId: CardanoMobile.ScriptHash.fromBytes(Buffer.from(policyId, 'hex')),
    name: CardanoMobile.AssetName.new(Buffer.from(assetNameHex, 'hex')),
  }
}
