import * as CSL from '@emurgo/cross-csl-core'
import {RemoteUnspentOutput, UtxoAsset} from '@emurgo/yoroi-lib'
import {Buffer} from 'buffer'
import _ from 'lodash'

import {RawUtxo} from '../types'
import {Utxos} from '../utils'
import {CardanoMobile} from '../wallets'
import {toAssetNameHex, toPolicyId} from './api'
import {identifierToCardanoAsset} from './utils'

export async function assetToRustMultiasset(remoteAssets: UtxoAsset[]): Promise<CSL.MultiAsset> {
  const groupedAssets = remoteAssets.reduce((res, a) => {
    ;(res[toPolicyId(a.assetId)] = res[toPolicyId(a.assetId)] || []).push(a)
    return res
  }, {} as Record<string, UtxoAsset[]>)
  const multiasset = await CardanoMobile.MultiAsset.new()
  for (const policyHex of Object.keys(groupedAssets)) {
    const assetGroup = groupedAssets[policyHex]
    const policyId = await CardanoMobile.ScriptHash.fromBytes(Buffer.from(policyHex, 'hex'))
    const assets = await CardanoMobile.Assets.new()
    for (const asset of assetGroup) {
      await assets.insert(
        await CardanoMobile.AssetName.new(Buffer.from(toAssetNameHex(asset.assetId), 'hex')),
        await CardanoMobile.BigNum.fromStr(asset.amount),
      )
    }
    await multiasset.insert(policyId, assets)
  }
  return multiasset
}
export async function cardanoUtxoFromRemoteFormat(u: RemoteUnspentOutput): Promise<CSL.TransactionUnspentOutput> {
  const input = await CardanoMobile.TransactionInput.new(
    await CardanoMobile.TransactionHash.fromHex(u.txHash),
    u.txIndex,
  )
  const value = await CardanoMobile.Value.new(await CardanoMobile.BigNum.fromStr(u.amount))
  if ((u.assets || []).length > 0) {
    await value.setMultiasset(await assetToRustMultiasset([...u.assets]))
  }
  const output = await CardanoMobile.TransactionOutput.new(await CardanoMobile.Address.fromHex(u.receiver), value)
  return CardanoMobile.TransactionUnspentOutput.new(input, output)
}

export const getBalance = async (tokenId = '*', utxos: RawUtxo[], primaryTokenId: string) => {
  if (tokenId === 'TADA' || tokenId === 'ADA') tokenId = '.'
  const amounts = Utxos.toAmounts(utxos, primaryTokenId)
  const value = await CardanoMobile.Value.new(await CardanoMobile.BigNum.fromStr(amounts[primaryTokenId]))
  const normalizedInHex = await Promise.all(
    Object.keys(amounts)
      .filter((t) => {
        if (tokenId === '*') return true
        return t === tokenId
      })
      .map(async (tokenId) => {
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
