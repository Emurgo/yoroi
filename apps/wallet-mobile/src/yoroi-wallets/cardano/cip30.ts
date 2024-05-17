import * as CSL from '@emurgo/cross-csl-core'
import {RemoteUnspentOutput, signRawTransaction, UtxoAsset} from '@emurgo/yoroi-lib'
import {parseTokenList} from '@emurgo/yoroi-lib/dist/internals/utils/assets'
import {Balance} from '@yoroi/types'
import {BalanceAmounts} from '@yoroi/types/src/balance/token'
import {BigNumber} from 'bignumber.js'
import {Buffer} from 'buffer'
import _ from 'lodash'

import {RawUtxo, YoroiUnsignedTx} from '../types'
import {asQuantity, Utxos} from '../utils'
import {Cardano, CardanoMobile} from '../wallets'
import {toAssetNameHex, toPolicyId} from './api'
import {getTransactionSigners} from './common/signatureUtils'
import {Pagination, YoroiWallet} from './types'
import {createRawTxSigningKey, identifierToCardanoAsset} from './utils'
import {collateralConfig, findCollateralCandidates, utxosMaker} from './utxoManager/utxos'
import {normalizeToAddress} from '@emurgo/yoroi-lib/dist/internals/utils/addresses'

const remoteAssetToMultiasset = async (remoteAssets: UtxoAsset[]): Promise<CSL.MultiAsset> => {
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
const cardanoUtxoFromRemoteFormat = async (u: RemoteUnspentOutput): Promise<CSL.TransactionUnspentOutput> => {
  const input = await CardanoMobile.TransactionInput.new(
    await CardanoMobile.TransactionHash.fromHex(u.txHash),
    u.txIndex,
  )
  const value = await CardanoMobile.Value.new(await CardanoMobile.BigNum.fromStr(u.amount))
  if ((u.assets || []).length > 0) {
    await value.setMultiasset(await remoteAssetToMultiasset([...u.assets]))
  }
  const receiver = await CardanoMobile.Address.fromBech32(u.receiver)
  if (!receiver) throw new Error('Invalid receiver')
  const output = await CardanoMobile.TransactionOutput.new(receiver, value)
  return CardanoMobile.TransactionUnspentOutput.new(input, output)
}

const _getBalance = async (tokenId = '*', utxos: RawUtxo[], primaryTokenId: string) => {
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
  return value
}

export const getBalance = async (wallet: YoroiWallet, tokenId = '*') => {
  return _getBalance(tokenId, wallet.utxos, wallet.primaryTokenInfo.id)
}

export const submitTx = async (wallet: YoroiWallet, cbor: string) => {
  const base64 = Buffer.from(cbor, 'hex').toString('base64')
  const txId = await Cardano.calculateTxId(base64, 'base64')
  await wallet.submitTransaction(base64)
  return txId
}

export const signTx = async (wallet: YoroiWallet, rootKey: string, cbor: string, partial = false) => {
  const signers = await getTransactionSigners(cbor, wallet, partial)
  const keys = await Promise.all(signers.map(async (signer) => createRawTxSigningKey(rootKey, signer)))
  const signedTxBytes = await signRawTransaction(CardanoMobile, cbor, keys)
  const signedTx = await CardanoMobile.Transaction.fromBytes(signedTxBytes)
  return signedTx.witnessSet()
}

export const getCollateral = async (wallet: YoroiWallet, value?: string) => {
  const valueStr = value?.trim() ?? collateralConfig.minLovelace.toString()
  const valueNum = new BigNumber(valueStr)

  if (valueNum.gte(collateralConfig.maxLovelace)) {
    throw new Error('Collateral value is too high')
  }

  const currentCollateral = wallet.getCollateralInfo()
  const canUseCurrentCollateral = currentCollateral.utxo && valueNum.lte(currentCollateral.utxo.amount)

  if (canUseCurrentCollateral && currentCollateral.utxo) {
    const utxo = await cardanoUtxoFromRemoteFormat(rawUtxoToRemoteUnspentOutput(currentCollateral.utxo))
    return [utxo]
  }

  const oneUtxoCollateral = await _drawCollateralInOneUtxo(wallet, asQuantity(valueNum))
  if (oneUtxoCollateral) {
    return [oneUtxoCollateral]
  }

  const multipleUtxosCollateral = await _drawCollateralInMultipleUtxos(wallet, asQuantity(valueNum))
  if (multipleUtxosCollateral && multipleUtxosCollateral.length > 0) {
    return multipleUtxosCollateral
  }

  return null
}

export const getUtxos = async (wallet: YoroiWallet, value?: string, pagination?: Pagination) => {
  const valueStr = value?.trim() ?? ''

  if (valueStr.length === 0) {
    const validUtxos = await Promise.all(
      wallet.utxos.map((o) => cardanoUtxoFromRemoteFormat(rawUtxoToRemoteUnspentOutput(o))),
    )
    return paginate(validUtxos, pagination)
  }

  const amounts: BalanceAmounts = {}

  const isValueNumber = !isNaN(Number(valueStr))

  if (isValueNumber) {
    amounts[wallet.primaryTokenInfo.id] = asQuantity(valueStr)
  } else {
    try {
      Object.assign(amounts, getAmountsFromValue(valueStr, wallet.primaryTokenInfo.id))
    } catch (e) {
      //
    }
  }

  const validUtxos = await _getRequiredUtxos(wallet, amounts, wallet.utxos)
  if (validUtxos === null) return null
  return paginate(validUtxos, pagination)
}

export const getRewardAddress = async (wallet: YoroiWallet) => {
  const address = await CardanoMobile.Address.fromHex(wallet.rewardAddressHex)
  return [address]
}

export const getUsedAddresses = async (wallet: YoroiWallet, pagination?: Pagination) => {
  const allAddresses = wallet.externalAddresses
  const selectedAddresses = paginate(allAddresses, pagination)
  return Promise.all(selectedAddresses.map((addr) => Cardano.Wasm.Address.fromBech32(addr)))
}

export const getUnusedAddresses = async (wallet: YoroiWallet) => {
  const bech32Addresses = wallet.receiveAddresses.filter((address) => !wallet.isUsedAddressIndex[address])
  return Promise.all(bech32Addresses.map((addr) => Cardano.Wasm.Address.fromBech32(addr)))
}

export const signData = async (
  _wallet: YoroiWallet,
  _rootKey: string,
  address: string,
  _payload: string,
): Promise<{key: string; signature: string}> => {
  const normalisedAddress = await normalizeToAddress(CardanoMobile, address)
  const bech32Address = await normalisedAddress?.toBech32(undefined)
  if (!bech32Address) throw new Error('Invalid wallet state')

  throw new Error('Not implemented')
}

const _getRequiredUtxos = async (
  wallet: YoroiWallet,
  amounts: Balance.Amounts,
  allUtxos: RawUtxo[],
): Promise<CSL.TransactionUnspentOutput[] | null> => {
  const remoteUnspentOutputs: RemoteUnspentOutput[] = allUtxos.map((utxo) => rawUtxoToRemoteUnspentOutput(utxo))
  const rewardAddress = await (await normalizeToAddress(CardanoMobile, wallet.rewardAddressHex))?.toBech32(undefined)
  if (!rewardAddress) throw new Error('Invalid wallet state')

  try {
    const unsignedTx = await wallet.createUnsignedTx([{address: rewardAddress, amounts}])
    const requiredUtxos = await findUtxosInUnsignedTx(unsignedTx, remoteUnspentOutputs)
    return Promise.all(requiredUtxos.map((o) => cardanoUtxoFromRemoteFormat(o)))
  } catch (e) {
    return null
  }
}

const rawUtxoToRemoteUnspentOutput = (utxo: RawUtxo): RemoteUnspentOutput => {
  return {
    txHash: utxo.tx_hash,
    txIndex: utxo.tx_index,
    receiver: utxo.receiver,
    amount: utxo.amount,
    assets: utxo.assets,
    utxoId: utxo.utxo_id,
  }
}

const findUtxosInUnsignedTx = async (unsignedTx: YoroiUnsignedTx, utxos: RemoteUnspentOutput[]) => {
  const inputs = await unsignedTx.unsignedTx.txBody.inputs()
  const filteredUtxos: RemoteUnspentOutput[] = []
  for (let i = 0; i < (await inputs.len()); i++) {
    const input = await inputs.get(i)
    const inputTxHash = await (await input.transactionId()).toHex()
    const inputIndex = await input.index()
    const utxo = utxos.find((utxo) => utxo.txHash === inputTxHash && utxo.txIndex === inputIndex)
    if (utxo) filteredUtxos.push(utxo)
  }
  return filteredUtxos
}

const paginate = <T>(items: T[], pagination?: {page: number; limit: number}) => {
  return pagination ? items.slice(pagination.page * pagination.limit, (pagination.page + 1) * pagination.limit) : items
}

const _drawCollateralInOneUtxo = async (wallet: YoroiWallet, quantity: Balance.Quantity) => {
  const utxos = utxosMaker(wallet.utxos, {
    maxLovelace: collateralConfig.maxLovelace,
    minLovelace: quantity,
  })

  const possibleCollateralId = utxos.drawnCollateral()
  if (!possibleCollateralId) return null
  const collateralUtxo = utxos.findById(possibleCollateralId)
  if (!collateralUtxo) return null
  return cardanoUtxoFromRemoteFormat(rawUtxoToRemoteUnspentOutput(collateralUtxo))
}

const _drawCollateralInMultipleUtxos = async (wallet: YoroiWallet, quantity: Balance.Quantity) => {
  const possibleUtxos = findCollateralCandidates(wallet.utxos, {
    maxLovelace: collateralConfig.maxLovelace,
    minLovelace: asQuantity('0'),
  })

  const utxos = await _getRequiredUtxos(wallet, {[wallet.primaryTokenInfo.id]: quantity}, possibleUtxos)

  if (utxos !== null && utxos.length > 0) {
    return utxos
  }
  return null
}

const getAmountsFromValue = async (value: string, primaryTokenId: string) => {
  const valueFromHex = await CardanoMobile.Value.fromHex(value)
  const amounts: BalanceAmounts = {}

  if (valueFromHex.hasValue()) {
    amounts[primaryTokenId] = asQuantity(await (await valueFromHex.coin()).toStr())
  }
  const ma = await valueFromHex.multiasset()
  if (ma) {
    for (const token of await parseTokenList(ma)) {
      const {assetId, amount} = token
      amounts[assetId] = asQuantity(amount)
    }
  }
  return amounts
}
