// Adapter to convert new UnsignedTransaction format to LedgerUnsignedTx
// This allows Ledger integration to work with the new TransactionBuilder format
import type {
  Certificates,
  TransactionBody,
  TransactionOutputs,
  Withdrawals,
} from '@emurgo/cross-csl-core'

import {CardanoMobileWrapped} from '../../../src/wallets/cardano/wrappedCsl'
import {UnsignedTransaction} from '../transaction-builder/types'
import {Addressing, AddressingAddress} from '../types'

/**
 * Convert UnsignedTransaction to LedgerUnsignedTx format
 * This adapter allows Ledger functions to work with the new format
 */
export async function adaptToLedgerUnsignedTx(
  unsignedTx: UnsignedTransaction,
  changeAddresses: Array<AddressingAddress>,
): Promise<{
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
}> {
  // Parse CBOR to get transaction body
  if (!unsignedTx.cbor) {
    throw new Error(
      'UnsignedTransaction must have CBOR to convert to Ledger format',
    )
  }

  return CardanoMobileWrapped.cslScope((csl) => {
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

    // Extract all needed values before scope exits to avoid WASM pointer issues
    const feeStr = txBody.fee().toStr()
    // Store CBOR hex for rebuilding transaction body in new scopes
    const cborHex = unsignedTx.cbor!

    // Create txBuilder that rebuilds transaction body from CBOR when called
    const txBuilder = {
      build(): TransactionBody {
        // This method must be called within a cslScope
        // Rebuild transaction from CBOR to get body in current scope
        return CardanoMobileWrapped.cslScope((csl) => {
          const rebuiltTx = csl.Transaction.fromHex(cborHex)
          return rebuiltTx.body()
        })
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
        if (withdrawals) {
          withdrawals.insert(rewardAddr, amount)
        }
      }
    }

    // Extract certificates
    let certificates: Certificates | null = null
    if (unsignedTx.certificates.length > 0) {
      certificates = csl.Certificates.new()
      for (const certWrapper of unsignedTx.certificates) {
        if (certificates) {
          certificates.add(certWrapper.cert)
        }
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
        outputs: () => {
          // This method must be called within a cslScope
          // Rebuild transaction from CBOR to get outputs in current scope
          return CardanoMobileWrapped.cslScope((csl) => {
            const rebuiltTx = csl.Transaction.fromHex(cborHex)
            return rebuiltTx.body().outputs()
          })
        },
        fee: () => ({
          toStr: () => feeStr,
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
  })
}
