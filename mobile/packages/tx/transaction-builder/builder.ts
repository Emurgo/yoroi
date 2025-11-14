// Functional Transaction Builder using CSL TransactionBuilder directly
import {Balance, Portfolio} from '@yoroi/types'

import type {
  TransactionBuilder as CSLTransactionBuilder,
  TransactionOutput as CSLTransactionOutput,
  Certificate,
  Value,
  WasmModuleProxy,
} from '@emurgo/cross-csl-core'
import {Buffer} from 'buffer'

import {getTokenIdParts} from '../../../src/features/Portfolio/common/helpers/get-token-id-parts'
import {CardanoMobileWrapped} from '../../../src/wallets/cardano/wrappedCsl'
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

/**
 * Set TTL with a buffer to account for signing and submission delays
 * Default buffer is 7200 slots (2 hours on mainnet, ~1 slot/second)
 * This ensures transactions don't expire before they can be submitted
 */
export function setTTLWithBuffer(
  state: TransactionBuilderState,
  slotNumber: number,
  bufferSlots: number = 7200,
): TransactionBuilderState {
  return setTTL(state, slotNumber + bufferSlots)
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
function amountsToValue(
  csl: WasmModuleProxy,
  amounts: Balance.Amounts,
  primaryTokenId: Portfolio.Token.Id = '.',
): Value {
  // Import logger dynamically to avoid circular dependencies
  const logger = require('../../../src/kernel/logger/logger').logger

  const adaAmount = amounts[primaryTokenId] || '0'

  const adaBigNum = csl.BigNum.fromStr(adaAmount)
  if (!adaBigNum) {
    logger.error('amountsToValue: Failed to create BigNum from ADA amount', {
      adaAmount,
    })
    throw new Error(`Failed to create BigNum from ADA amount: ${adaAmount}`)
  }

  const value = csl.Value.new(adaBigNum)
  if (!value) {
    logger.error('amountsToValue: Failed to create Value', {
      adaAmount,
    })
    throw new Error(`Failed to create Value from ADA amount: ${adaAmount}`)
  }

  // Get all token IDs except primary token
  const tokenIds = Object.keys(amounts).filter((id) => id !== primaryTokenId)

  if (tokenIds.length > 0) {
    const multiAsset = csl.MultiAsset.new()
    if (!multiAsset) {
      logger.error('amountsToValue: Failed to create MultiAsset')
      throw new Error('Failed to create MultiAsset')
    }

    // Group tokens by policy ID
    // tokenId is in format "policyId.assetNameHex" (Portfolio.Token.Id format)
    const groupedByPolicyId = tokenIds.reduce(
      (acc, tokenIdStr) => {
        const tokenId = tokenIdStr as Portfolio.Token.Id
        const {policyId, assetName: assetNameHex} = getTokenIdParts(tokenId)
        if (!policyId || !assetNameHex) {
          // Invalid format, skip
          return acc
        }
        acc[policyId] = acc[policyId] ?? []
        acc[policyId]!.push({tokenId, assetNameHex})
        return acc
      },
      {} as Record<
        string,
        Array<{tokenId: Portfolio.Token.Id; assetNameHex: string}>
      >,
    )

    // Create MultiAsset structure
    for (const policyIdStr of Object.keys(groupedByPolicyId)) {
      const tokenGroup = groupedByPolicyId[policyIdStr]
      if (!tokenGroup) continue

      try {
        const policyId = csl.ScriptHash.fromBytes(
          new Uint8Array(Buffer.from(policyIdStr, 'hex')),
        )
        if (!policyId) {
          logger.error('amountsToValue: Failed to create ScriptHash', {
            policyIdStr,
          })
          throw new Error(
            `Failed to create ScriptHash from policy ID: ${policyIdStr}`,
          )
        }

        const assets = csl.Assets.new()
        if (!assets) {
          logger.error('amountsToValue: Failed to create Assets', {
            policyIdStr,
          })
          throw new Error(`Failed to create Assets for policy: ${policyIdStr}`)
        }

        for (const {tokenId, assetNameHex} of tokenGroup) {
          const name = csl.AssetName.new(
            new Uint8Array(Buffer.from(assetNameHex, 'hex')),
          )
          if (!name) {
            logger.error('amountsToValue: Failed to create AssetName', {
              tokenId,
              assetNameHex,
            })
            throw new Error(`Failed to create AssetName for asset: ${tokenId}`)
          }

          const amount = csl.BigNum.fromStr(amounts[tokenId] ?? '0')
          if (!amount) {
            logger.error(
              'amountsToValue: Failed to create BigNum for asset amount',
              {
                tokenId,
                amount: amounts[tokenId],
              },
            )
            throw new Error(
              `Failed to create BigNum for asset amount: ${amounts[tokenId]}`,
            )
          }

          assets.insert(name, amount)
        }

        multiAsset.insert(policyId, assets)
      } catch (error) {
        logger.error('amountsToValue: Error processing policy assets', {
          policyIdStr,
          error: error instanceof Error ? error.message : String(error),
        })
        throw error
      }
    }

    value.setMultiasset(multiAsset)
  }

  return value
}

/**
 * Convert TransactionOutput to CSL TransactionOutput
 */
function outputToCSL(
  csl: WasmModuleProxy,
  output: TransactionOutput,
  primaryTokenId: Portfolio.Token.Id = '.',
): CSLTransactionOutput {
  // Import logger dynamically to avoid circular dependencies
  const logger = require('../../../src/kernel/logger/logger').logger

  const address = csl.Address.fromBech32(output.address)
  if (!address) {
    logger.error('outputToCSL: Invalid address', {
      address: output.address,
    })
    throw new Error(`Invalid address: ${output.address}`)
  }

  const value = amountsToValue(csl, output.amounts, primaryTokenId)
  if (!value) {
    logger.error('outputToCSL: Failed to create Value', {
      address: output.address,
      amounts: output.amounts,
    })
    throw new Error(`Failed to create Value for address ${output.address}`)
  }

  const cslOutput = csl.TransactionOutput.new(address, value)
  if (!cslOutput) {
    logger.error('outputToCSL: Failed to create TransactionOutput', {
      address: output.address,
    })
    throw new Error(
      `Failed to create TransactionOutput for address ${output.address}`,
    )
  }

  // Add datum if present
  if (output.datum) {
    if ('data' in output.datum) {
      // Inline datum: create PlutusData from hex, hash it, and set the hash
      const plutusData = csl.PlutusData.fromHex(output.datum.data)
      const datumHash = csl.hashPlutusData(plutusData)
      cslOutput.setDataHash(datumHash)
    } else if ('hash' in output.datum) {
      // Datum hash: set the hash directly
      const datumHash = csl.DataHash.fromHex(output.datum.hash)
      cslOutput.setDataHash(datumHash)
    }
  }

  return cslOutput
}

/**
 * Create CSL TransactionBuilder with config
 */
function createCSLTransactionBuilder(
  csl: WasmModuleProxy,
  params: CardanoHaskellConfig,
): CSLTransactionBuilder {
  // Create LinearFee
  const linearFee = csl.LinearFee.new(
    csl.BigNum.fromStr(params.linearFee.coefficient),
    csl.BigNum.fromStr(params.linearFee.constant),
  )

  // Create other protocol params
  const poolDeposit = csl.BigNum.fromStr(params.poolDeposit)
  const keyDeposit = csl.BigNum.fromStr(params.keyDeposit)
  const coinsPerUtxoByte = csl.BigNum.fromStr(params.coinsPerUtxoByte)

  // Create ExUnitPrices (for Plutus)
  const unitPrice = csl.ExUnitPrices.new(
    csl.UnitInterval.new(
      csl.BigNum.fromStr('577'),
      csl.BigNum.fromStr('10000'),
    ),
    csl.UnitInterval.new(
      csl.BigNum.fromStr('721'),
      csl.BigNum.fromStr('10000000'),
    ),
  )

  // Build config - chain builder methods
  let configBuilder = csl.TransactionBuilderConfigBuilder.new()
  configBuilder = configBuilder.feeAlgo(linearFee)
  configBuilder = configBuilder.poolDeposit(poolDeposit)
  configBuilder = configBuilder.keyDeposit(keyDeposit)
  configBuilder = configBuilder.coinsPerUtxoByte(coinsPerUtxoByte)
  configBuilder = configBuilder.maxValueSize(5000)
  configBuilder = configBuilder.maxTxSize(16384)
  configBuilder = configBuilder.exUnitPrices(unitPrice)
  configBuilder = configBuilder.preferPureChange(true)

  const config = configBuilder.build()
  return csl.TransactionBuilder.new(config)
}

/**
 * Build transaction using CSL TransactionBuilder
 */
export async function buildTransaction(
  state: TransactionBuilderState,
  protocolParams: CardanoHaskellConfig,
  primaryTokenId: Portfolio.Token.Id = '.',
): Promise<UnsignedTransaction> {
  // Import logger dynamically to avoid circular dependencies
  const logger = require('../../../src/kernel/logger/logger').logger

  return CardanoMobileWrapped.cslScope((csl) => {
    // Validate inputs
    validateInputs(state)

    // Basic validation
    // Allow transactions with no explicit outputs if they have a change address
    // (CSL will create change outputs automatically)
    if (state.outputs.length === 0 && !state.options.changeAddress) {
      logger.error('buildTransaction: No outputs in transaction')
      throw new NoOutputsError()
    }

    // Create CSL TransactionBuilder
    const cslTxBuilder = createCSLTransactionBuilder(csl, protocolParams)
    if (!cslTxBuilder) {
      logger.error('buildTransaction: Failed to create CSL TransactionBuilder')
      throw new Error('Failed to create CSL TransactionBuilder')
    }

    // Add outputs first (CSL builder needs outputs to calculate fees)
    for (let i = 0; i < state.outputs.length; i++) {
      const output = state.outputs[i]
      if (!output) continue
      try {
        const cslOutput = outputToCSL(csl, output, primaryTokenId)
        if (!cslOutput) {
          logger.error('buildTransaction: Failed to create CSL output', {
            outputIndex: i,
            address: output.address,
          })
          throw new Error(`Failed to create CSL output for output ${i}`)
        }
        cslTxBuilder.addOutput(cslOutput)
      } catch (error) {
        logger.error('buildTransaction: Error adding output', {
          outputIndex: i,
          address: output.address,
          error: error instanceof Error ? error.message : String(error),
        })
        throw error
      }
    }

    // Add certificates
    if (state.certificates.length > 0) {
      const certs = csl.Certificates.new()
      if (!certs) {
        logger.error('buildTransaction: Failed to create Certificates')
        throw new Error('Failed to create Certificates')
      }
      for (const cert of state.certificates) {
        certs.add(cert.cert)
      }
      cslTxBuilder.setCerts(certs)
    }

    // Add withdrawals
    if (state.withdrawals.length > 0) {
      const withdrawals = csl.Withdrawals.new()
      if (!withdrawals) {
        logger.error('buildTransaction: Failed to create Withdrawals')
        throw new Error('Failed to create Withdrawals')
      }
      for (let i = 0; i < state.withdrawals.length; i++) {
        const withdrawal = state.withdrawals[i]
        if (!withdrawal) continue
        try {
          const address = csl.Address.fromBech32(withdrawal.rewardAddress)
          if (!address) {
            logger.error('buildTransaction: Invalid withdrawal address', {
              withdrawalIndex: i,
              rewardAddress: withdrawal.rewardAddress,
            })
            throw new Error(
              `Invalid reward address: ${withdrawal.rewardAddress}`,
            )
          }
          const rewardAddr = csl.RewardAddress.fromAddress(address)
          if (!rewardAddr) {
            logger.error('buildTransaction: Failed to create RewardAddress', {
              withdrawalIndex: i,
              rewardAddress: withdrawal.rewardAddress,
            })
            throw new Error(
              `Invalid reward address: ${withdrawal.rewardAddress}`,
            )
          }
          const amount = csl.BigNum.fromStr(withdrawal.amount)
          if (!amount) {
            logger.error(
              'buildTransaction: Failed to create BigNum for withdrawal',
              {
                withdrawalIndex: i,
                amount: withdrawal.amount,
              },
            )
            throw new Error(`Invalid withdrawal amount: ${withdrawal.amount}`)
          }
          withdrawals.insert(rewardAddr, amount)
        } catch (error) {
          logger.error('buildTransaction: Error adding withdrawal', {
            withdrawalIndex: i,
            rewardAddress: withdrawal.rewardAddress,
            error: error instanceof Error ? error.message : String(error),
          })
          throw error
        }
      }
      cslTxBuilder.setWithdrawals(withdrawals)
    }

    // Set TTL
    if (state.options.ttl) {
      cslTxBuilder.setTtl(state.options.ttl)
    }

    // Add inputs (UTXOs) - CSL TransactionBuilder uses addRegularInput
    for (let i = 0; i < state.inputs.length; i++) {
      const input = state.inputs[i]
      if (!input) continue
      const utxo = input.utxo
      try {
        const cslAddr = csl.Address.fromBech32(utxo.receiver)
        if (!cslAddr) {
          logger.error('buildTransaction: Invalid address for input', {
            inputIndex: i,
            receiver: utxo.receiver,
          })
          throw new Error(`Invalid address: ${utxo.receiver}`)
        }

        const txHash = csl.TransactionHash.fromHex(utxo.txHash)
        if (!txHash) {
          logger.error('buildTransaction: Invalid transaction hash', {
            inputIndex: i,
            txHash: utxo.txHash,
          })
          throw new Error(`Invalid transaction hash: ${utxo.txHash}`)
        }

        const txInput = csl.TransactionInput.new(txHash, utxo.txIndex)
        if (!txInput) {
          logger.error('buildTransaction: Failed to create TransactionInput', {
            inputIndex: i,
            txHash: utxo.txHash,
            txIndex: utxo.txIndex,
          })
          throw new Error(
            `Failed to create TransactionInput for ${utxo.txHash}:${utxo.txIndex}`,
          )
        }

        const cslAmount = amountsToValue(csl, utxo.balance, primaryTokenId)
        if (!cslAmount) {
          logger.error('buildTransaction: Failed to create Value', {
            inputIndex: i,
            balance: utxo.balance,
          })
          throw new Error(`Failed to create Value for input ${i}`)
        }

        cslTxBuilder.addRegularInput(cslAddr, txInput, cslAmount)
      } catch (error) {
        logger.error('buildTransaction: Error adding input', {
          inputIndex: i,
          txHash: utxo.txHash,
          txIndex: utxo.txIndex,
          error: error instanceof Error ? error.message : String(error),
        })
        throw error
      }
    }

    // Handle manual fee
    if (state.options.manualFee) {
      const feeAmount = state.options.manualFee[primaryTokenId] || '0'
      const feeBigNum = csl.BigNum.fromStr(feeAmount)
      if (!feeBigNum) {
        logger.error(
          'buildTransaction: Failed to create BigNum for manual fee',
          {
            feeAmount,
          },
        )
        throw new Error(`Invalid manual fee: ${feeAmount}`)
      }
      cslTxBuilder.setFee(feeBigNum)
    }

    // Handle change output
    if (state.options.manualChangeOutput) {
      const cslChangeOutput = outputToCSL(
        csl,
        state.options.manualChangeOutput,
        primaryTokenId,
      )
      if (!cslChangeOutput) {
        logger.error('buildTransaction: Failed to create manual change output')
        throw new Error('Failed to create manual change output')
      }
      cslTxBuilder.addOutput(cslChangeOutput)
    } else if (state.options.changeAddress && !state.options.manualFee) {
      // Use CSL's automatic change handling
      const changeAddr = csl.Address.fromBech32(state.options.changeAddress)
      if (!changeAddr) {
        logger.error('buildTransaction: Invalid change address', {
          changeAddress: state.options.changeAddress,
        })
        throw new Error(
          `Invalid change address: ${state.options.changeAddress}`,
        )
      }
      cslTxBuilder.addChangeIfNeeded(changeAddr)
    }

    // Add metadata
    let auxData: any
    if (state.metadata.length > 0) {
      auxData = csl.AuxiliaryData.new()
      if (!auxData) {
        logger.error('buildTransaction: Failed to create AuxiliaryData')
        throw new Error('Failed to create AuxiliaryData')
      }
      const metadataMap = csl.GeneralTransactionMetadata.new()
      if (!metadataMap) {
        logger.error(
          'buildTransaction: Failed to create GeneralTransactionMetadata',
        )
        throw new Error('Failed to create GeneralTransactionMetadata')
      }

      for (let i = 0; i < state.metadata.length; i++) {
        const meta = state.metadata[i]
        if (!meta) continue
        try {
          const label =
            typeof meta.label === 'string'
              ? parseInt(meta.label, 10)
              : meta.label
          const metadata = csl.encodeJsonStrToMetadatum(
            JSON.stringify(meta.data),
            1, // MetadataJsonSchema.BasicConversions
          )
          if (!metadata) {
            logger.error('buildTransaction: Failed to encode metadata', {
              metadataIndex: i,
              label,
            })
            throw new Error(`Failed to encode metadata for label ${label}`)
          }
          const labelBigNum = csl.BigNum.fromStr(label.toString())
          if (!labelBigNum) {
            logger.error(
              'buildTransaction: Failed to create BigNum for label',
              {
                metadataIndex: i,
                label,
              },
            )
            throw new Error(`Invalid metadata label: ${label}`)
          }
          metadataMap.insert(labelBigNum, metadata)
        } catch (error) {
          logger.error('buildTransaction: Error adding metadata entry', {
            metadataIndex: i,
            label: meta.label,
            error: error instanceof Error ? error.message : String(error),
          })
          throw error
        }
      }

      auxData.setMetadata(metadataMap)
      cslTxBuilder.setAuxiliaryData(auxData)
    }

    // Build the transaction body
    const txBody = cslTxBuilder.build()
    if (!txBody) {
      logger.error('buildTransaction: Failed to build transaction body')
      throw new Error('Failed to build transaction body')
    }

    // Handle reference inputs and collateral inputs
    // CSL TransactionBuilder doesn't support these directly
    // TODO: Check CSL API for reference/collateral inputs support
    // For now, we'll note that these are in the state but not yet added to the transaction
    // They will be included in the returned UnsignedTransaction for future processing

    // Handle validity interval
    // CSL TransactionBuilder may support this via setValidityStartInterval
    // TODO: Check CSL API for validity interval support

    // Get fee from builder
    const feeBigNum = cslTxBuilder.getFeeIfSet()
    const feeStr = feeBigNum ? feeBigNum.toStr() : '0'
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
      logger.error('buildTransaction: Insufficient funds', {
        inputAda: inputAda.toString(),
        outputAda: outputAda.toString(),
        feeAda: feeAda.toString(),
        required: (outputAda + feeAda).toString(),
      })
      throw new NotEnoughMoneyToSendError()
    }

    // Create full transaction with empty witness set for CBOR serialization
    // A full transaction is [body, witness_set, auxiliary_data?]
    // We need to create a Transaction object, not just the body
    const emptyWitnessSet = csl.TransactionWitnessSet.new()
    if (!emptyWitnessSet) {
      logger.error('buildTransaction: Failed to create TransactionWitnessSet')
      throw new Error('Failed to create TransactionWitnessSet')
    }

    // Create full transaction: [body, witness_set, auxiliary_data?]
    // auxData was already created above if metadata exists
    const fullTx = csl.Transaction.new(txBody, emptyWitnessSet, auxData)
    if (!fullTx) {
      logger.error('buildTransaction: Failed to create Transaction')
      throw new Error('Failed to create Transaction')
    }

    // Serialize full transaction to CBOR (not just the body)
    const txBytes = fullTx.toBytes()
    if (!txBytes || txBytes.length === 0) {
      logger.error('buildTransaction: Failed to serialize transaction to bytes')
      throw new Error('Failed to serialize transaction to bytes')
    }
    const cbor = Buffer.from(txBytes).toString('hex')

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
  })
}

/**
 * Build transaction as CBOR hex string for multiparty signing
 */
export async function buildTransactionCBOR(
  state: TransactionBuilderState,
  protocolParams: CardanoHaskellConfig,
  primaryTokenId: Portfolio.Token.Id = '.',
): Promise<string> {
  const unsignedTx = await buildTransaction(
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
