import {cardanoConfig} from '@yoroi/blockchains'
import {isHex} from '@yoroi/common'
import {
  CIP30TransactionError,
  RemoteUnspentOutput,
  calculateTxId,
  parseTokenList,
  signRawTransaction,
  validateTransactionCbor,
} from '@yoroi/tx'
import {Balance, Portfolio, Wallet} from '@yoroi/types'

import * as CSL from '@emurgo/cross-csl-core'
import {Address, WasmModuleProxy} from '@emurgo/cross-csl-core'
import {BigNumber} from 'bignumber.js'
import {Buffer} from 'buffer'
import * as _ from 'lodash'

import {createCollateralEntry} from '~/features/Settings/ui/screens/ChangeWalletSettingsScreen/ManageCollateralScreen/helpers'
import {logger} from '~/kernel/logger/logger'
import {BaseAsset, RawUtxo} from '~/wallets/types/other'
import {Utxos, asQuantity} from '~/wallets/utils/utils'
import {CardanoMobile} from '~/wallets/wallets'

import {toAssetNameHex, toPolicyId} from '../api/utils'
import {identifierToCardanoAsset} from '../assetUtils'
import * as cip8 from '../cip8/cip8'
import {
  getDerivationPathForAddress,
  getTransactionSigners,
} from '../common/signatureUtils'
import {createSendTxFromWallet} from '../transaction-recipes'
import {Pagination, YoroiWallet} from '../types'
import {copyFromCSL, copyMultipleFromCSL, createRawTxSigningKey} from '../utils'
import {
  collateralConfig,
  findCollateralCandidates,
  utxosMaker,
} from '../utxoManager/utxos'
import {CardanoMobileWrapped} from '../wrappedCsl'

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
    return CardanoMobileWrapped.cslScope((csl) => {
      const value = _getBalance(
        tokenId,
        this.wallet.utxos,
        this.wallet.portfolioPrimaryTokenInfo.id,
        csl,
      )
      return copyFromCSL(CardanoMobile.Value, value)
    })
  }

  getUnusedAddresses(): CSL.Address[] {
    return CardanoMobileWrapped.cslScope((csl) => {
      const bech32Addresses = this.wallet.receiveAddresses.filter(
        (address) => !this.wallet.isUsedAddressIndex[address],
      )
      const addresses = bech32Addresses.map((addr) =>
        csl.Address.fromBech32(addr),
      )
      return copyMultipleFromCSL(addresses, CardanoMobile.Address)
    })
  }

  getUsedAddresses(pagination?: Pagination): CSL.Address[] {
    return CardanoMobileWrapped.cslScope((csl) => {
      const allAddresses = this.wallet.externalAddresses
      const selectedAddresses = paginate(allAddresses, pagination)
      const addresses = selectedAddresses.map((addr) =>
        csl.Address.fromBech32(addr),
      )
      return copyMultipleFromCSL(addresses, CardanoMobile.Address)
    })
  }

  getChangeAddress(): CSL.Address {
    return CardanoMobileWrapped.cslScope((csl) => {
      const changeAddr = this.wallet.getChangeAddress(this.meta.addressMode)
      const address = csl.Address.fromBech32(changeAddr)
      return copyFromCSL(CardanoMobile.Address, address)
    })
  }

  getRewardAddresses(): CSL.Address[] {
    return CardanoMobileWrapped.cslScope((csl) => {
      const address = csl.Address.fromHex(this.wallet.rewardAddressHex)
      return [copyFromCSL(CardanoMobile.Address, address)]
    })
  }

  async getUtxos(
    value?: string,
    pagination?: Pagination,
  ): Promise<CSL.TransactionUnspentOutput[] | null> {
    return CardanoMobileWrapped.cslScope(async (csl) => {
      const utxos = await _getUtxos(
        csl,
        this.wallet,
        this.meta,
        value,
        pagination,
      )
      if (utxos === null) return null
      return copyMultipleFromCSL(utxos, CardanoMobile.TransactionUnspentOutput)
    })
  }

  async getCollateral(
    value?: string,
  ): Promise<CSL.TransactionUnspentOutput[] | null> {
    return CardanoMobileWrapped.cslScope(async (csl) => {
      const valueStr = value?.trim() ?? collateralConfig.minLovelace.toString()
      const valueNum = new BigNumber(valueStr)

      assertCollateralValue(valueNum)

      const currentCollateral = this.wallet.getCollateralInfo()
      const canUseCurrentCollateral =
        currentCollateral.utxo && valueNum.lte(currentCollateral.utxo.amount)

      if (canUseCurrentCollateral && currentCollateral.utxo) {
        try {
          const utxo = cardanoUtxoFromRemoteFormat(
            csl,
            rawUtxoToRemoteUnspentOutput(currentCollateral.utxo),
          )
          return [recreateTransactionUnspentOutput(utxo)]
        } catch (error) {
          logger.error('Error converting collateral UTXO to CSL format', {
            error: error instanceof Error ? error.message : String(error),
            utxoIndex: currentCollateral.utxo.tx_index,
            utxoAmount: currentCollateral.utxo.amount,
            utxoAssetsCount: currentCollateral.utxo.assets?.length ?? 0,
            utxoReceiver: currentCollateral.utxo.receiver,
            txHash: currentCollateral.utxo.tx_hash,
            txIndex: currentCollateral.utxo.tx_index,
          })
          throw error
        }
      }

      const oneUtxoCollateral = _drawCollateralInOneUtxo(
        csl,
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
        csl,
      )
      if (multipleUtxosCollateral && multipleUtxosCollateral.length > 0) {
        return copyMultipleFromCSL(
          multipleUtxosCollateral,
          CardanoMobile.TransactionUnspentOutput,
        )
      }

      return null
    })
  }

  async submitTx(cbor: string): Promise<string> {
    const base64 = Buffer.from(cbor, 'hex').toString('base64')
    const txId = await CardanoMobileWrapped.cslScope(async (csl) => {
      return await calculateTxId(csl, base64, 'base64')
    })
    await this.wallet.submitTransaction(base64)
    return txId
  }

  async signData(
    rootKey: string,
    address: string,
    payload: string,
  ): Promise<{signature: string; key: string}> {
    return CardanoMobileWrapped.cslScope(async (csl) => {
      const payloadInBytes = Buffer.from(payload, 'hex')
      // Parse address within this scope to avoid WASM pointer issues
      let normalisedAddress: Address | null = null
      if (csl.ByronAddress.isValid(address)) {
        const byronAddr = csl.ByronAddress.fromBase58(address)
        normalisedAddress = byronAddr.toAddress()
      } else {
        const isHexAddr = /^[0-9a-fA-F]+$/.test(address)
        normalisedAddress = isHexAddr
          ? csl.Address.fromHex(address)
          : csl.Address.fromBech32(address)
      }

      if (!normalisedAddress || normalisedAddress.isMalformed()) {
        throw new Error('Invalid address')
      }

      const bech32Address = normalisedAddress.toBech32(undefined)
      if (!bech32Address) throw new Error('Invalid address')

      const rewardAddress = csl.RewardAddress.fromAddress(normalisedAddress)
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

      const signingKey = createRawTxSigningKey(rootKey, signingPath, csl)
      const publicKeyBytes = signingKey.toPublic().asBytes()
      const coseSign1 = await cip8.sign(
        Buffer.from(normalisedAddress.toHex(), 'hex'),
        signingKey,
        payloadInBytes,
      )
      const key = await cip8.makeCip8Key(publicKeyBytes)

      return {
        signature: Buffer.from(coseSign1.toBytes()).toString('hex'),
        key: Buffer.from(key.toBytes()).toString('hex'),
      }
    })
  }

  async signTx(
    rootKey: string,
    cbor: string,
    partial = false,
  ): Promise<string> {
    return CardanoMobileWrapped.cslScope(async (csl) => {
      // Validate transaction CBOR before signing
      const validation = validateTransactionCbor(csl, cbor)
      if (!validation.valid) {
        throw new CIP30TransactionError(
          `Transaction validation failed: ${validation.errors.join(', ')}`,
          validation,
        )
      }

      // Log warnings if any
      if (validation.warnings.length > 0) {
        logger.warn('CIP-30 transaction validation warnings', {
          warnings: validation.warnings,
        })
      }

      // Get transaction signers
      const signers = await getTransactionSigners(
        cbor,
        this.wallet,
        this.meta,
        partial,
      )
      const keys = signers.map((signer) =>
        createRawTxSigningKey(rootKey, signer, csl),
      )

      // Sign the transaction
      const signedTxBytes = await signRawTransaction(cbor, keys)

      // Return signed transaction CBOR hex string (CIP-30 spec requirement)
      return Buffer.from(signedTxBytes).toString('hex')
    })
  }

  async buildReorganisationTx(value?: string): Promise<string> {
    const valueStr = value?.trim() ?? collateralConfig.minLovelace.toString()
    const valueNum = new BigNumber(valueStr)

    assertCollateralValue(valueNum)

    const entry = createCollateralEntry(this.wallet, valueStr)
    const yoroiUnsignedTx = await createSendTxFromWallet(this.wallet, {
      entries: [entry],
      addressMode: this.meta.addressMode,
    })

    return CardanoMobileWrapped.cslScope((csl) => {
      const tx = csl.Transaction.fromHex(yoroiUnsignedTx.cbor)
      const txBody = tx.body()
      const emptyWitnessSet = csl.TransactionWitnessSet.new()
      const newTx = csl.Transaction.new(txBody, emptyWitnessSet, undefined)
      return newTx.toHex()
    })
  }
}

const remoteAssetToMultiasset = (
  remoteAssets: BaseAsset[],
  csl: WasmModuleProxy,
): CSL.MultiAsset => {
  const groupedAssets = remoteAssets.reduce(
    (res, a) => {
      ;(res[toPolicyId(a.tokenId)] = res[toPolicyId(a.tokenId)] || []).push(a)
      return res
    },
    {} as Record<string, BaseAsset[]>,
  )
  const multiasset = csl.MultiAsset.new()
  for (const policyHex of Object.keys(groupedAssets)) {
    const assetGroup = groupedAssets[policyHex]
    if (!assetGroup) continue
    const policyId = csl.ScriptHash.fromBytes(
      new Uint8Array(Buffer.from(policyHex, 'hex')),
    )
    const assets = csl.Assets.new()
    for (const asset of assetGroup) {
      assets.insert(
        csl.AssetName.new(
          new Uint8Array(Buffer.from(toAssetNameHex(asset.tokenId), 'hex')),
        ),
        csl.BigNum.fromStr(asset.amount),
      )
    }
    multiasset.insert(policyId, assets)
  }
  return multiasset
}
const cardanoUtxoFromRemoteFormat = (
  csl: WasmModuleProxy,
  u: RemoteUnspentOutput,
): CSL.TransactionUnspentOutput => {
  // Validate input data
  if (!u.txHash || typeof u.txHash !== 'string') {
    throw new Error(`Invalid txHash: ${u.txHash}`)
  }
  if (typeof u.txIndex !== 'number') {
    throw new Error(`Invalid txIndex: ${u.txIndex}`)
  }
  if (!u.amount || typeof u.amount !== 'string') {
    throw new Error(`Invalid amount: ${u.amount}`)
  }
  if (!u.receiver || typeof u.receiver !== 'string') {
    throw new Error(`Invalid receiver: ${u.receiver}`)
  }

  const txHash = csl.TransactionHash.fromHex(u.txHash)
  if (!txHash) {
    throw new Error(`Failed to create TransactionHash from: ${u.txHash}`)
  }

  const input = csl.TransactionInput.new(txHash, u.txIndex)
  if (!input) {
    throw new Error(
      `Failed to create TransactionInput for ${u.txHash}:${u.txIndex}`,
    )
  }

  const amountBigNum = csl.BigNum.fromStr(u.amount)
  if (!amountBigNum) {
    throw new Error(`Failed to create BigNum from amount: ${u.amount}`)
  }

  const value = csl.Value.new(amountBigNum)
  if (!value) {
    throw new Error(`Failed to create Value from amount: ${u.amount}`)
  }

  if ((u.assets || []).length > 0) {
    // Convert UtxoAsset[] (with assetId) to BaseAsset[] (with tokenId)
    // assetId is already in the format policyId.assetNameHex, so we can use it directly as tokenId
    const baseAssets: BaseAsset[] = u.assets.map((asset) => ({
      tokenId: asset.assetId as Portfolio.Token.Id,
      amount: asset.amount,
      policyId: '', // Not needed for multiasset construction
      name: '', // Not needed for multiasset construction
    }))
    const multiasset = remoteAssetToMultiasset(baseAssets, csl)
    if (!multiasset) {
      throw new Error('Failed to create MultiAsset')
    }
    value.setMultiasset(multiasset)
  }

  const receiver = csl.Address.fromBech32(u.receiver)
  if (!receiver) {
    throw new Error(`Invalid receiver address: ${u.receiver}`)
  }

  const output = csl.TransactionOutput.new(receiver, value)
  if (!output) {
    throw new Error(
      `Failed to create TransactionOutput: Pointer is NULL for utxo ${u.txHash}:${u.txIndex}`,
    )
  }

  const unspentOutput = csl.TransactionUnspentOutput.new(input, output)
  if (!unspentOutput) {
    throw new Error(
      `Failed to create TransactionUnspentOutput for utxo ${u.txHash}:${u.txIndex}`,
    )
  }

  return unspentOutput
}

const _getBalance = (
  tokenId = '*',
  utxos: RawUtxo[],
  primaryTokenId: string,
  csl: WasmModuleProxy,
) => {
  if (tokenId === 'TADA' || tokenId === 'ADA') tokenId = '.'
  const amounts = Utxos.toAmounts(utxos, primaryTokenId)
  const value = csl.Value.new(
    csl.BigNum.fromStr(amounts[primaryTokenId] ?? '0'),
  )
  const normalizedInHex = Object.keys(amounts)
    .filter((t) => {
      if (tokenId === '*') return true
      return t === tokenId
    })
    .map((tokenId) => {
      if (tokenId === '.' || tokenId === '' || tokenId === primaryTokenId)
        return null
      const {policyId, name} = identifierToCardanoAsset(csl, tokenId)
      const amount = amounts[tokenId]
      return {policyIdHex: policyId.toHex(), nameHex: name.toHex(), amount}
    })

  const groupedByPolicyId = _.groupBy(
    normalizedInHex.filter(Boolean),
    'policyIdHex',
  )

  const multiAsset = csl.MultiAsset.new()
  for (const policyIdHex of Object.keys(groupedByPolicyId)) {
    const assetValue = groupedByPolicyId[policyIdHex]
    if (!assetValue) continue
    const policyId = csl.ScriptHash.fromHex(policyIdHex)
    const assets = csl.Assets.new()
    for (const asset of assetValue) {
      if (!asset) continue
      const assetName = csl.AssetName.fromHex(asset.nameHex)
      const assetValue = csl.BigNum.fromStr(asset.amount ?? '0')
      assets.insert(assetName, assetValue)
    }
    multiAsset.insert(policyId, assets)
  }
  value.setMultiasset(multiAsset)
  return value
}

const _getUtxos = async (
  csl: WasmModuleProxy,
  wallet: YoroiWallet,
  meta: Wallet.Meta,
  value?: string,
  pagination?: Pagination,
): Promise<CSL.TransactionUnspentOutput[] | null> => {
  const valueStr = value?.trim() ?? ''

  if (valueStr.length === 0) {
    const validUtxos = wallet.utxos.map((o) => {
      try {
        return cardanoUtxoFromRemoteFormat(csl, rawUtxoToRemoteUnspentOutput(o))
      } catch (error) {
        logger.error('Error converting UTXO to CSL format', {
          error: error instanceof Error ? error.message : String(error),
          utxoIndex: o.tx_index,
          utxoAmount: o.amount,
          utxoAssetsCount: o.assets?.length ?? 0,
          utxoReceiver: o.receiver,
          txHash: o.tx_hash,
          txIndex: o.tx_index,
        })
        throw error
      }
    })
    return paginate(validUtxos, pagination)
  }

  const amounts: Balance.Amounts = {}

  const isValueNumber = !isNaN(Number(valueStr))

  if (isValueNumber) {
    amounts[wallet.portfolioPrimaryTokenInfo.id] = asQuantity(valueStr)
  } else {
    try {
      Object.assign(
        amounts,
        getAmountsFromValue(valueStr, wallet.portfolioPrimaryTokenInfo.id, csl),
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
    csl,
  )
  if (validUtxos === null) return null
  return paginate(validUtxos, pagination)
}

export const _getRequiredUtxos = async (
  wallet: YoroiWallet,
  amounts: Balance.Amounts,
  allUtxos: RawUtxo[],
  meta: Wallet.Meta,
  csl: WasmModuleProxy,
): Promise<CSL.TransactionUnspentOutput[] | null> => {
  const remoteUnspentOutputs: RemoteUnspentOutput[] = allUtxos.map((utxo) =>
    rawUtxoToRemoteUnspentOutput(utxo),
  )
  // Create address within the provided csl scope to avoid pointer issues
  let normalisedRewardAddress: Address | null = null
  if (csl.ByronAddress.isValid(wallet.rewardAddressHex)) {
    const byronAddr = csl.ByronAddress.fromBase58(wallet.rewardAddressHex)
    normalisedRewardAddress = byronAddr.toAddress()
  } else {
    const isHexAddr = isHex(wallet.rewardAddressHex)
    normalisedRewardAddress = isHexAddr
      ? csl.Address.fromHex(wallet.rewardAddressHex)
      : csl.Address.fromBech32(wallet.rewardAddressHex)
  }
  if (!normalisedRewardAddress || normalisedRewardAddress.isMalformed()) {
    throw new Error('Invalid wallet state')
  }
  const rewardAddress = normalisedRewardAddress.toBech32(undefined)
  if (!rewardAddress) throw new Error('Invalid wallet state')

  try {
    const unsignedTx = await createSendTxFromWallet(wallet, {
      entries: [{address: rewardAddress, amounts}],
      addressMode: meta.addressMode,
    })
    const requiredUtxos = findUtxosInUnsignedTx(
      unsignedTx,
      remoteUnspentOutputs,
    )
    return requiredUtxos.map((o) => {
      try {
        return cardanoUtxoFromRemoteFormat(csl, o)
      } catch (error) {
        logger.error('Error converting UTXO to CSL format', {
          error: error instanceof Error ? error.message : String(error),
          utxoIndex: o.txIndex,
          utxoAmount: o.amount,
          utxoAssetsCount: o.assets?.length ?? 0,
          utxoReceiver: o.receiver,
          txHash: o.txHash,
          txIndex: o.txIndex,
        })
        throw error
      }
    })
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
    // Convert RemoteAsset[] (with tokenId) to UtxoAsset[] (with assetId)
    // tokenId is already in the format policyId.assetNameHex, so we can use it directly as assetId
    assets: utxo.assets.map((asset) => ({
      assetId: asset.tokenId,
      amount: asset.amount,
    })),
    utxoId: utxo.utxo_id,
  }
}

const findUtxosInUnsignedTx = (
  unsignedTx: {cbor: string},
  utxos: RemoteUnspentOutput[],
) => {
  return CardanoMobileWrapped.cslScope((csl) => {
    const tx = csl.Transaction.fromHex(unsignedTx.cbor)
    const txBody = tx.body()
    const inputs = txBody.inputs()
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
  })
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
  csl: WasmModuleProxy,
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
  try {
    return cardanoUtxoFromRemoteFormat(
      csl,
      rawUtxoToRemoteUnspentOutput(collateralUtxo),
    )
  } catch (error) {
    logger.error('Error converting collateral UTXO to CSL format', {
      error: error instanceof Error ? error.message : String(error),
      utxoIndex: collateralUtxo.tx_index,
      utxoAmount: collateralUtxo.amount,
      utxoAssetsCount: collateralUtxo.assets?.length ?? 0,
      utxoReceiver: collateralUtxo.receiver,
      txHash: collateralUtxo.tx_hash,
      txIndex: collateralUtxo.tx_index,
    })
    throw error
  }
}

const _drawCollateralInMultipleUtxos = async (
  wallet: YoroiWallet,
  meta: Wallet.Meta,
  quantity: Balance.Quantity,
  csl: WasmModuleProxy,
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
    csl,
  )

  if (utxos !== null && utxos.length > 0) {
    return utxos
  }
  return null
}

const getAmountsFromValue = (
  value: string,
  primaryTokenId: string,
  csl: WasmModuleProxy,
) => {
  const valueFromHex = csl.Value.fromHex(value)
  const amounts: Balance.Amounts = {}

  if (valueFromHex.hasValue()) {
    amounts[primaryTokenId] = asQuantity(valueFromHex.coin().toStr())
  }
  const ma = valueFromHex.multiasset()
  if (ma) {
    for (const token of parseTokenList(csl, ma)) {
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
