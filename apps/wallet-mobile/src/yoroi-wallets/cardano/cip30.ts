import {Buffer} from 'buffer'
import _ from 'lodash'

import {RawUtxo} from '../types'
import {Utxos} from '../utils'
import {CardanoMobile} from '../wallets'
import {identifierToCardanoAsset} from './utils'

export const getBalance = async (tokenId = '*', utxos: RawUtxo[], primaryTokenId: string) => {
  if (tokenId === '*') tokenId = '.'
  const amounts = Utxos.toAmounts(utxos, primaryTokenId)
  const value = await CardanoMobile.Value.new(await CardanoMobile.BigNum.fromStr(amounts[primaryTokenId]))
  const normalizedInHex = await Promise.all(
    Object.keys(amounts).map(async (tokenId) => {
      if (tokenId === '.' || tokenId === '' || tokenId === primaryTokenId) return null
      const {policyId, name} = await identifierToCardanoAsset(tokenId)
      const amount = amounts[tokenId]
      return {policyIdHex: await policyId.toHex(), nameHex: await name.toHex(), amount}
    }),
  )

  const groupedByPolicyId = _.groupBy(normalizedInHex.filter(Boolean), 'policyIdHex')

  const multiAsset = await CardanoMobile.MultiAsset.new()
  for (const policyIdHex of Object.keys(groupedByPolicyId)) {
    const assetValue = groupedByPolicyId[policyIdHex]
    if (!assetValue) continue
    const policyId = await CardanoMobile.ScriptHash.fromHex(policyIdHex)
    const assets = await CardanoMobile.Assets.new()
    for (const asset of assetValue) {
      if (!asset) continue
      const assetName = await CardanoMobile.AssetName.fromHex(asset.nameHex)
      const assetValue = await CardanoMobile.BigNum.fromStr(asset.amount)
      await assets.insert(assetName, assetValue)
    }
    await multiAsset.insert(policyId, assets)
  }
  await value.setMultiasset(multiAsset)

  return Buffer.from(await value.toBytes()).toString('hex')
}
