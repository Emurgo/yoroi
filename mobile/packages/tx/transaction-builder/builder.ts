// Functional Transaction Builder using CSL TransactionBuilder directly
import {Balance} from '@yoroi/types'

import type {
  TransactionBuilder as CSLTransactionBuilder,
  TransactionOutput as CSLTransactionOutput,
  Certificate,
  Value,
  WasmModuleProxy,
} from '@emurgo/cross-csl-core'
import {Buffer} from 'buffer'

import {NoOutputsError, NotEnoughMoneyToSendError} from '../errors'
import {CardanoHaskellConfig, Datum} from '../types'
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
 * Transaction builder state (immutable)
 */
export type TransactionBuilderState = {
  inputs: TransactionInput[]
  outputs: TransactionOutput[]
  certificates: TransactionCertificate[]
  withdrawals: TransactionWithdrawal[]
  referenceInputs: TransactionReferenceInput[]
  collateralInputs: TransactionInput[]
  metadata: TransactionMetadata[]
  options: TransactionOptions
  excludedUtxos: Set<string>
}

/**
 * Create initial transaction builder state
 */
export function createTransactionBuilder(): TransactionBuilderState {
  return {
    inputs: [],
    outputs: [],
    certificates: [],
    withdrawals: [],
    referenceInputs: [],
    collateralInputs: [],
    metadata: [],
    options: {},
    excludedUtxos: new Set(),
  }
}

/**
 * Get exclusion key for a UTXO
 */
function getExclusionKey(txHash: string, txIndex: number): string {
  return `${txHash}:${txIndex}`
}

/**
 * Check if a UTXO is excluded
 */
function isExcluded(utxo: ModernUtxo, excludedUtxos: Set<string>): boolean {
  return excludedUtxos.has(getExclusionKey(utxo.txHash, utxo.txIndex))
}

// Input operations
export function addInput(
  state: TransactionBuilderState,
  utxo: ModernUtxo,
): TransactionBuilderState {
  return {
    ...state,
    inputs: [...state.inputs, {utxo}],
  }
}

export function addInputs(
  state: TransactionBuilderState,
  utxos: ModernUtxo[],
): TransactionBuilderState {
  return utxos.reduce((acc, utxo) => addInput(acc, utxo), state)
}

export function removeInput(
  state: TransactionBuilderState,
  txHash: string,
  txIndex: number,
): TransactionBuilderState {
  return {
    ...state,
    inputs: state.inputs.filter(
      (input) => input.utxo.txHash !== txHash || input.utxo.txIndex !== txIndex,
    ),
  }
}

// Output operations
export function addOutput(
  state: TransactionBuilderState,
  address: string,
  amounts: Balance.Amounts,
  datum?: Datum,
): TransactionBuilderState {
  return {
    ...state,
    outputs: [...state.outputs, {address, amounts, datum}],
  }
}

export function addOutputs(
  state: TransactionBuilderState,
  outputs: TransactionOutput[],
): TransactionBuilderState {
  return {
    ...state,
    outputs: [...state.outputs, ...outputs],
  }
}

// Certificate operations
export function addCertificate(
  state: TransactionBuilderState,
  cert: Certificate,
): TransactionBuilderState {
  return {
    ...state,
    certificates: [...state.certificates, {cert}],
  }
}

export function addCertificates(
  state: TransactionBuilderState,
  certs: Certificate[],
): TransactionBuilderState {
  return certs.reduce((acc, cert) => addCertificate(acc, cert), state)
}

// Withdrawal operations
export function addWithdrawal(
  state: TransactionBuilderState,
  rewardAddress: string,
  amount: string,
): TransactionBuilderState {
  return {
    ...state,
    withdrawals: [...state.withdrawals, {rewardAddress, amount}],
  }
}

// Reference input operations
export function addReferenceInput(
  state: TransactionBuilderState,
  utxo: ModernUtxo,
): TransactionBuilderState {
  return {
    ...state,
    referenceInputs: [...state.referenceInputs, {utxo}],
  }
}

// Collateral input operations
export function addCollateralInput(
  state: TransactionBuilderState,
  utxo: ModernUtxo,
): TransactionBuilderState {
  return {
    ...state,
    collateralInputs: [...state.collateralInputs, {utxo}],
  }
}

export function addCollateralInputs(
  state: TransactionBuilderState,
  utxos: ModernUtxo[],
): TransactionBuilderState {
  return utxos.reduce((acc, utxo) => addCollateralInput(acc, utxo), state)
}

export function removeCollateralInput(
  state: TransactionBuilderState,
  txHash: string,
  txIndex: number,
): TransactionBuilderState {
  return {
    ...state,
    collateralInputs: state.collateralInputs.filter(
      (input) => input.utxo.txHash !== txHash || input.utxo.txIndex !== txIndex,
    ),
  }
}

// UTXO exclusion operations
export function excludeUtxo(
  state: TransactionBuilderState,
  txHash: string,
  txIndex: number,
): TransactionBuilderState {
  const newExcluded = new Set(state.excludedUtxos)
  newExcluded.add(getExclusionKey(txHash, txIndex))
  return {
    ...state,
    excludedUtxos: newExcluded,
  }
}

export function excludeUtxos(
  state: TransactionBuilderState,
  utxos: ModernUtxo[],
): TransactionBuilderState {
  return utxos.reduce(
    (acc, utxo) => excludeUtxo(acc, utxo.txHash, utxo.txIndex),
    state,
  )
}

// Metadata operations
export function addMetadata(
  state: TransactionBuilderState,
  label: string,
  data: any,
): TransactionBuilderState {
  return {
    ...state,
    metadata: [...state.metadata, {label, data}],
  }
}

// Options operations
export function setChangeAddress(
  state: TransactionBuilderState,
  address: string,
): TransactionBuilderState {
  return {
    ...state,
    options: {...state.options, changeAddress: address},
  }
}

export function setChangeOutput(
  state: TransactionBuilderState,
  address: string,
  amounts: Balance.Amounts,
): TransactionBuilderState {
  return {
    ...state,
    options: {
      ...state.options,
      manualChangeOutput: {address, amounts},
    },
  }
}

export function setFee(
  state: TransactionBuilderState,
  amounts: Balance.Amounts,
): TransactionBuilderState {
  return {
    ...state,
    options: {...state.options, manualFee: amounts},
  }
}

export function setTTL(
  state: TransactionBuilderState,
  slot: number,
): TransactionBuilderState {
  return {
    ...state,
    options: {...state.options, ttl: slot},
  }
}

export function setValidityInterval(
  state: TransactionBuilderState,
  start: number,
  end: number,
): TransactionBuilderState {
  return {
    ...state,
    options: {
      ...state.options,
      validityInterval: {start, end},
    },
  }
}

/**
 * Validate transaction state before building
 */
function validateInputs(state: TransactionBuilderState): void {
  // Check that excluded UTXOs are not in inputs
  for (const input of state.inputs) {
    if (isExcluded(input.utxo, state.excludedUtxos)) {
      throw new Error(
        `UTXO ${input.utxo.txHash}:${input.utxo.txIndex} is excluded but used as input`,
      )
    }
  }

  // Check that excluded UTXOs are not in collateral
  for (const collateral of state.collateralInputs) {
    if (isExcluded(collateral.utxo, state.excludedUtxos)) {
      throw new Error(
        `UTXO ${collateral.utxo.txHash}:${collateral.utxo.txIndex} is excluded but used as collateral`,
      )
    }
  }
}

/**
 * Calculate total value from inputs
 */
function calculateTotalInputValue(inputs: TransactionInput[]): Balance.Amounts {
  const total: Balance.Amounts = {} as Balance.Amounts
  for (const input of inputs) {
    for (const [tokenId, quantity] of Object.entries(input.utxo.balance)) {
      const current = BigInt(total[tokenId] || '0')
      const added = BigInt(quantity)
      total[tokenId] = (current + added).toString() as Balance.Quantity
    }
  }
  return total
}

/**
 * Calculate total value from outputs
 */
function calculateTotalOutputValue(
  outputs: TransactionOutput[],
  manualChangeOutput?: TransactionOutput,
): Balance.Amounts {
  const total: Balance.Amounts = {} as Balance.Amounts
  for (const output of outputs) {
    for (const [tokenId, quantity] of Object.entries(output.amounts)) {
      const current = BigInt(total[tokenId] || '0')
      const added = BigInt(quantity)
      total[tokenId] = (current + added).toString() as Balance.Quantity
    }
  }
  if (manualChangeOutput) {
    for (const [tokenId, quantity] of Object.entries(
      manualChangeOutput.amounts,
    )) {
      const current = BigInt(total[tokenId] || '0')
      const added = BigInt(quantity)
      total[tokenId] = (current + added).toString() as Balance.Quantity
    }
  }
  return total
}

/**
 * Convert Balance.Amounts to CSL Value
 */
async function amountsToValue(
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
async function outputToCSL(
  wasm: WasmModuleProxy,
  output: TransactionOutput,
  primaryTokenId: string = '',
): Promise<CSLTransactionOutput> {
  const address = wasm.Address.fromBech32(output.address)
  if (!address) throw new Error(`Invalid address: ${output.address}`)

  const value = await amountsToValue(wasm, output.amounts, primaryTokenId)
  const cslOutput = wasm.TransactionOutput.new(address, value)

  // Add datum if present
  if (output.datum) {
    // TODO: Handle datum properly (inline datum vs datum hash)
    // For now, we'll skip datum handling as it requires more complex logic
  }

  return cslOutput
}

/**
 * Create CSL TransactionBuilder with config
 */
async function createCSLTransactionBuilder(
  wasm: WasmModuleProxy,
  params: CardanoHaskellConfig,
): Promise<CSLTransactionBuilder> {
  // Create LinearFee
  const linearFee = await wasm.LinearFee.new(
    await wasm.BigNum.fromStr(params.linearFee.coefficient),
    await wasm.BigNum.fromStr(params.linearFee.constant),
  )

  // Create other protocol params
  const poolDeposit = await wasm.BigNum.fromStr(params.poolDeposit)
  const keyDeposit = await wasm.BigNum.fromStr(params.keyDeposit)
  const coinsPerUtxoByte = await wasm.BigNum.fromStr(params.coinsPerUtxoByte)

  // Create ExUnitPrices (for Plutus)
  const unitPrice = await wasm.ExUnitPrices.new(
    await wasm.UnitInterval.new(
      await wasm.BigNum.fromStr('577'),
      await wasm.BigNum.fromStr('10000'),
    ),
    await wasm.UnitInterval.new(
      await wasm.BigNum.fromStr('721'),
      await wasm.BigNum.fromStr('10000000'),
    ),
  )

  // Build config - chain builder methods
  let configBuilder = await wasm.TransactionBuilderConfigBuilder.new()
  configBuilder = await configBuilder.feeAlgo(linearFee)
  configBuilder = await configBuilder.poolDeposit(poolDeposit)
  configBuilder = await configBuilder.keyDeposit(keyDeposit)
  configBuilder = await configBuilder.coinsPerUtxoByte(coinsPerUtxoByte)
  configBuilder = await configBuilder.maxValueSize(5000)
  configBuilder = await configBuilder.maxTxSize(16384)
  configBuilder = await configBuilder.exUnitPrices(unitPrice)
  configBuilder = await configBuilder.preferPureChange(true)

  const config = await configBuilder.build()
  return await wasm.TransactionBuilder.new(config)
}

/**
 * Build transaction using CSL TransactionBuilder
 */
export async function buildTransaction(
  wasm: WasmModuleProxy,
  state: TransactionBuilderState,
  protocolParams: CardanoHaskellConfig,
  primaryTokenId: string = '',
): Promise<UnsignedTransaction> {
  // Validate inputs
  validateInputs(state)

  // Basic validation
  if (state.outputs.length === 0) {
    throw new NoOutputsError()
  }

  // Create CSL TransactionBuilder
  const cslTxBuilder = await createCSLTransactionBuilder(wasm, protocolParams)

  // Add outputs first (CSL builder needs outputs to calculate fees)
  for (const output of state.outputs) {
    const cslOutput = await outputToCSL(wasm, output, primaryTokenId)
    await cslTxBuilder.addOutput(cslOutput)
  }

  // Add certificates
  if (state.certificates.length > 0) {
    const certs = await wasm.Certificates.new()
    for (const cert of state.certificates) {
      await certs.add(cert.cert)
    }
    await cslTxBuilder.setCerts(certs)
  }

  // Add withdrawals
  if (state.withdrawals.length > 0) {
    const withdrawals = await wasm.Withdrawals.new()
    for (const withdrawal of state.withdrawals) {
      const rewardAddr = await wasm.RewardAddress.fromAddress(
        await wasm.Address.fromBech32(withdrawal.rewardAddress),
      )
      if (!rewardAddr) {
        throw new Error(`Invalid reward address: ${withdrawal.rewardAddress}`)
      }
      const amount = await wasm.BigNum.fromStr(withdrawal.amount)
      await withdrawals.insert(rewardAddr, amount)
    }
    await cslTxBuilder.setWithdrawals(withdrawals)
  }

  // Set TTL
  if (state.options.ttl) {
    await cslTxBuilder.setTtl(state.options.ttl)
  }

  // Add inputs (UTXOs) - CSL TransactionBuilder uses addRegularInput
  for (const input of state.inputs) {
    const utxo = input.utxo
    const wasmAddr = await wasm.Address.fromBech32(utxo.receiver)
    if (!wasmAddr) {
      throw new Error(`Invalid address: ${utxo.receiver}`)
    }
    const txInput = await wasm.TransactionInput.new(
      await wasm.TransactionHash.fromHex(utxo.txHash),
      utxo.txIndex,
    )
    const wasmAmount = await amountsToValue(wasm, utxo.balance, primaryTokenId)
    await cslTxBuilder.addRegularInput(wasmAddr, txInput, wasmAmount)
  }

  // Handle manual fee
  if (state.options.manualFee) {
    const feeAmount = state.options.manualFee[primaryTokenId] || '0'
    const feeBigNum = await wasm.BigNum.fromStr(feeAmount)
    await cslTxBuilder.setFee(feeBigNum)
  }

  // Handle change output
  if (state.options.manualChangeOutput) {
    const cslChangeOutput = await outputToCSL(
      wasm,
      state.options.manualChangeOutput,
      primaryTokenId,
    )
    await cslTxBuilder.addOutput(cslChangeOutput)
  } else if (state.options.changeAddress && !state.options.manualFee) {
    // Use CSL's automatic change handling
    const changeAddr = await wasm.Address.fromBech32(
      state.options.changeAddress,
    )
    if (!changeAddr) {
      throw new Error(`Invalid change address: ${state.options.changeAddress}`)
    }
    await cslTxBuilder.addChangeIfNeeded(changeAddr)
  }

  // Add metadata
  if (state.metadata.length > 0) {
    const auxData = await wasm.AuxiliaryData.new()
    const metadataMap = await wasm.GeneralTransactionMetadata.new()

    for (const meta of state.metadata) {
      const label =
        typeof meta.label === 'string' ? parseInt(meta.label, 10) : meta.label
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
    await cslTxBuilder.setAuxiliaryData(auxData)
  }

  // Build the transaction body
  const txBody = await cslTxBuilder.build()

  // Handle reference inputs and collateral inputs
  // CSL TransactionBuilder doesn't support these directly
  // TODO: Check CSL API for reference/collateral inputs support
  // For now, we'll note that these are in the state but not yet added to the transaction
  // They will be included in the returned UnsignedTransaction for future processing

  // Handle validity interval
  // CSL TransactionBuilder may support this via setValidityStartInterval
  // TODO: Check CSL API for validity interval support

  // Get fee from builder
  const feeBigNum = await cslTxBuilder.getFeeIfSet()
  const feeStr = feeBigNum ? await feeBigNum.toStr() : '0'
  const fee: Balance.Amounts = feeBigNum
    ? ({[primaryTokenId]: feeStr} as Balance.Amounts)
    : state.options.manualFee || {}

  // Validate sufficient funds
  const totalInput = calculateTotalInputValue(state.inputs)
  const totalOutput = calculateTotalOutputValue(
    state.outputs,
    state.options.manualChangeOutput,
  )
  const feeAda = BigInt(fee[primaryTokenId] || '0')
  const inputAda = BigInt(totalInput[primaryTokenId] || '0')
  const outputAda = BigInt(totalOutput[primaryTokenId] || '0')

  if (inputAda < outputAda + feeAda) {
    throw new NotEnoughMoneyToSendError()
  }

  // Serialize to CBOR
  const cbor = Buffer.from(await txBody.toBytes()).toString('hex')

  return {
    inputs: state.inputs,
    outputs: state.outputs,
    certificates: state.certificates,
    withdrawals: state.withdrawals,
    referenceInputs: state.referenceInputs,
    collateralInputs: state.collateralInputs,
    metadata: state.metadata.length > 0 ? state.metadata : undefined,
    options: state.options,
    cbor,
  }
}

/**
 * Build transaction as CBOR hex string for multiparty signing
 */
export async function buildTransactionCBOR(
  wasm: WasmModuleProxy,
  state: TransactionBuilderState,
  protocolParams: CardanoHaskellConfig,
  primaryTokenId: string = '',
): Promise<string> {
  const unsignedTx = await buildTransaction(
    wasm,
    state,
    protocolParams,
    primaryTokenId,
  )
  if (unsignedTx.cbor) {
    return unsignedTx.cbor
  }
  throw new Error('Failed to build transaction CBOR')
}

/**
 * Check if transaction is ready to be signed
 */
export function isTransactionReady(state: TransactionBuilderState): boolean {
  return state.inputs.length > 0 && state.outputs.length > 0
}

/**
 * Get current builder state (for debugging/inspection)
 */
export function getTransactionState(
  state: TransactionBuilderState,
): TransactionBuilderState {
  return {
    ...state,
    excludedUtxos: new Set(state.excludedUtxos), // Clone Set
  }
}
