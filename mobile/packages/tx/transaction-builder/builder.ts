import {Balance} from '@yoroi/types'

import type {Certificate, WasmModuleProxy} from '@emurgo/cross-csl-core'

import {Datum} from '../types'
import {ModernUtxo} from '../utxo/models'
import {
  TransactionCertificate,
  TransactionInput,
  TransactionMetadata,
  TransactionOptions,
  TransactionOutput,
  TransactionReferenceInput,
  TransactionWithdrawal,
  UnsignedTransaction,
} from './types'

/**
 * Flexible Transaction Builder for Cardano transactions
 *
 * Supports:
 * - Manual UTXO selection
 * - Multiple certificates
 * - Reference inputs
 * - Building to CBOR for multiparty signing
 * - All Cardano transaction features
 */
export class TransactionBuilder {
  private inputs: TransactionInput[] = []
  private outputs: TransactionOutput[] = []
  private certificates: TransactionCertificate[] = []
  private withdrawals: TransactionWithdrawal[] = []
  private referenceInputs: TransactionReferenceInput[] = []
  private metadata: TransactionMetadata[] = []
  private options: TransactionOptions = {}

  // Inputs
  addInput(utxo: ModernUtxo): TransactionBuilder {
    this.inputs.push({utxo})
    return this
  }

  addInputs(utxos: ModernUtxo[]): TransactionBuilder {
    utxos.forEach((utxo) => this.addInput(utxo))
    return this
  }

  removeInput(txHash: string, txIndex: number): TransactionBuilder {
    this.inputs = this.inputs.filter(
      (input) => input.utxo.txHash !== txHash || input.utxo.txIndex !== txIndex,
    )
    return this
  }

  // Outputs
  addOutput(
    address: string,
    amounts: Balance.Amounts,
    datum?: Datum,
  ): TransactionBuilder {
    this.outputs.push({address, amounts, datum})
    return this
  }

  addOutputs(outputs: TransactionOutput[]): TransactionBuilder {
    outputs.forEach((output) => this.outputs.push(output))
    return this
  }

  // Certificates
  addCertificate(cert: Certificate): TransactionBuilder {
    this.certificates.push({cert})
    return this
  }

  addCertificates(certs: Certificate[]): TransactionBuilder {
    certs.forEach((cert) => this.addCertificate(cert))
    return this
  }

  // Withdrawals
  addWithdrawal(rewardAddress: string, amount: string): TransactionBuilder {
    this.withdrawals.push({rewardAddress, amount})
    return this
  }

  // Reference Inputs
  addReferenceInput(utxo: ModernUtxo): TransactionBuilder {
    this.referenceInputs.push({utxo})
    return this
  }

  // Metadata
  addMetadata(label: string, data: any): TransactionBuilder {
    this.metadata.push({label, data})
    return this
  }

  // Options
  setChangeAddress(address: string): TransactionBuilder {
    this.options.changeAddress = address
    return this
  }

  setTTL(slot: number): TransactionBuilder {
    this.options.ttl = slot
    return this
  }

  setValidityInterval(start: number, end: number): TransactionBuilder {
    this.options.validityInterval = {start, end}
    return this
  }

  /**
   * Build the transaction (will be implemented with WASM)
   * For now, returns the structured transaction
   */
  async build(_wasm: WasmModuleProxy): Promise<UnsignedTransaction> {
    // TODO: Implement full transaction building with WASM
    // This will include:
    // - Converting inputs/outputs to WASM types
    // - Adding certificates
    // - Adding withdrawals
    // - Adding reference inputs
    // - Calculating fees
    // - Adding change outputs
    // - Building the transaction body

    return {
      inputs: this.inputs,
      outputs: this.outputs,
      certificates: this.certificates,
      withdrawals: this.withdrawals,
      referenceInputs: this.referenceInputs,
      metadata: this.metadata.length > 0 ? this.metadata : undefined,
      options: this.options,
    }
  }

  /**
   * Build transaction as CBOR hex string for multiparty signing
   */
  async buildCBOR(wasm: WasmModuleProxy): Promise<string> {
    const unsignedTx = await this.build(wasm)
    // TODO: Serialize to CBOR using WASM
    // This will:
    // 1. Build the transaction body
    // 2. Serialize to CBOR hex
    // 3. Return the hex string
    if (unsignedTx.cbor) {
      return unsignedTx.cbor
    }
    throw new Error('CBOR serialization not yet implemented')
  }

  /**
   * Load builder state from CBOR
   */
  static async loadFromCBOR(
    _cbor: string,
    _wasm: WasmModuleProxy,
  ): Promise<TransactionBuilder> {
    // TODO: Deserialize CBOR and reconstruct builder state
    // This will:
    // 1. Parse CBOR hex string
    // 2. Extract transaction body components
    // 3. Reconstruct builder with inputs, outputs, certificates, etc.
    const builder = new TransactionBuilder()
    // Parse CBOR and populate builder
    return builder
  }

  /**
   * Check if transaction is ready to be signed (has all required components)
   */
  isReady(): boolean {
    return this.inputs.length > 0 && this.outputs.length > 0
  }

  /**
   * Estimate transaction fee
   */
  async estimateFee(_wasm: WasmModuleProxy): Promise<Balance.Amounts> {
    // TODO: Implement fee estimation
    // This will build a temporary transaction and calculate fees
    return {}
  }

  /**
   * Get current builder state (for debugging/inspection)
   */
  getState(): {
    inputs: TransactionInput[]
    outputs: TransactionOutput[]
    certificates: TransactionCertificate[]
    withdrawals: TransactionWithdrawal[]
    referenceInputs: TransactionReferenceInput[]
    metadata: TransactionMetadata[]
    options: TransactionOptions
  } {
    return {
      inputs: [...this.inputs],
      outputs: [...this.outputs],
      certificates: [...this.certificates],
      withdrawals: [...this.withdrawals],
      referenceInputs: [...this.referenceInputs],
      metadata: [...this.metadata],
      options: {...this.options},
    }
  }
}
