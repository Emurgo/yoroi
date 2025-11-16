// UTXO conversion utilities
// Functions for converting between RawUtxo and ModernUtxo
import {Balance, Portfolio} from '@yoroi/types'

import type {
  TransactionUnspentOutput,
  WasmModuleProxy,
} from '@emurgo/cross-csl-core'
import {Buffer} from 'buffer'

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
    readonly tokenId: Portfolio.Token.Id
    readonly policyId: string
    readonly name: string
  }>
}

/**
 * Extract policy ID from token ID (first 56 hex chars before the dot)
 */
function toPolicyId(tokenId: Portfolio.Token.Id): string {
  return tokenId.split('.')[0] ?? ''
}

/**
 * Extract asset name hex from token ID (part after the dot)
 */
function toAssetNameHex(tokenId: Portfolio.Token.Id): string {
  return tokenId.split('.')[1] ?? ''
}

/**
 * Convert RawUtxo to ModernUtxo
 * @param rawUtxo - Raw UTXO from API (can be from wallet types or tx utils)
 * @param addressing - Optional addressing for signing
 * @param derivationPath - Optional derivation path for display
 * @param primaryTokenId - Primary token ID (typically '' for ADA)
 */
export function rawUtxoToModernUtxo(
  rawUtxo: {
    readonly amount: string
    readonly receiver: string
    readonly tx_hash: string
    readonly tx_index: number
    readonly utxo_id: string
    readonly assets: ReadonlyArray<{
      readonly amount: string
      readonly tokenId: Portfolio.Token.Id
      readonly policyId: string
      readonly name: string
    }>
  },
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
    balance[asset.tokenId] = asset.amount as Balance.Quantity
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
 *
 * @param csl - WasmModuleProxy instance. Must be provided from the calling scope.
 *
 * WARNING: Returns a WASM TransactionUnspentOutput object that will be freed when
 * the cslScope exits. Only use the returned object within the same scope where
 * it was created, or extract primitive values before the scope exits.
 */
function toTransactionUnspentOutput(
  this: ModernUtxo,
  csl: WasmModuleProxy,
): TransactionUnspentOutput {
  const input = csl.TransactionInput.new(
    csl.TransactionHash.fromHex(this.txHash),
    this.txIndex,
  )

  const primaryTokenId = '.'
  const adaAmount = this.balance[primaryTokenId] ?? '0'
  const value = csl.Value.new(csl.BigNum.fromStr(adaAmount))

  // Get all token IDs except primary token
  const tokenIds = Object.keys(this.balance).filter(
    (id) => id !== primaryTokenId,
  ) as Portfolio.Token.Id[]

  if (tokenIds.length > 0) {
    const multiAsset = csl.MultiAsset.new()

    // Group tokens by policy ID
    const groupedByPolicyId = tokenIds.reduce(
      (acc, tokenId) => {
        const policyId = toPolicyId(tokenId)
        acc[policyId] = acc[policyId] ?? []
        acc[policyId]!.push(tokenId)
        return acc
      },
      {} as Record<string, Array<Portfolio.Token.Id>>,
    )

    // Create MultiAsset structure
    for (const policyIdStr of Object.keys(groupedByPolicyId)) {
      const tokenGroup = groupedByPolicyId[policyIdStr]
      if (!tokenGroup) continue

      const policyId = csl.ScriptHash.fromBytes(
        new Uint8Array(Buffer.from(policyIdStr, 'hex')),
      )
      const assets = csl.Assets.new()

      for (const tokenId of tokenGroup) {
        const assetNameHex = toAssetNameHex(tokenId)
        const name = csl.AssetName.new(
          new Uint8Array(Buffer.from(assetNameHex, 'hex')),
        )
        const amount = csl.BigNum.fromStr(this.balance[tokenId] ?? '0')
        assets.insert(name, amount)
      }

      multiAsset.insert(policyId, assets)
    }

    value.setMultiasset(multiAsset)
  }

  const receiver = csl.Address.fromBech32(this.receiver)
  if (!receiver) throw new Error('Invalid receiver address')
  const output = csl.TransactionOutput.new(receiver, value)

  return csl.TransactionUnspentOutput.new(input, output)
}
