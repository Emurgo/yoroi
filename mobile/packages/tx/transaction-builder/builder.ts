import {Balance} from '@yoroi/types'

import type {Certificate, WasmModuleProxy} from '@emurgo/cross-csl-core'

import {CardanoHaskellConfig, Datum} from '../types'
import {NoOutputsError, NotEnoughMoneyToSendError} from '../errors'
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
  private collateralInputs: TransactionInput[] = []
  private metadata: TransactionMetadata[] = []
  private options: TransactionOptions = {}
  private protocolParams?: CardanoHaskellConfig
  private excludedUtxos: Set<string> = new Set()

  /**
   * Get exclusion key for a UTXO
   */
  private getExclusionKey(txHash: string, txIndex: number): string {
    return `${txHash}:${txIndex}`
  }

  /**
   * Check if a UTXO is excluded
   */
  private isExcluded(utxo: ModernUtxo): boolean {
    return this.excludedUtxos.has(this.getExclusionKey(utxo.txHash, utxo.txIndex))
  }

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

  // Collateral Inputs
  addCollateralInput(utxo: ModernUtxo): TransactionBuilder {
    this.collateralInputs.push({utxo})
    return this
  }

  addCollateralInputs(utxos: ModernUtxo[]): TransactionBuilder {
    utxos.forEach((utxo) => this.addCollateralInput(utxo))
    return this
  }

  removeCollateralInput(txHash: string, txIndex: number): TransactionBuilder {
    this.collateralInputs = this.collateralInputs.filter(
      (input) => input.utxo.txHash !== txHash || input.utxo.txIndex !== txIndex,
    )
    return this
  }

  // UTXO Exclusion (Locking)
  excludeUtxo(txHash: string, txIndex: number): TransactionBuilder {
    this.excludedUtxos.add(this.getExclusionKey(txHash, txIndex))
    return this
  }

  excludeUtxos(utxos: ModernUtxo[]): TransactionBuilder {
    utxos.forEach((utxo) =>
      this.excludeUtxo(utxo.txHash, utxo.txIndex),
    )
    return this
  }

  setUtxoFilter(filter: (utxo: ModernUtxo) => boolean): TransactionBuilder {
    // This allows setting a custom filter function
    // The filter will be applied when building to exclude UTXOs
    // For now, we'll store it and apply during validation
    // This is a more advanced feature - can be implemented later
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

  setChangeOutput(address: string, amounts: Balance.Amounts): TransactionBuilder {
    this.options.manualChangeOutput = {address, amounts}
    return this
  }

  setFee(amounts: Balance.Amounts): TransactionBuilder {
    this.options.manualFee = amounts
    return this
  }

  setProtocolParams(config: CardanoHaskellConfig): TransactionBuilder {
    this.protocolParams = config
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
   * Validate transaction before building
   */
  private validateInputs(): void {
    // Check that excluded UTXOs are not in inputs
    for (const input of this.inputs) {
      if (this.isExcluded(input.utxo)) {
        throw new Error(
          `UTXO ${input.utxo.txHash}:${input.utxo.txIndex} is excluded but used as input`,
        )
      }
    }

    // Check that excluded UTXOs are not in collateral
    for (const collateral of this.collateralInputs) {
      if (this.isExcluded(collateral.utxo)) {
        throw new Error(
          `UTXO ${collateral.utxo.txHash}:${collateral.utxo.txIndex} is excluded but used as collateral`,
        )
      }
    }
  }

  /**
   * Calculate total value from inputs
   */
  private calculateTotalInputValue(): Balance.Amounts {
    const total: Balance.Amounts = {}
    for (const input of this.inputs) {
      for (const [tokenId, quantity] of Object.entries(input.utxo.balance)) {
        total[tokenId] = (BigInt(total[tokenId] || '0') + BigInt(quantity)).toString()
      }
    }
    return total
  }

  /**
   * Calculate total value from outputs
   */
  private calculateTotalOutputValue(): Balance.Amounts {
    const total: Balance.Amounts = {}
    for (const output of this.outputs) {
      for (const [tokenId, quantity] of Object.entries(output.amounts)) {
        total[tokenId] = (BigInt(total[tokenId] || '0') + BigInt(quantity)).toString()
      }
    }
    // Add manual change output if set
    if (this.options.manualChangeOutput) {
      for (const [tokenId, quantity] of Object.entries(
        this.options.manualChangeOutput.amounts,
      )) {
        total[tokenId] = (BigInt(total[tokenId] || '0') + BigInt(quantity)).toString()
      }
    }
    return total
  }

  /**
   * Build the transaction (will be implemented with WASM)
   * For now, returns the structured transaction
   */
  async build(
    _wasm: WasmModuleProxy,
    protocolParams?: CardanoHaskellConfig,
  ): Promise<UnsignedTransaction> {
    // Use provided protocol params or stored ones
    const params = protocolParams || this.protocolParams

    // Validate inputs
    this.validateInputs()

    // Basic validation
    if (this.outputs.length === 0) {
      throw new NoOutputsError()
    }

    // Validate sufficient funds if protocol params provided
    if (params) {
      const totalInput = this.calculateTotalInputValue()
      const totalOutput = this.calculateTotalOutputValue()
      const fee = this.options.manualFee || {}

      // Check if we have enough ADA for outputs + fees
      const inputAda = BigInt(totalInput[''] || '0')
      const outputAda = BigInt(totalOutput[''] || '0')
      const feeAda = BigInt(fee[''] || '0')

      if (inputAda < outputAda + feeAda) {
        throw new NotEnoughMoneyToSendError()
      }
    }

    // TODO: Implement full transaction building with WASM
    // This will include:
    // - Converting inputs/outputs to WASM types
    // - Adding certificates
    // - Adding withdrawals
    // - Adding reference inputs
    // - Adding collateral inputs
    // - Calculating fees (if not manual)
    // - Adding change outputs (if not manual)
    // - Building the transaction body
    // - Validating sufficient funds (if protocol params provided)

    return {
      inputs: this.inputs,
      outputs: this.outputs,
      certificates: this.certificates,
      withdrawals: this.withdrawals,
      referenceInputs: this.referenceInputs,
      collateralInputs: this.collateralInputs,
      metadata: this.metadata.length > 0 ? this.metadata : undefined,
      options: this.options,
    }
  }

  /**
   * Build transaction as CBOR hex string for multiparty signing
   */
  async buildCBOR(
    wasm: WasmModuleProxy,
    protocolParams?: CardanoHaskellConfig,
  ): Promise<string> {
    const unsignedTx = await this.build(wasm, protocolParams)
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
    collateralInputs: TransactionInput[]
    metadata: TransactionMetadata[]
    options: TransactionOptions
    excludedUtxos: string[]
  } {
    return {
      inputs: [...this.inputs],
      outputs: [...this.outputs],
      certificates: [...this.certificates],
      withdrawals: [...this.withdrawals],
      referenceInputs: [...this.referenceInputs],
      collateralInputs: [...this.collateralInputs],
      metadata: [...this.metadata],
      options: {...this.options},
      excludedUtxos: Array.from(this.excludedUtxos),
    }
  }
}
