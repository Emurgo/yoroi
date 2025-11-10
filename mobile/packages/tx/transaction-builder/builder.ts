import {Balance} from '@yoroi/types'

import type {
  Certificate,
  TransactionBody,
  TransactionInput as CSLTransactionInput,
  TransactionOutput as CSLTransactionOutput,
  TransactionUnspentOutput,
  Value,
  WasmModuleProxy,
} from '@emurgo/cross-csl-core'
import {Buffer} from 'buffer'

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
   * Convert Balance.Amounts to CSL Value
   */
  private async amountsToValue(
    wasm: WasmModuleProxy,
    amounts: Balance.Amounts,
    primaryTokenId: string = '',
  ): Promise<Value> {
    const adaAmount = amounts[primaryTokenId] || '0'
    const value = wasm.Value.new(wasm.BigNum.fromStr(adaAmount))

    // Get all asset IDs except primary token
    const assetIds = Object.keys(amounts).filter((id) => id !== primaryTokenId)

    if (assetIds.length > 0) {
      const multiAsset = wasm.MultiAsset.new()

      // Group assets by policy ID
      const groupedByPolicyId = assetIds.reduce(
        (acc, assetId) => {
          const policyId = assetId.substring(0, 56) // Policy ID is first 56 hex chars
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
          const assetNameHex = assetId.substring(56) // Asset name is after policy ID
          const name = wasm.AssetName.new(
            new Uint8Array(Buffer.from(assetNameHex, 'hex')),
          )
          const amount = wasm.BigNum.fromStr(amounts[assetId] ?? '0')
          assets.insert(name, amount)
        }

        multiAsset.insert(policyId, assets)
      }

      value.setMultiasset(multiAsset)
    }

    return value
  }

  /**
   * Convert TransactionOutput to CSL TransactionOutput
   */
  private async outputToCSL(
    wasm: WasmModuleProxy,
    output: TransactionOutput,
    primaryTokenId: string = '',
  ): Promise<CSLTransactionOutput> {
    const address = wasm.Address.fromBech32(output.address)
    if (!address) throw new Error(`Invalid address: ${output.address}`)

    const value = await this.amountsToValue(wasm, output.amounts, primaryTokenId)

    const cslOutput = wasm.TransactionOutput.new(address, value)

    // Add datum if present
    if (output.datum) {
      // TODO: Handle datum properly (inline datum vs datum hash)
      // For now, we'll skip datum handling as it requires more complex logic
    }

    return cslOutput
  }

  /**
   * Calculate transaction fee using linear fee formula
   */
  private async calculateFee(
    wasm: WasmModuleProxy,
    txBody: TransactionBody,
    params: CardanoHaskellConfig,
  ): Promise<string> {
    // Fee = a * size + b
    // where a = linearFee.coefficient, b = linearFee.constant
    const txSize = Buffer.from(await txBody.toBytes()).length
    const coefficient = BigInt(params.linearFee.coefficient)
    const constant = BigInt(params.linearFee.constant)
    const fee = coefficient * BigInt(txSize) + constant
    return fee.toString()
  }

  /**
   * Build the transaction with WASM
   */
  async build(
    wasm: WasmModuleProxy,
    protocolParams?: CardanoHaskellConfig,
    primaryTokenId: string = '',
  ): Promise<UnsignedTransaction> {
    // Use provided protocol params or stored ones
    const params = protocolParams || this.protocolParams

    // Validate inputs
    this.validateInputs()

    // Basic validation
    if (this.outputs.length === 0) {
      throw new NoOutputsError()
    }

    // Build transaction body
    const txBody = wasm.TransactionBody.new()

    // Add inputs
    const txInputs = wasm.TransactionInputs.new()
    for (const input of this.inputs) {
      const txInput = wasm.TransactionInput.new(
        wasm.TransactionHash.fromHex(input.utxo.txHash),
        input.utxo.txIndex,
      )
      txInputs.add(txInput)
    }
    txBody.setInputs(txInputs)

    // Add outputs
    const txOutputs = wasm.TransactionOutputs.new()
    for (const output of this.outputs) {
      const cslOutput = await this.outputToCSL(wasm, output, primaryTokenId)
      txOutputs.add(cslOutput)
    }
    txBody.setOutputs(txOutputs)

    // Add certificates if any
    if (this.certificates.length > 0) {
      const certs = wasm.Certificates.new()
      for (const cert of this.certificates) {
        certs.add(cert.cert)
      }
      txBody.setCerts(certs)
    }

    // Add withdrawals if any
    if (this.withdrawals.length > 0) {
      const withdrawals = wasm.Withdrawals.new()
      for (const withdrawal of this.withdrawals) {
        const rewardAddr = wasm.RewardAddress.fromAddress(
          wasm.Address.fromBech32(withdrawal.rewardAddress),
        )
        if (!rewardAddr) {
          throw new Error(`Invalid reward address: ${withdrawal.rewardAddress}`)
        }
        const amount = wasm.BigNum.fromStr(withdrawal.amount)
        withdrawals.insert(rewardAddr, amount)
      }
      txBody.setWithdrawals(withdrawals)
    }

    // Add reference inputs if any
    if (this.referenceInputs.length > 0) {
      const refInputs = wasm.TransactionInputs.new()
      for (const refInput of this.referenceInputs) {
        const txInput = wasm.TransactionInput.new(
          wasm.TransactionHash.fromHex(refInput.utxo.txHash),
          refInput.utxo.txIndex,
        )
        refInputs.add(txInput)
      }
      txBody.setReferenceInputs(refInputs)
    }

    // Add collateral inputs if any
    if (this.collateralInputs.length > 0) {
      const collateralInputs = wasm.TransactionInputs.new()
      for (const collateral of this.collateralInputs) {
        const txInput = wasm.TransactionInput.new(
          wasm.TransactionHash.fromHex(collateral.utxo.txHash),
          collateral.utxo.txIndex,
        )
        collateralInputs.add(txInput)
      }
      txBody.setCollateral(collateralInputs)
    }

    // Set TTL if provided
    if (this.options.ttl) {
      txBody.setTtl(this.options.ttl)
    }

    // Set validity interval if provided
    if (this.options.validityInterval) {
      const validityInterval = wasm.TransactionValidityInterval.new()
      if (this.options.validityInterval.start) {
        validityInterval.setInvalidBefore(
          wasm.BigNum.fromStr(this.options.validityInterval.start.toString()),
        )
      }
      if (this.options.validityInterval.end) {
        validityInterval.setInvalidHereafter(
          wasm.BigNum.fromStr(this.options.validityInterval.end.toString()),
        )
      }
      txBody.setValidityStartInterval(validityInterval)
    }

    // Calculate fee if not manual
    let fee: Balance.Amounts = this.options.manualFee || {}
    if (!this.options.manualFee && params) {
      // Initial fee calculation (will be refined after adding change)
      const initialFee = await this.calculateFee(wasm, txBody, params)
      fee = {[primaryTokenId]: initialFee}
    }

    // Add manual change output if set
    if (this.options.manualChangeOutput) {
      const cslChangeOutput = await this.outputToCSL(
        wasm,
        this.options.manualChangeOutput,
        primaryTokenId,
      )
      txOutputs.add(cslChangeOutput)
      txBody.setOutputs(txOutputs)
    }

    // Calculate change if not manual
    if (!this.options.manualChangeOutput && params && this.options.changeAddress) {
      // Iterate to converge on correct fee and change
      let iterations = 0
      const maxIterations = 10
      let currentFee = fee[primaryTokenId] || '0'

      while (iterations < maxIterations) {
        const totalInput = this.calculateTotalInputValue()
        const totalOutput = this.calculateTotalOutputValue()
        const feeAda = BigInt(currentFee)

        const inputAda = BigInt(totalInput[primaryTokenId] || '0')
        const outputAda = BigInt(totalOutput[primaryTokenId] || '0')
        const changeAda = inputAda - outputAda - feeAda

        // Only add change if it's above minimum UTXO value
        const minUtxo = BigInt(params.minimumUtxoVal)
        if (changeAda <= minUtxo) {
          // No change output needed
          break
        }

        // Add/update change output
        const changeOutput: TransactionOutput = {
          address: this.options.changeAddress,
          amounts: {[primaryTokenId]: changeAda.toString()},
        }

        // Rebuild outputs with change
        const updatedOutputs = wasm.TransactionOutputs.new()
        for (const output of this.outputs) {
          const cslOutput = await this.outputToCSL(wasm, output, primaryTokenId)
          updatedOutputs.add(cslOutput)
        }
        const cslChangeOutput = await this.outputToCSL(
          wasm,
          changeOutput,
          primaryTokenId,
        )
        updatedOutputs.add(cslChangeOutput)
        txBody.setOutputs(updatedOutputs)

        // Recalculate fee with change output included
        if (!this.options.manualFee) {
          const recalculatedFee = await this.calculateFee(wasm, txBody, params)
          const newFeeAda = BigInt(recalculatedFee)

          // Check if fee converged
          if (newFeeAda === feeAda) {
            fee = {[primaryTokenId]: recalculatedFee}
            break
          }

          currentFee = recalculatedFee
          fee = {[primaryTokenId]: recalculatedFee}
        } else {
          break
        }

        iterations++
      }
    }

    // Set fee
    const feeValue = await this.amountsToValue(wasm, fee, primaryTokenId)
    const feeCoin = await feeValue.coin()
    txBody.setFee(feeCoin)

    // Validate sufficient funds
    if (params) {
      const totalInput = this.calculateTotalInputValue()
      const totalOutput = this.calculateTotalOutputValue()
      const feeAda = BigInt(fee[primaryTokenId] || '0')

      const inputAda = BigInt(totalInput[primaryTokenId] || '0')
      const outputAda = BigInt(totalOutput[primaryTokenId] || '0')

      if (inputAda < outputAda + feeAda) {
        throw new NotEnoughMoneyToSendError()
      }
    }

    // Build CBOR for the transaction body
    const cbor = Buffer.from(await txBody.toBytes()).toString('hex')

    return {
      inputs: this.inputs,
      outputs: this.outputs,
      certificates: this.certificates,
      withdrawals: this.withdrawals,
      referenceInputs: this.referenceInputs,
      collateralInputs: this.collateralInputs,
      metadata: this.metadata.length > 0 ? this.metadata : undefined,
      options: this.options,
      cbor,
    }
  }

  /**
   * Build transaction as CBOR hex string for multiparty signing
   */
  async buildCBOR(
    wasm: WasmModuleProxy,
    protocolParams?: CardanoHaskellConfig,
    primaryTokenId: string = '',
  ): Promise<string> {
    const unsignedTx = await this.build(wasm, protocolParams, primaryTokenId)
    if (unsignedTx.cbor) {
      return unsignedTx.cbor
    }
    throw new Error('Failed to build transaction CBOR')
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
