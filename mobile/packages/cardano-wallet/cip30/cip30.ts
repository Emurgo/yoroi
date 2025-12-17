import {RawUtxo, toAssetNameHex, toPolicyId} from '@yoroi/api'
import {cardanoConfig} from '@yoroi/blockchains'
import {CardanoMobile} from '@yoroi/cardano-wallet'
import {isHex} from '@yoroi/common'
import {getLogger} from '@yoroi/logger'
import {
  CIP30TransactionError,
  RemoteUnspentOutput,
  calculateTxId,
  normalizeToAddress,
  parseTokenList,
  signRawTransaction,
  validateTransactionCbor,
} from '@yoroi/tx'
import {Balance, BaseAsset, Branded, Portfolio, Wallet} from '@yoroi/types'

import * as CSL from '@emurgo/cross-csl-core'
import {Address, WasmModuleProxy} from '@emurgo/cross-csl-core'
import {BigNumber} from 'bignumber.js'
import {Buffer} from 'buffer'
import * as _ from 'lodash'

import {identifierToCardanoAsset} from '../assetUtils'
import * as cip8 from '../cip8/cip8'
import {
  getDerivationPathForAddress,
  getTransactionSigners,
} from '../common/signatureUtils'
import {CardanoWalletDependencies} from '../dependencies'
import {createSendTxFromWallet} from '../transaction-recipes'
import {Pagination, YoroiWallet} from '../types'
import {copyFromCSL, copyMultipleFromCSL, createRawTxSigningKey} from '../utils'
import {Utxos, asQuantity} from '../utils/utils'
import {
  collateralConfig,
  findCollateralCandidates,
  utxosMaker,
} from '../utxoManager/utxos'

export type CIP30Extension = {
  getBalance(tokenId?: string): CSL.Value
  getUnusedAddresses(): CSL.Address[]
  getUsedAddresses(pagination?: Pagination): CSL.Address[]
  getChangeAddress(): CSL.Address
  getRewardAddresses(): CSL.Address[]
  getUtxos(
    value?: string,
    pagination?: Pagination,
  ): Promise<CSL.TransactionUnspentOutput[] | null>
  getCollateral(value?: string): Promise<CSL.TransactionUnspentOutput[] | null>
  submitTx(cbor: string): Promise<string>
  signData(
    rootKey: string,
    address: string,
    payload: string,
  ): Promise<{signature: string; key: string}>
  signTx(rootKey: string, cbor: string, partial?: boolean): Promise<string>
  buildReorganisationTx(value?: string): Promise<string>
}

export const cip30ExtensionMaker = (
  wallet: YoroiWallet,
  meta: Wallet.Meta,
  dependencies: Pick<CardanoWalletDependencies, 'createCollateralEntry'>,
): CIP30Extension => {
  const {createCollateralEntry} = dependencies
  return {
    getBalance(tokenId = '*') {
      const value = _getBalance(
        tokenId,
        wallet.utxos(),
        wallet.portfolioPrimaryTokenInfo.id,
        CardanoMobile,
      )
      return copyFromCSL(CardanoMobile.Value, value)
    },

    getUnusedAddresses() {
      const bech32Addresses = wallet
        .receiveAddresses()
        .filter((address) => !wallet.isUsedAddressIndex()[address])
      const addresses = bech32Addresses
        .map((addr) => normalizeToAddress(CardanoMobile, addr))
        .filter((addr): addr is Address => addr !== undefined)
      return copyMultipleFromCSL(addresses, CardanoMobile.Address)
    },

    getUsedAddresses(pagination?: Pagination) {
      const allAddresses = wallet.externalAddresses()
      const selectedAddresses = paginate(allAddresses, pagination)
      const addresses = selectedAddresses
        .map((addr) => normalizeToAddress(CardanoMobile, addr))
        .filter((addr): addr is Address => addr !== undefined)
      return copyMultipleFromCSL(addresses, CardanoMobile.Address)
    },

    getChangeAddress() {
      const changeAddr = wallet.getChangeAddress(meta.addressMode)
      // Use normalizeToAddress to handle Byron (base58), Shelley (bech32), and hex addresses
      const address = normalizeToAddress(CardanoMobile, changeAddr)
      if (!address) {
        throw new Error(`Invalid change address: ${changeAddr}`)
      }
      return copyFromCSL(CardanoMobile.Address, address)
    },

    getRewardAddresses() {
      const address = CardanoMobile.Address.fromHex(wallet.rewardAddressHex)
      return [copyFromCSL(CardanoMobile.Address, address)]
    },

    async getUtxos(value?: string, pagination?: Pagination) {
      const utxos = await _getUtxos(
        CardanoMobile,
        wallet,
        meta,
        value,
        pagination,
      )
      if (utxos === null) return null
      return copyMultipleFromCSL(utxos, CardanoMobile.TransactionUnspentOutput)
    },

    async getCollateral(value?: string) {
      const valueStr = value?.trim() ?? collateralConfig.minLovelace.toString()
      const valueNum = new BigNumber(valueStr)

      assertCollateralValue(valueNum)

      const currentCollateral = wallet.getCollateralInfo()
      const canUseCurrentCollateral =
        currentCollateral.utxo && valueNum.lte(currentCollateral.utxo.amount)

      if (canUseCurrentCollateral && currentCollateral.utxo) {
        try {
          const utxo = cardanoUtxoFromRemoteFormat(
            CardanoMobile,
            rawUtxoToRemoteUnspentOutput(
              currentCollateral.utxo,
              wallet.portfolioPrimaryTokenInfo.id,
            ),
            wallet.portfolioPrimaryTokenInfo.id,
          )
          return [recreateTransactionUnspentOutput(utxo)]
        } catch (error) {
          getLogger().error('Error converting collateral UTXO to CSL format', {
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
        CardanoMobile,
        wallet,
        asQuantity(valueNum),
      )
      if (oneUtxoCollateral) {
        return [recreateTransactionUnspentOutput(oneUtxoCollateral)]
      }

      const multipleUtxosCollateral = await _drawCollateralInMultipleUtxos(
        wallet,
        meta,
        asQuantity(valueNum),
        CardanoMobile,
      )
      if (multipleUtxosCollateral && multipleUtxosCollateral.length > 0) {
        return copyMultipleFromCSL(
          multipleUtxosCollateral,
          CardanoMobile.TransactionUnspentOutput,
        )
      }

      return null
    },

    async submitTx(cbor: string) {
      const base64 = Branded.asTransactionCborBase64(
        Buffer.from(cbor, 'hex').toString('base64'),
      )
      const txId = await calculateTxId(CardanoMobile, cbor, 'hex')
      await wallet.submitTransaction(base64)
      return txId
    },

    async signData(rootKey: string, address: string, payload: string) {
      const payloadInBytes = Buffer.from(payload, 'hex')
      // Parse address
      let normalisedAddress: Address | null = null
      if (CardanoMobile.ByronAddress.isValid(address)) {
        const byronAddr = CardanoMobile.ByronAddress.fromBase58(address)
        normalisedAddress = byronAddr.toAddress()
      } else {
        const isHexAddr = /^[0-9a-fA-F]+$/.test(address)
        normalisedAddress = isHexAddr
          ? CardanoMobile.Address.fromHex(address)
          : CardanoMobile.Address.fromBech32(address)
      }

      if (!normalisedAddress || normalisedAddress.isMalformed()) {
        throw new Error('Invalid address')
      }

      const bech32Address = normalisedAddress.toBech32(undefined)
      if (!bech32Address) throw new Error('Invalid address')

      const rewardAddress =
        CardanoMobile.RewardAddress.fromAddress(normalisedAddress)
      const rewardAddressHex = rewardAddress?.toAddress().toHex()

      const stakingSigningPath =
        meta.implementation === 'cardano-cip1852'
          ? cardanoConfig.implementations[meta.implementation].features.staking
              .addressing
          : null

      const signingPath =
        rewardAddressHex === wallet.rewardAddressHex &&
        Array.isArray(stakingSigningPath)
          ? stakingSigningPath
          : getDerivationPathForAddress(bech32Address, wallet, meta, true)

      const signingKey = createRawTxSigningKey(
        rootKey,
        signingPath,
        CardanoMobile,
      )
      const publicKeyBytes = signingKey.toPublic().asBytes()
      const coseSign1 = await cip8.sign(
        Buffer.from(normalisedAddress.toHex(), 'hex'),
        signingKey,
        payloadInBytes,
        publicKeyBytes,
      )
      const key = await cip8.makeCip8Key(publicKeyBytes)

      return {
        signature: Buffer.from(coseSign1.toBytes()).toString('hex'),
        key: Buffer.from(key.toBytes()).toString('hex'),
      }
    },

    async signTx(rootKey: string, cbor: string, partial = false) {
      // Validate transaction CBOR before signing
      const validation = validateTransactionCbor(CardanoMobile, cbor)
      if (!validation.valid) {
        throw new CIP30TransactionError(
          `Transaction validation failed: ${validation.errors.join(', ')}`,
          validation,
        )
      }

      // Log warnings if any
      if (validation.warnings.length > 0) {
        getLogger().warn('CIP-30 transaction validation warnings', {
          warnings: validation.warnings,
        })
      }

      // Get transaction signers
      const signers = await getTransactionSigners(cbor, wallet, meta, partial)
      const keys = signers.map((signer) =>
        createRawTxSigningKey(rootKey, signer, CardanoMobile),
      )

      // Sign the transaction
      const signedTxBytes = await signRawTransaction(cbor, keys)

      // Return signed transaction CBOR hex string (CIP-30 spec requirement)
      return Buffer.from(signedTxBytes).toString('hex')
    },

    async buildReorganisationTx(value?: string) {
      const valueStr = value?.trim() ?? collateralConfig.minLovelace.toString()
      const valueNum = new BigNumber(valueStr)

      assertCollateralValue(valueNum)

      const entry = createCollateralEntry(wallet, valueStr)
      const yoroiUnsignedTx = await createSendTxFromWallet(wallet, {
        entries: [entry],
        addressMode: meta.addressMode,
      })

      const tx = CardanoMobile.Transaction.fromHex(yoroiUnsignedTx.cbor)
      const txBody = tx.body()
      const emptyWitnessSet = CardanoMobile.TransactionWitnessSet.new()
      const newTx = CardanoMobile.Transaction.new(
        txBody,
        emptyWitnessSet,
        undefined,
      )
      return newTx.toHex()
    },
  }
}

const recreateTransactionUnspentOutput = (
  utxo: CSL.TransactionUnspentOutput,
) => {
  return copyFromCSL(CardanoMobile.TransactionUnspentOutput, utxo)
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
  primaryTokenId: Portfolio.Token.Id,
): CSL.TransactionUnspentOutput => {
  // Validate input data
  if (!u.txHash || typeof u.txHash !== 'string') {
    throw new Error(`Invalid txHash: ${u.txHash}`)
  }
  if (typeof u.txIndex !== 'number') {
    throw new Error(`Invalid txIndex: ${u.txIndex}`)
  }
  if (!u.balance || typeof u.balance !== 'object') {
    throw new Error(`Invalid balance: ${u.balance}`)
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

  // Get primary token amount (ADA)
  const primaryAmount = u.balance[primaryTokenId] ?? Branded.ZERO_QUANTITY
  const amountBigNum = csl.BigNum.fromStr(primaryAmount)
  if (!amountBigNum) {
    throw new Error(`Failed to create BigNum from amount: ${primaryAmount}`)
  }

  const value = csl.Value.new(amountBigNum)
  if (!value) {
    throw new Error(`Failed to create Value from amount: ${primaryAmount}`)
  }

  // Convert Balance.Amounts to multiasset
  const assets = Object.entries(u.balance)
    .filter(([tokenId]) => tokenId !== primaryTokenId)
    .map(([tokenId, amount]) => ({
      tokenId: tokenId as Portfolio.Token.Id,
      amount: Branded.asBalanceQuantity(amount as string),
      policyId: Branded.asPolicyId(''),
      name: Branded.asAssetName(''),
    }))

  if (assets.length > 0) {
    const multiasset = remoteAssetToMultiasset(assets, csl)
    if (!multiasset) {
      throw new Error('Failed to create MultiAsset')
    }
    value.setMultiasset(multiasset)
  }

  // Use normalizeToAddress to handle Byron (base58), Shelley (bech32), and hex addresses
  const receiver = normalizeToAddress(csl, u.receiver)
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
  primaryTokenId: Portfolio.Token.Id,
  csl: WasmModuleProxy,
) => {
  if (tokenId === 'TADA' || tokenId === 'ADA') tokenId = '.'
  const amounts = Utxos.toAmounts(utxos, primaryTokenId)
  const value = csl.Value.new(
    csl.BigNum.fromStr(amounts[primaryTokenId] ?? Branded.ZERO_QUANTITY),
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
      const amount = amounts[tokenId as Portfolio.Token.Id] as string
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
      const assetValue = csl.BigNum.fromStr(
        asset.amount ?? Branded.ZERO_QUANTITY,
      )
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
    const primaryTokenId = wallet.portfolioPrimaryTokenInfo.id
    const validUtxos = wallet.utxos().map((o) => {
      try {
        return cardanoUtxoFromRemoteFormat(
          csl,
          rawUtxoToRemoteUnspentOutput(o, primaryTokenId),
          primaryTokenId,
        )
      } catch (error) {
        getLogger().error('Error converting UTXO to CSL format', {
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
      getLogger().error('cip30 Failed to parse value _getUtxos', {error})
    }
  }

  const validUtxos = await _getRequiredUtxos(
    wallet,
    amounts,
    wallet.utxos(),
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
  const primaryTokenId = wallet.portfolioPrimaryTokenInfo.id
  const remoteUnspentOutputs: RemoteUnspentOutput[] = allUtxos.map((utxo) =>
    rawUtxoToRemoteUnspentOutput(utxo, primaryTokenId),
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
      entries: [{address: Branded.asAddress(rewardAddress), amounts}],
      addressMode: meta.addressMode,
    })
    const requiredUtxos = findUtxosInUnsignedTx(
      unsignedTx,
      remoteUnspentOutputs,
    )
    const primaryTokenId = wallet.portfolioPrimaryTokenInfo.id
    return requiredUtxos.map((o) => {
      try {
        return cardanoUtxoFromRemoteFormat(csl, o, primaryTokenId)
      } catch (error) {
        getLogger().error('Error converting UTXO to CSL format', {
          error: error instanceof Error ? error.message : String(error),
          utxoIndex: o.txIndex,
          utxoBalance: o.balance,
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

const rawUtxoToRemoteUnspentOutput = (
  utxo: RawUtxo,
  primaryTokenId: Portfolio.Token.Id,
): RemoteUnspentOutput => {
  // Convert to modern Balance.Amounts format
  const balance: Balance.Amounts = {
    [primaryTokenId]: utxo.amount as Balance.Quantity,
  }

  // Add other assets
  for (const asset of utxo.assets) {
    balance[asset.tokenId] = asset.amount as Balance.Quantity
  }

  return {
    txHash: utxo.tx_hash,
    txIndex: utxo.tx_index,
    receiver: utxo.receiver,
    utxoId: utxo.utxo_id,
    balance,
  }
}

const findUtxosInUnsignedTx = (
  unsignedTx: {cbor: string},
  utxos: RemoteUnspentOutput[],
) => {
  const tx = CardanoMobile.Transaction.fromHex(unsignedTx.cbor)
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
  const utxos = utxosMaker(wallet.utxos(), {
    maxLovelace: collateralConfig.maxLovelace,
    minLovelace: quantity,
    maxUTxOs: collateralConfig.maxUTxOs,
  })

  const possibleCollateralId = utxos.drawnCollateral()
  if (!possibleCollateralId) return null
  const collateralUtxo = utxos.findById(possibleCollateralId)
  if (!collateralUtxo) return null
  const primaryTokenId = wallet.portfolioPrimaryTokenInfo.id
  try {
    return cardanoUtxoFromRemoteFormat(
      csl,
      rawUtxoToRemoteUnspentOutput(collateralUtxo, primaryTokenId),
      primaryTokenId,
    )
  } catch (error) {
    getLogger().error('Error converting collateral UTXO to CSL format', {
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
  const possibleUtxos = findCollateralCandidates(wallet.utxos(), {
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
    amounts[primaryTokenId as Portfolio.Token.Id] = asQuantity(
      valueFromHex.coin().toStr(),
    )
  }
  const ma = valueFromHex.multiasset()
  if (ma) {
    for (const token of parseTokenList(csl, ma)) {
      const {assetId, amount} = token
      amounts[assetId as Portfolio.Token.Id] = asQuantity(amount)
    }
  }
  return amounts
}

const assertCollateralValue = (value: BigNumber) => {
  if (value.gt(new BigNumber(collateralConfig.maxLovelace))) {
    throw new Error('Collateral value is too high')
  }
}
