// UTXO conversion utilities
// Functions for converting between RawUtxo and ModernUtxo
import {Balance} from '@yoroi/types'

import type {TransactionUnspentOutput} from '@emurgo/cross-csl-core'
import {Buffer} from 'buffer'

import {CardanoMobileWrapped} from '../../../src/wallets/cardano/wrappedCsl'
import {Addressing} from '../types'
import {ModernUtxo} from '../utxo/models'

// RawUtxo type from wallet types
export type RawUtxo = {
  readonly amount: string
  readonly receiver: string
  readonly tx_hash: string
  readonly tx_index: number
  readonly utxo_id: string
  readonly assets: ReadonlyArray<{
    readonly amount: string
    readonly assetId: string
    readonly policyId: string
    readonly name: string
  }>
}

/**
 * Extract policy ID from asset ID (first 56 hex chars)
 */
function toPolicyId(assetId: string): string {
  return assetId.substring(0, 56)
}

/**
 * Extract asset name hex from asset ID (remaining chars after policy ID)
 */
function toAssetNameHex(assetId: string): string {
  return assetId.substring(56)
}

/**
 * Convert RawUtxo to ModernUtxo
 * @param rawUtxo - Raw UTXO from API
 * @param addressing - Optional addressing for signing
 * @param derivationPath - Optional derivation path for display
 * @param primaryTokenId - Primary token ID (typically '' for ADA)
 */
export function rawUtxoToModernUtxo(
  rawUtxo: RawUtxo,
  addressing?: Addressing,
  derivationPath?: string,
  primaryTokenId: string = '',
): ModernUtxo {
  const balance: Balance.Amounts = {}

  // Add primary token (ADA)
  if (Number(rawUtxo.amount) > 0) {
    balance[primaryTokenId] = rawUtxo.amount as Balance.Quantity
  }

  // Add other assets
  rawUtxo.assets.forEach((asset) => {
    balance[asset.assetId] = asset.amount as Balance.Quantity
  })

  // Create the ModernUtxo object
  const modernUtxo: ModernUtxo = {
    receiver: rawUtxo.receiver,
    txHash: rawUtxo.tx_hash,
    txIndex: rawUtxo.tx_index,
    balance,
    derivationPath,
    addressing,
    toTransactionUnspentOutputHex,
    toTransactionUnspentOutput,
  }

  // Bind methods to the object
  modernUtxo.toTransactionUnspentOutputHex =
    toTransactionUnspentOutputHex.bind(modernUtxo)
  modernUtxo.toTransactionUnspentOutput =
    toTransactionUnspentOutput.bind(modernUtxo)

  return modernUtxo
}

/**
 * Convert ModernUtxo to TransactionUnspentOutput hex
 */
function toTransactionUnspentOutputHex(this: ModernUtxo): string {
  // This requires WASM, so we'll need to call it with a WASM instance
  // For now, we'll throw an error - this should be called via toTransactionUnspentOutput
  throw new Error(
    'toTransactionUnspentOutputHex requires WASM instance. Use toTransactionUnspentOutput instead.',
  )
}

/**
 * Convert ModernUtxo to TransactionUnspentOutput using WASM
 */
function toTransactionUnspentOutput(
  this: ModernUtxo,
): TransactionUnspentOutput {
  return CardanoMobileWrapped.cslScope((wasm) => {
    const input = wasm.TransactionInput.new(
      wasm.TransactionHash.fromHex(this.txHash),
      this.txIndex,
    )

    const primaryTokenId = ''
    const adaAmount = this.balance[primaryTokenId] ?? '0'
    const value = wasm.Value.new(wasm.BigNum.fromStr(adaAmount))

    // Get all asset IDs except primary token
    const assetIds = Object.keys(this.balance).filter(
      (id) => id !== primaryTokenId,
    )

    if (assetIds.length > 0) {
      const multiAsset = wasm.MultiAsset.new()

      // Group assets by policy ID
      const groupedByPolicyId = assetIds.reduce(
        (acc, assetId) => {
          const policyId = toPolicyId(assetId)
          acc[policyId] = acc[policyId] ?? []
          acc[policyId]!.push(assetId)
          return acc
        },
        {} as Record<string, Array<string>>,
      )

      // Create MultiAsset structure
      for (const policyIdStr of Object.keys(groupedByPolicyId)) {
        const assetGroup = groupedByPolicyId[policyIdStr]
        if (!assetGroup) continue

        const policyId = wasm.ScriptHash.fromBytes(
          new Uint8Array(Buffer.from(policyIdStr, 'hex')),
        )
        const assets = wasm.Assets.new()

        for (const assetId of assetGroup) {
          const assetNameHex = toAssetNameHex(assetId)
          const name = wasm.AssetName.new(
            new Uint8Array(Buffer.from(assetNameHex, 'hex')),
          )
          const amount = wasm.BigNum.fromStr(this.balance[assetId] ?? '0')
          assets.insert(name, amount)
        }

        multiAsset.insert(policyId, assets)
      }

      value.setMultiasset(multiAsset)
    }

    const receiver = wasm.Address.fromBech32(this.receiver)
    if (!receiver) throw new Error('Invalid receiver address')
    const output = wasm.TransactionOutput.new(receiver, value)

    return wasm.TransactionUnspentOutput.new(input, output)
  })
}
