// Adapter to convert new UnsignedTransaction format to LedgerUnsignedTx
// This allows Ledger integration to work with the new TransactionBuilder format
import type {
  Certificates,
  TransactionBody,
  TransactionOutputs,
  WasmModuleProxy,
  Withdrawals,
} from '@emurgo/cross-csl-core'

import {createCertificateFromData} from '../transaction-builder/certificates'
import {UnsignedTransaction} from '../transaction-builder/types'
import {Addressing, AddressingAddress} from '../types'

type LedgerUnsignedTxAdapterResult = {
  senderUtxos: Array<{
    receiver: string
    txHash: string
    txIndex: number
    addressing: Addressing
  }>
  txBuilder: {
    build(): TransactionBody
    setAuxiliaryData(data: TransactionBody): void
  }
  txBody: {
    outputs(): TransactionOutputs
    fee(): {toStr(): string}
  }
  change: Array<AddressingAddress>
  withdrawals?: Withdrawals | null
  certificates?: Certificates | null
  ttl?: number
  auxiliaryData?: {
    hasValue(): boolean
    toBytes(): Uint8Array
  } | null
  catalystRegistrationData?: {
    votingPublicKeyHex: string
    stakingPublicKeyHex: string
    paymentAddress: string
    nonce: number
  }
  scriptDataHash?: string
}

/**
 * Convert UnsignedTransaction to LedgerUnsignedTx format
 * This adapter allows Ledger functions to work with the new format
 *
 * NOTE: This function expects to be called within a cslScope.
 * The returned CSL objects (withdrawals, certificates, txBody) will be valid within that same scope.
 */
export function adaptToLedgerUnsignedTx(
  csl: WasmModuleProxy,
  unsignedTx: UnsignedTransaction,
  changeAddresses: Array<AddressingAddress>,
): LedgerUnsignedTxAdapterResult {
  // Parse CBOR to get transaction body
  if (!unsignedTx.cbor) {
    throw new Error(
      'UnsignedTransaction must have CBOR to convert to Ledger format',
    )
  }

  const tx = csl.Transaction.fromHex(unsignedTx.cbor!)
  const txBody = tx.body()

  // Extract sender UTXOs with addressing
  const senderUtxos = unsignedTx.inputs.map((input) => ({
    receiver: input.utxo.receiver,
    txHash: input.utxo.txHash,
    txIndex: input.utxo.txIndex,
    addressing: input.utxo.addressing || {
      path: [],
      startLevel: 0,
    },
  }))

  // Create txBuilder that returns the actual transaction body
  const txBuilder = {
    build(): TransactionBody {
      return txBody
    },
    setAuxiliaryData(_data: TransactionBody): void {
      // Auxiliary data is already in the transaction body from CBOR
      // This method is provided for interface compatibility
    },
  }

  // Extract withdrawals
  let withdrawals: Withdrawals | null = null
  if (unsignedTx.withdrawals.length > 0) {
    withdrawals = csl.Withdrawals.new()
    for (const withdrawal of unsignedTx.withdrawals) {
      const rewardAddr = csl.RewardAddress.fromAddress(
        csl.Address.fromBech32(withdrawal.rewardAddress),
      )
      if (!rewardAddr) {
        throw new Error(`Invalid reward address: ${withdrawal.rewardAddress}`)
      }
      const amount = csl.BigNum.fromStr(withdrawal.amount)
      withdrawals.insert(rewardAddr, amount)
    }
  }

  // Extract certificates - create CSL Certificate objects from certificate data within this CSL scope
  // NOTE: This duplicates the logic from builder.ts to avoid CSL instance mixing
  // Both functions create certificates within their own CSL scopes
  let certificates: Certificates | null = null
  if (unsignedTx.certificates.length > 0) {
    certificates = csl.Certificates.new()
    for (const certData of unsignedTx.certificates) {
      // Create certificate using shared helper
      const cslCert = createCertificateFromData(csl, certData)
      certificates.add(cslCert)
    }
  }

  // Extract TTL
  const ttl = unsignedTx.options.ttl

  // Extract auxiliary data from metadata
  let auxiliaryDataBytes: Uint8Array | null = null
  let hasAuxiliaryData = false

  if (unsignedTx.metadata && unsignedTx.metadata.length > 0) {
    // Create auxiliary data from metadata
    const auxData = csl.AuxiliaryData.new()
    const metadataMap = csl.GeneralTransactionMetadata.new()

    for (const meta of unsignedTx.metadata) {
      const label =
        typeof meta.label === 'string' ? parseInt(meta.label, 10) : meta.label
      const metadata = csl.encodeJsonStrToMetadatum(
        JSON.stringify(meta.data),
        1, // MetadataJsonSchema.BasicConversions
      )
      metadataMap.insert(csl.BigNum.fromStr(label.toString()), metadata)
    }

    auxData.setMetadata(metadataMap)
    auxiliaryDataBytes = auxData.toBytes()
    hasAuxiliaryData = true
  }

  return {
    senderUtxos,
    txBuilder,
    txBody: {
      outputs: () => txBody.outputs(),
      fee: () => ({
        toStr: () => txBody.fee().toStr(),
      }),
    },
    change: changeAddresses,
    withdrawals,
    certificates,
    ttl,
    auxiliaryData: {
      hasValue: () => hasAuxiliaryData,
      toBytes: () => {
        if (!auxiliaryDataBytes) {
          throw new Error('No auxiliary data')
        }
        return auxiliaryDataBytes
      },
    },
  }
}
