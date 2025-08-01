import * as CSL from '@emurgo/cross-csl-core'
import {
  RemoteUnspentOutput,
  signRawTransaction,
  UtxoAsset,
} from '@emurgo/yoroi-lib'
import {normalizeToAddress} from '@emurgo/yoroi-lib/dist/internals/utils/addresses'
import {parseTokenList} from '@emurgo/yoroi-lib/dist/internals/utils/assets'
import {cardanoConfig} from '@yoroi/blockchains'
import {Balance, Wallet} from '@yoroi/types'
import {BalanceAmounts} from '@yoroi/types/src/balance/token'
import {BigNumber} from 'bignumber.js'
import {Buffer} from 'buffer'
import _ from 'lodash'

import {logger} from '~/kernel/logger/logger'
import {RawUtxo} from '~/wallets/types/other'
import {YoroiUnsignedTx} from '~/wallets/types/yoroi'
import {asQuantity, Utxos} from '~/wallets/utils/utils'
import {Cardano, CardanoMobile} from '~/wallets/wallets'
import {toAssetNameHex, toPolicyId} from '../api/utils'
import {identifierToCardanoAsset} from '../assetUtils'
// import * as cip8 from '../cip8/cip8'
import {
  getDerivationPathForAddress,
  getTransactionSigners,
} from '../common/signatureUtils'
import {Pagination, YoroiWallet} from '../types'
import {copyFromCSL, copyMultipleFromCSL, createRawTxSigningKey} from '../utils'
import {
  collateralConfig,
  findCollateralCandidates,
  utxosMaker,
} from '../utxoManager/utxos'

export const cip30ExtensionMaker = (wallet: YoroiWallet, meta: Wallet.Meta) => {
  return new CIP30Extension(wallet, meta)
}

const recreateTransactionUnspentOutput = (
  utxo: CSL.TransactionUnspentOutput,
) => {
  return copyFromCSL(CardanoMobile.TransactionUnspentOutput, utxo)
}

class CIP30Extension {
  constructor(
    private wallet: YoroiWallet,
    private meta: Wallet.Meta,
  ) {}

  getBalance(tokenId = '*'): CSL.Value {
    const value = _getBalance(
      tokenId,
      this.wallet.utxos,
      this.wallet.portfolioPrimaryTokenInfo.id,
    )
    return copyFromCSL(CardanoMobile.Value, value)
  }

  getUnusedAddresses(): CSL.Address[] {
    const bech32Addresses = this.wallet.receiveAddresses.filter(
      (address) => !this.wallet.isUsedAddressIndex[address],
    )
    return bech32Addresses.map((addr) => CardanoMobile.Address.fromBech32(addr))
  }

  getUsedAddresses(pagination?: Pagination): CSL.Address[] {
    const allAddresses = this.wallet.externalAddresses
    const selectedAddresses = paginate(allAddresses, pagination)
    return selectedAddresses.map((addr) =>
      CardanoMobile.Address.fromBech32(addr),
    )
  }

  getChangeAddress(): CSL.Address {
    const changeAddr = this.wallet.getChangeAddress(this.meta.addressMode)
    return CardanoMobile.Address.fromBech32(changeAddr)
  }

  getRewardAddresses(): CSL.Address[] {
    const address = CardanoMobile.Address.fromHex(this.wallet.rewardAddressHex)
    return [address]
  }

  async getUtxos(
    value?: string,
    pagination?: Pagination,
  ): Promise<CSL.TransactionUnspentOutput[] | null> {
    const utxos = await _getUtxos(this.wallet, this.meta, value, pagination)
    if (utxos === null) return null
    return utxos.map((u) =>
      CardanoMobile.TransactionUnspentOutput.fromHex(u.toHex()),
    )
  }

  async getCollateral(
    value?: string,
  ): Promise<CSL.TransactionUnspentOutput[] | null> {
    const valueStr = value?.trim() ?? collateralConfig.minLovelace.toString()
    const valueNum = new BigNumber(valueStr)

    assertCollateralValue(valueNum)

    const currentCollateral = this.wallet.getCollateralInfo()
    const canUseCurrentCollateral =
      currentCollateral.utxo && valueNum.lte(currentCollateral.utxo.amount)

    if (canUseCurrentCollateral && currentCollateral.utxo) {
      const utxo = cardanoUtxoFromRemoteFormat(
        rawUtxoToRemoteUnspentOutput(currentCollateral.utxo),
      )
      return [recreateTransactionUnspentOutput(utxo)]
    }

    const oneUtxoCollateral = _drawCollateralInOneUtxo(
      this.wallet,
      asQuantity(valueNum),
    )
    if (oneUtxoCollateral) {
      return [recreateTransactionUnspentOutput(oneUtxoCollateral)]
    }

    const multipleUtxosCollateral = await _drawCollateralInMultipleUtxos(
      this.wallet,
      this.meta,
      asQuantity(valueNum),
    )
    if (multipleUtxosCollateral && multipleUtxosCollateral.length > 0) {
      return copyMultipleFromCSL(
        multipleUtxosCollateral,
        CardanoMobile.TransactionUnspentOutput,
      )
    }

    return null
  }

  async submitTx(cbor: string): Promise<string> {
    const base64 = Buffer.from(cbor, 'hex').toString('base64')
    const txId = Cardano.calculateTxId(base64, 'base64')
    await this.wallet.submitTransaction(base64)
    return txId
  }

  async signData(
    rootKey: string,
    address: string,
    payload: string,
  ): Promise<{signature: string; key: string}> {
    const payloadInBytes = Buffer.from(payload, 'hex')
    const normalisedAddress = normalizeToAddress(CardanoMobile, address)
    const bech32Address = normalisedAddress?.toBech32(undefined)
    if (!bech32Address || !normalisedAddress) throw new Error('Invalid address')

    const rewardAddress =
      CardanoMobile.RewardAddress.fromAddress(normalisedAddress)
    const rewardAddressHex = rewardAddress?.toAddress().toHex()

    const stakingSigningPath =
      this.meta.implementation === 'cardano-cip1852'
        ? cardanoConfig.implementations[this.meta.implementation].features
            .staking.addressing
        : null

    const signingPath =
      rewardAddressHex === this.wallet.rewardAddressHex &&
      Array.isArray(stakingSigningPath)
        ? stakingSigningPath
        : getDerivationPathForAddress(
            bech32Address,
            this.wallet,
            this.meta,
            true,
          )

    const signingKey = createRawTxSigningKey(rootKey, signingPath)
    throw new Error('msl can be used')
    // const coseSign1 = await cip8.sign(
    //   Buffer.from(normalisedAddress.toHex(), 'hex'),
    //   signingKey,
    //   payloadInBytes,
    // )
    // const key = await cip8.makeCip8Key(signingKey.toPublic().asBytes())

    // return {
    //   signature: Buffer.from(coseSign1.toBytes()).toString('hex'),
    //   key: Buffer.from(key.toBytes()).toString('hex'),
    // }
  }

  signTx(
    rootKey: string,
    cbor: string,
    partial = false,
  ): CSL.TransactionWitnessSet {
    const signers = getTransactionSigners(cbor, this.wallet, this.meta, partial)
    const keys = signers.map((signer) => createRawTxSigningKey(rootKey, signer))
    const signedTxBytes = signRawTransaction(CardanoMobile, cbor, keys)
    const signedTx = CardanoMobile.Transaction.fromBytes(signedTxBytes)
    return copyFromCSL(
      CardanoMobile.TransactionWitnessSet,
      signedTx.witnessSet(),
    )
  }

  async buildReorganisationTx(value?: string): Promise<string> {
    const valueStr = value?.trim() ?? collateralConfig.minLovelace.toString()
    const valueNum = new BigNumber(valueStr)

    assertCollateralValue(valueNum)

    const bech32Address = this.wallet.externalAddresses[0]
    const amounts = {
      [this.wallet.portfolioPrimaryTokenInfo.id]: asQuantity(valueStr),
    }
    const yoroiUnsignedTx = await this.wallet.createUnsignedTx({
      entries: [{address: bech32Address, amounts}],
      addressMode: this.meta.addressMode,
    })
    const txBody = yoroiUnsignedTx.unsignedTx.txBuilder.build()

    const emptyWitnessSet = CardanoMobile.TransactionWitnessSet.new()
    const tx = CardanoMobile.Transaction.new(txBody, emptyWitnessSet, undefined)
    return tx.toHex()
  }
}

const remoteAssetToMultiasset = (remoteAssets: UtxoAsset[]): CSL.MultiAsset => {
  const groupedAssets = remoteAssets.reduce(
    (res, a) => {
      ;(res[toPolicyId(a.assetId)] = res[toPolicyId(a.assetId)] || []).push(a)
      return res
    },
    {} as Record<string, UtxoAsset[]>,
  )
  const multiasset = CardanoMobile.MultiAsset.new()
  for (const policyHex of Object.keys(groupedAssets)) {
    const assetGroup = groupedAssets[policyHex]
    const policyId = CardanoMobile.ScriptHash.fromBytes(
      new Uint8Array(Buffer.from(policyHex, 'hex')),
    )
    const assets = CardanoMobile.Assets.new()
    for (const asset of assetGroup) {
      assets.insert(
        CardanoMobile.AssetName.new(
          new Uint8Array(Buffer.from(toAssetNameHex(asset.assetId), 'hex')),
        ),
        CardanoMobile.BigNum.fromStr(asset.amount),
      )
    }
    multiasset.insert(policyId, assets)
  }
  return multiasset
}
const cardanoUtxoFromRemoteFormat = (
  u: RemoteUnspentOutput,
): CSL.TransactionUnspentOutput => {
  const input = CardanoMobile.TransactionInput.new(
    CardanoMobile.TransactionHash.fromHex(u.txHash),
    u.txIndex,
  )
  const value = CardanoMobile.Value.new(CardanoMobile.BigNum.fromStr(u.amount))
  if ((u.assets || []).length > 0) {
    value.setMultiasset(remoteAssetToMultiasset([...u.assets]))
  }
  const receiver = CardanoMobile.Address.fromBech32(u.receiver)
  if (!receiver) throw new Error('Invalid receiver')
  const output = CardanoMobile.TransactionOutput.new(receiver, value)
  return CardanoMobile.TransactionUnspentOutput.new(input, output)
}

const _getBalance = (
  tokenId = '*',
  utxos: RawUtxo[],
  primaryTokenId: string,
) => {
  if (tokenId === 'TADA' || tokenId === 'ADA') tokenId = '.'
  const amounts = Utxos.toAmounts(utxos, primaryTokenId)
  const value = CardanoMobile.Value.new(
    CardanoMobile.BigNum.fromStr(amounts[primaryTokenId]),
  )
  const normalizedInHex = Object.keys(amounts)
    .filter((t) => {
      if (tokenId === '*') return true
      return t === tokenId
    })
    .map((tokenId) => {
      if (tokenId === '.' || tokenId === '' || tokenId === primaryTokenId)
        return null
      const {policyId, name} = identifierToCardanoAsset(tokenId)
      const amount = amounts[tokenId]
      return {policyIdHex: policyId.toHex(), nameHex: name.toHex(), amount}
    })

  const groupedByPolicyId = _.groupBy(
    normalizedInHex.filter(Boolean),
    'policyIdHex',
  )

  const multiAsset = CardanoMobile.MultiAsset.new()
  for (const policyIdHex of Object.keys(groupedByPolicyId)) {
    const assetValue = groupedByPolicyId[policyIdHex]
    if (!assetValue) continue
    const policyId = CardanoMobile.ScriptHash.fromHex(policyIdHex)
    const assets = CardanoMobile.Assets.new()
    for (const asset of assetValue) {
      if (!asset) continue
      const assetName = CardanoMobile.AssetName.fromHex(asset.nameHex)
      const assetValue = CardanoMobile.BigNum.fromStr(asset.amount)
      assets.insert(assetName, assetValue)
    }
    multiAsset.insert(policyId, assets)
  }
  value.setMultiasset(multiAsset)
  return value
}

const _getUtxos = async (
  wallet: YoroiWallet,
  meta: Wallet.Meta,
  value?: string,
  pagination?: Pagination,
): Promise<CSL.TransactionUnspentOutput[] | null> => {
  const valueStr = value?.trim() ?? ''

  if (valueStr.length === 0) {
    const validUtxos = wallet.utxos.map((o) =>
      cardanoUtxoFromRemoteFormat(rawUtxoToRemoteUnspentOutput(o)),
    )
    return paginate(validUtxos, pagination)
  }

  const amounts: BalanceAmounts = {}

  const isValueNumber = !isNaN(Number(valueStr))

  if (isValueNumber) {
    amounts[wallet.portfolioPrimaryTokenInfo.id] = asQuantity(valueStr)
  } else {
    try {
      Object.assign(
        amounts,
        getAmountsFromValue(valueStr, wallet.portfolioPrimaryTokenInfo.id),
      )
    } catch (error) {
      logger.error('cip30 Failed to parse value _getUtxos', {error})
    }
  }

  const validUtxos = await _getRequiredUtxos(
    wallet,
    amounts,
    wallet.utxos,
    meta,
  )
  if (validUtxos === null) return null
  return paginate(validUtxos, pagination)
}

export const _getRequiredUtxos = async (
  wallet: YoroiWallet,
  amounts: Balance.Amounts,
  allUtxos: RawUtxo[],
  meta: Wallet.Meta,
): Promise<CSL.TransactionUnspentOutput[] | null> => {
  const remoteUnspentOutputs: RemoteUnspentOutput[] = allUtxos.map((utxo) =>
    rawUtxoToRemoteUnspentOutput(utxo),
  )
  const rewardAddress = normalizeToAddress(
    CardanoMobile,
    wallet.rewardAddressHex,
  )?.toBech32(undefined)
  if (!rewardAddress) throw new Error('Invalid wallet state')

  try {
    const unsignedTx = await wallet.createUnsignedTx({
      entries: [{address: rewardAddress, amounts}],
      addressMode: meta.addressMode,
    })
    const requiredUtxos = findUtxosInUnsignedTx(
      unsignedTx,
      remoteUnspentOutputs,
    )
    return requiredUtxos.map((o) => cardanoUtxoFromRemoteFormat(o))
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

const findUtxosInUnsignedTx = (
  unsignedTx: YoroiUnsignedTx,
  utxos: RemoteUnspentOutput[],
) => {
  const inputs = unsignedTx.unsignedTx.txBody.inputs()
  const filteredUtxos: RemoteUnspentOutput[] = []
  for (let i = 0; i < inputs.len(); i++) {
    const input = inputs.get(i)
    const inputTxHash = input.transactionId().toHex()
    const inputIndex = input.index()
    const utxo = utxos.find(
      (utxo) => utxo.txHash === inputTxHash && utxo.txIndex === inputIndex,
    )
    if (utxo) filteredUtxos.push(utxo)
  }
  return filteredUtxos
}

const paginate = <T>(
  items: T[],
  pagination?: {page: number; limit: number},
) => {
  return pagination
    ? items.slice(
        pagination.page * pagination.limit,
        (pagination.page + 1) * pagination.limit,
      )
    : items
}

const _drawCollateralInOneUtxo = (
  wallet: YoroiWallet,
  quantity: Balance.Quantity,
) => {
  const utxos = utxosMaker(wallet.utxos, {
    maxLovelace: collateralConfig.maxLovelace,
    minLovelace: quantity,
    maxUTxOs: collateralConfig.maxUTxOs,
  })

  const possibleCollateralId = utxos.drawnCollateral()
  if (!possibleCollateralId) return null
  const collateralUtxo = utxos.findById(possibleCollateralId)
  if (!collateralUtxo) return null
  return cardanoUtxoFromRemoteFormat(
    rawUtxoToRemoteUnspentOutput(collateralUtxo),
  )
}

const _drawCollateralInMultipleUtxos = async (
  wallet: YoroiWallet,
  meta: Wallet.Meta,
  quantity: Balance.Quantity,
) => {
  const possibleUtxos = findCollateralCandidates(wallet.utxos, {
    maxLovelace: collateralConfig.maxLovelace,
    minLovelace: asQuantity('0'),
    maxUTxOs: collateralConfig.maxUTxOs,
  })

  const sortedFromMaxToMin = possibleUtxos.sort((a, b) => {
    const aAmount = new BigNumber(a.amount)
    const bAmount = new BigNumber(b.amount)
    return bAmount.comparedTo(aAmount) ?? 0
  })

  const utxosWithLimitAccounted = sortedFromMaxToMin.slice(
    0,
    collateralConfig.maxUTxOs,
  )

  const utxos = await _getRequiredUtxos(
    wallet,
    {[wallet.portfolioPrimaryTokenInfo.id]: quantity},
    utxosWithLimitAccounted,
    meta,
  )

  if (utxos !== null && utxos.length > 0) {
    return utxos
  }
  return null
}

const getAmountsFromValue = (value: string, primaryTokenId: string) => {
  const valueFromHex = CardanoMobile.Value.fromHex(value)
  const amounts: BalanceAmounts = {}

  if (valueFromHex.hasValue()) {
    amounts[primaryTokenId] = asQuantity(valueFromHex.coin().toStr())
  }
  const ma = valueFromHex.multiasset()
  if (ma) {
    for (const token of parseTokenList(ma)) {
      const {assetId, amount} = token
      amounts[assetId] = asQuantity(amount)
    }
  }
  return amounts
}

const assertCollateralValue = (value: BigNumber) => {
  if (value.gt(new BigNumber(collateralConfig.maxLovelace))) {
    throw new Error('Collateral value is too high')
  }
}
