// Adapter to convert new UnsignedTransaction format to LedgerUnsignedTx
// This allows Ledger integration to work with the new TransactionBuilder format

import type {
  TransactionBody,
  TransactionOutputs,
  WasmModuleProxy,
  Withdrawals,
  Certificates,
} from '@emurgo/cross-csl-core'
import {Buffer} from 'buffer'

import {Addressing, AddressingAddress} from '../types'
import {UnsignedTransaction} from '../transaction-builder/types'

/**
 * Convert UnsignedTransaction to LedgerUnsignedTx format
 * This adapter allows Ledger functions to work with the new format
 */
export async function adaptToLedgerUnsignedTx(
  wasm: WasmModuleProxy,
  unsignedTx: UnsignedTransaction,
  changeAddresses: Array<AddressingAddress>,
): Promise<{
  senderUtxos: Array<{
    txHash: string
    txIndex: number
    addressing: Addressing
  }>
  txBuilder: {
    build(): Promise<TransactionBody>
  }
  txBody: {
    outputs(): Promise<TransactionOutputs>
    fee(): Promise<{toStr(): Promise<string>}>
  }
  change: Array<AddressingAddress>
  withdrawals?: Withdrawals | null
  certificates?: Certificates | null
  ttl?: number
  auxiliaryData?: {
    hasValue(): Promise<boolean>
    toBytes(): Promise<Uint8Array>
  } | null
  catalystRegistrationData?: unknown
  scriptDataHash?: string
}> {
  // Parse CBOR to get transaction body
  if (!unsignedTx.cbor) {
    throw new Error('UnsignedTransaction must have CBOR to convert to Ledger format')
  }

  const txBody = await wasm.TransactionBody.fromHex(unsignedTx.cbor)

  // Extract sender UTXOs with addressing
  const senderUtxos = unsignedTx.inputs.map((input) => ({
    txHash: input.utxo.txHash,
    txIndex: input.utxo.txIndex,
    addressing: input.utxo.addressing || {
      path: [],
      startLevel: 0,
    },
  }))

  // Create txBuilder that can build the transaction
  const txBuilder = {
    async build(): Promise<TransactionBody> {
      return txBody
    },
  }

  // Extract outputs
  const outputs = await txBody.outputs()

  // Extract fee
  const fee = await txBody.fee()

  // Extract withdrawals
  let withdrawals: Withdrawals | null = null
  if (unsignedTx.withdrawals.length > 0) {
    withdrawals = await wasm.Withdrawals.new()
    for (const withdrawal of unsignedTx.withdrawals) {
      const rewardAddr = await wasm.RewardAddress.fromAddress(
        await wasm.Address.fromBech32(withdrawal.rewardAddress),
      )
      if (!rewardAddr) {
        throw new Error(`Invalid reward address: ${withdrawal.rewardAddress}`)
      }
      const amount = await wasm.BigNum.fromStr(withdrawal.amount)
      await withdrawals.insert(rewardAddr, amount)
    }
  }

  // Extract certificates
  let certificates: Certificates | null = null
  if (unsignedTx.certificates.length > 0) {
    certificates = await wasm.Certificates.new()
    for (const certWrapper of unsignedTx.certificates) {
      await certificates.add(certWrapper.cert)
    }
  }

  // Extract TTL
  const ttl = unsignedTx.options.ttl

  // Extract auxiliary data from metadata
  let auxiliaryData: {
    hasValue(): Promise<boolean>
    toBytes(): Promise<Uint8Array>
  } | null = null

  if (unsignedTx.metadata && unsignedTx.metadata.length > 0) {
    // Create auxiliary data from metadata
    const auxData = await wasm.AuxiliaryData.new()
    const metadataMap = await wasm.GeneralTransactionMetadata.new()

    for (const meta of unsignedTx.metadata) {
      const label = typeof meta.label === 'string' ? parseInt(meta.label, 10) : meta.label
      const metadata = await wasm.encodeJsonStrToMetadatum(
        JSON.stringify(meta.data),
        1, // MetadataJsonSchema.BasicConversions
      )
      await metadataMap.insert(
        await wasm.BigNum.fromStr(label.toString()),
        metadata,
      )
    }

    await auxData.setMetadata(metadataMap)
    auxiliaryData = {
      hasValue: async () => true,
      toBytes: async () => await auxData.toBytes(),
    }
  }

  return {
    senderUtxos,
    txBuilder,
    txBody: {
      outputs: async () => outputs,
      fee: async () => ({
        toStr: async () => await fee.toStr(),
      }),
    },
    change: changeAddresses,
    withdrawals,
    certificates,
    ttl,
    auxiliaryData,
  }
}

