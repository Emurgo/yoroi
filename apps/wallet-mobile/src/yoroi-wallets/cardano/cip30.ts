import * as CSL from '@emurgo/cross-csl-core'
import {RemoteUnspentOutput, signRawTransaction, UtxoAsset} from '@emurgo/yoroi-lib'
import {normalizeToAddress} from '@emurgo/yoroi-lib/dist/internals/utils/addresses'
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
import {wrappedCsl} from './wrappedCsl'
import {WasmModuleProxy} from '@emurgo/cross-csl-core'

export const cip30ExtensionMaker = (wallet: YoroiWallet) => {
  return new CIP30Extension(wallet)
}

const getCSL = () => wrappedCsl()

const recreateValue = async (value: CSL.Value) => {
  return CardanoMobile.Value.fromHex(await value.toHex())
}

const recreateAddress = async (address: CSL.Address) => {
  return CardanoMobile.Address.fromBech32(await address.toBech32(undefined))
}

const recreateMultiple = async <T>(items: T[], recreate: (item: T) => Promise<T>) => {
  return Promise.all(items.map(recreate))
}

const recreateTransactionUnspentOutput = async (utxo: CSL.TransactionUnspentOutput) => {
  return CardanoMobile.TransactionUnspentOutput.fromHex(await utxo.toHex())
}

const recreateWitnessSet = async (witnessSet: CSL.TransactionWitnessSet) => {
  return CardanoMobile.TransactionWitnessSet.fromHex(await witnessSet.toHex())
}

class CIP30Extension {
  constructor(private wallet: YoroiWallet) {}

  async getBalance(tokenId = '*'): Promise<CSL.Value> {
    const {csl, release} = getCSL()
    try {
      const value = await _getBalance(csl, tokenId, this.wallet.utxos, this.wallet.primaryTokenInfo.id)
      return recreateValue(value)
    } finally {
      release()
    }
  }

  async getUnusedAddresses(): Promise<CSL.Address[]> {
    const bech32Addresses = this.wallet.receiveAddresses.filter((address) => !this.wallet.isUsedAddressIndex[address])
    return Promise.all(bech32Addresses.map((addr) => CardanoMobile.Address.fromBech32(addr)))
  }

  getUsedAddresses(pagination?: Pagination): Promise<CSL.Address[]> {
    const allAddresses = this.wallet.externalAddresses
    const selectedAddresses = paginate(allAddresses, pagination)
    return Promise.all(selectedAddresses.map((addr) => CardanoMobile.Address.fromBech32(addr)))
  }

  getChangeAddress(): Promise<CSL.Address> {
    const changeAddr = this.wallet.getChangeAddress()
    return CardanoMobile.Address.fromBech32(changeAddr)
  }

  async getRewardAddresses(): Promise<CSL.Address[]> {
    const address = await CardanoMobile.Address.fromHex(this.wallet.rewardAddressHex)
    return [address]
  }

  async getUtxos(value?: string, pagination?: Pagination): Promise<CSL.TransactionUnspentOutput[] | null> {
    const {csl, release} = getCSL()
    try {
      const utxos = await _getUtxos(csl, this.wallet, value, pagination)
      if (utxos === null) return null
      return Promise.all(utxos.map(async (u) => CardanoMobile.TransactionUnspentOutput.fromHex(await u.toHex())))
    } finally {
      release()
    }
  }

  async getCollateral(value?: string): Promise<CSL.TransactionUnspentOutput[] | null> {
    const {csl, release} = getCSL()
    try {
      const valueStr = value?.trim() ?? collateralConfig.minLovelace.toString()
      const valueNum = new BigNumber(valueStr)

      if (valueNum.gte(collateralConfig.maxLovelace)) {
        throw new Error('Collateral value is too high')
      }

      const currentCollateral = this.wallet.getCollateralInfo()
      const canUseCurrentCollateral = currentCollateral.utxo && valueNum.lte(currentCollateral.utxo.amount)

      if (canUseCurrentCollateral && currentCollateral.utxo) {
        const utxo = await cardanoUtxoFromRemoteFormat(rawUtxoToRemoteUnspentOutput(currentCollateral.utxo))
        return [await recreateTransactionUnspentOutput(utxo)]
      }

      const oneUtxoCollateral = await _drawCollateralInOneUtxo(this.wallet, asQuantity(valueNum))
      if (oneUtxoCollateral) {
        return [await recreateTransactionUnspentOutput(oneUtxoCollateral)]
      }

      const multipleUtxosCollateral = await _drawCollateralInMultipleUtxos(csl, this.wallet, asQuantity(valueNum))
      if (multipleUtxosCollateral && multipleUtxosCollateral.length > 0) {
        return recreateMultiple(multipleUtxosCollateral, recreateTransactionUnspentOutput)
      }

      return null
    } finally {
      release()
    }
  }

  async submitTx(cbor: string): Promise<string> {
    const base64 = Buffer.from(cbor, 'hex').toString('base64')
    const txId = await Cardano.calculateTxId(base64, 'base64')
    await this.wallet.submitTransaction(base64)
    return txId
  }

  async signData(_rootKey: string, address: string, _payload: string): Promise<{signature: string; key: string}> {
    const {csl, release} = getCSL()
    try {
      const normalisedAddress = await normalizeToAddress(csl, address)
      const bech32Address = await normalisedAddress?.toBech32(undefined)
      if (!bech32Address) throw new Error('Invalid wallet state')
      throw new Error('Not implemented')
    } finally {
      release()
    }
  }

  async signTx(rootKey: string, cbor: string, partial = false): Promise<CSL.TransactionWitnessSet> {
    const {csl, release} = getCSL()
    try {
      const signers = await getTransactionSigners(cbor, this.wallet, partial)
      const keys = await Promise.all(signers.map(async (signer) => createRawTxSigningKey(rootKey, signer)))
      const signedTxBytes = await signRawTransaction(csl, cbor, keys)
      const signedTx = await csl.Transaction.fromBytes(signedTxBytes)
      return recreateWitnessSet(await signedTx.witnessSet())
    } finally {
      release()
    }
  }
}

const remoteAssetToMultiasset = async (csl: WasmModuleProxy, remoteAssets: UtxoAsset[]): Promise<CSL.MultiAsset> => {
  const groupedAssets = remoteAssets.reduce((res, a) => {
    ;(res[toPolicyId(a.assetId)] = res[toPolicyId(a.assetId)] || []).push(a)
    return res
  }, {} as Record<string, UtxoAsset[]>)
  const multiasset = await csl.MultiAsset.new()
  for (const policyHex of Object.keys(groupedAssets)) {
    const assetGroup = groupedAssets[policyHex]
    const policyId = await csl.ScriptHash.fromBytes(Buffer.from(policyHex, 'hex'))
    const assets = await csl.Assets.new()
    for (const asset of assetGroup) {
      await assets.insert(
        await csl.AssetName.new(Buffer.from(toAssetNameHex(asset.assetId), 'hex')),
        await csl.BigNum.fromStr(asset.amount),
      )
    }
    await multiasset.insert(policyId, assets)
  }
  return multiasset
}
const cardanoUtxoFromRemoteFormat = async (u: RemoteUnspentOutput): Promise<CSL.TransactionUnspentOutput> => {
  const {csl, release} = getCSL()
  try {
    const input = await csl.TransactionInput.new(await csl.TransactionHash.fromHex(u.txHash), u.txIndex)
    const value = await csl.Value.new(await csl.BigNum.fromStr(u.amount))
    if ((u.assets || []).length > 0) {
      await value.setMultiasset(await remoteAssetToMultiasset(csl, [...u.assets]))
    }
    const receiver = await csl.Address.fromBech32(u.receiver)
    if (!receiver) throw new Error('Invalid receiver')
    const output = await csl.TransactionOutput.new(receiver, value)
    return csl.TransactionUnspentOutput.new(input, output)
  } finally {
    release()
  }
}

const _getBalance = async (csl: WasmModuleProxy, tokenId = '*', utxos: RawUtxo[], primaryTokenId: string) => {
  if (tokenId === 'TADA' || tokenId === 'ADA') tokenId = '.'
  const amounts = Utxos.toAmounts(utxos, primaryTokenId)
  const value = await csl.Value.new(await csl.BigNum.fromStr(amounts[primaryTokenId]))
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

  const multiAsset = await csl.MultiAsset.new()
  for (const policyIdHex of Object.keys(groupedByPolicyId)) {
    const assetValue = groupedByPolicyId[policyIdHex]
    if (!assetValue) continue
    const policyId = await csl.ScriptHash.fromHex(policyIdHex)
    const assets = await csl.Assets.new()
    for (const asset of assetValue) {
      if (!asset) continue
      const assetName = await csl.AssetName.fromHex(asset.nameHex)
      const assetValue = await csl.BigNum.fromStr(asset.amount)
      await assets.insert(assetName, assetValue)
    }
    await multiAsset.insert(policyId, assets)
  }
  await value.setMultiasset(multiAsset)
  return value
}

export const _getUtxos = async (csl: WasmModuleProxy, wallet: YoroiWallet, value?: string, pagination?: Pagination) => {
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
      Object.assign(amounts, getAmountsFromValue(csl, valueStr, wallet.primaryTokenInfo.id))
    } catch (e) {
      //
    }
  }

  const validUtxos = await _getRequiredUtxos(csl, wallet, amounts, wallet.utxos)
  if (validUtxos === null) return null
  return paginate(validUtxos, pagination)
}

const _getRequiredUtxos = async (
  csl: WasmModuleProxy,
  wallet: YoroiWallet,
  amounts: Balance.Amounts,
  allUtxos: RawUtxo[],
): Promise<CSL.TransactionUnspentOutput[] | null> => {
  const remoteUnspentOutputs: RemoteUnspentOutput[] = allUtxos.map((utxo) => rawUtxoToRemoteUnspentOutput(utxo))
  const rewardAddress = await (await normalizeToAddress(csl, wallet.rewardAddressHex))?.toBech32(undefined)
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

const _drawCollateralInMultipleUtxos = async (
  csl: WasmModuleProxy,
  wallet: YoroiWallet,
  quantity: Balance.Quantity,
) => {
  const possibleUtxos = findCollateralCandidates(wallet.utxos, {
    maxLovelace: collateralConfig.maxLovelace,
    minLovelace: asQuantity('0'),
  })

  const utxos = await _getRequiredUtxos(csl, wallet, {[wallet.primaryTokenInfo.id]: quantity}, possibleUtxos)

  if (utxos !== null && utxos.length > 0) {
    return utxos
  }
  return null
}

const getAmountsFromValue = async (csl: WasmModuleProxy, value: string, primaryTokenId: string) => {
  const valueFromHex = await csl.Value.fromHex(value)
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
