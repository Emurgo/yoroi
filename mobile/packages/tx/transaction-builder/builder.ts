// Functional Transaction Builder using CSL TransactionBuilder directly
import {CardanoMobileWrapped} from '@yoroi/cardano-wallet'
import {getLogger} from '@yoroi/logger'
import {primaryTokenId as defaultPrimaryTokenId} from '@yoroi/portfolio'
import {
  Address,
  Balance,
  BalanceQuantity,
  KeyHash,
  Portfolio,
  TokenId,
  TransactionCbor,
  TransactionHash,
  UtxoId,
} from '@yoroi/types'

import type {
  AuxiliaryData,
  TransactionBuilder as CSLTransactionBuilder,
  TransactionOutput as CSLTransactionOutput,
  Value,
  WasmModuleProxy,
} from '@emurgo/cross-csl-core'
import {Buffer} from 'buffer'

import {NoOutputsError, NotEnoughMoneyToSendError} from '../errors'
import {CardanoHaskellConfig, Datum} from '../types'
import {normalizeToAddress} from '../utils/addresses'
import {ModernUtxo} from '../utxo/models'
import {createCertificateFromData} from './certificates'
import type {
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
  excludedUtxos: Set<UtxoId>
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
    options: {
      mints: [],
    },
    excludedUtxos: new Set(),
  }
}

/**
 * Get exclusion key for a UTXO
 */
function getExclusionKey(txHash: TransactionHash, txIndex: number): UtxoId {
  return `${txHash}:${txIndex}` as UtxoId
}

/**
 * Check if a UTXO is excluded
 */
function isExcluded(utxo: ModernUtxo, excludedUtxos: Set<UtxoId>): boolean {
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
  txHash: TransactionHash,
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
  address: Address | string,
  amounts: Balance.Amounts,
  datum?: Datum,
): TransactionBuilderState {
  const addr = typeof address === 'string' ? (address as Address) : address
  return {
    ...state,
    outputs: [...state.outputs, {address: addr, amounts, datum}],
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
  cert: TransactionCertificate,
): TransactionBuilderState {
  return {
    ...state,
    certificates: [...state.certificates, cert],
  }
}

export function addCertificates(
  state: TransactionBuilderState,
  certs: TransactionCertificate[],
): TransactionBuilderState {
  return certs.reduce((acc, cert) => addCertificate(acc, cert), state)
}

// Withdrawal operations
export function addWithdrawal(
  state: TransactionBuilderState,
  rewardAddress: Address | string,
  amount: BalanceQuantity | string,
): TransactionBuilderState {
  const addr =
    typeof rewardAddress === 'string'
      ? (rewardAddress as Address)
      : rewardAddress
  const amt = typeof amount === 'string' ? (amount as BalanceQuantity) : amount
  return {
    ...state,
    withdrawals: [...state.withdrawals, {rewardAddress: addr, amount: amt}],
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
  txHash: TransactionHash,
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
  data: TransactionMetadata['data'],
): TransactionBuilderState {
  return {
    ...state,
    metadata: [...state.metadata, {label, data}],
  }
}

// Options operations
export function setChangeAddress(
  state: TransactionBuilderState,
  address: Address | string,
): TransactionBuilderState {
  const addr = typeof address === 'string' ? (address as Address) : address
  return {
    ...state,
    options: {...state.options, changeAddress: addr},
  }
}

export function setChangeOutput(
  state: TransactionBuilderState,
  address: Address | string,
  amounts: Balance.Amounts,
): TransactionBuilderState {
  const addr = typeof address === 'string' ? (address as Address) : address
  return {
    ...state,
    options: {
      ...state.options,
      manualChangeOutput: {address: addr, amounts},
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
      const current = BigInt(total[tokenId as TokenId] || '0')
      const added = BigInt(quantity)
      total[tokenId as TokenId] = (
        current + added
      ).toString() as Balance.Quantity
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
      const current = BigInt(total[tokenId as TokenId] || '0')
      const added = BigInt(quantity)
      total[tokenId as TokenId] = (
        current + added
      ).toString() as Balance.Quantity
    }
  }
  if (manualChangeOutput) {
    for (const [tokenId, quantity] of Object.entries(
      manualChangeOutput.amounts,
    )) {
      const current = BigInt(total[tokenId as TokenId] || '0')
      const added = BigInt(quantity)
      total[tokenId as TokenId] = (
        current + added
      ).toString() as Balance.Quantity
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
  primaryTokenId: Portfolio.Token.Id = defaultPrimaryTokenId,
): Value {
  const adaAmount = amounts[primaryTokenId] || '0'

  const adaBigNum = csl.BigNum.fromStr(adaAmount)
  if (!adaBigNum) {
    getLogger().error(
      'amountsToValue: Failed to create BigNum from ADA amount',
      {
        adaAmount,
      },
    )
    throw new Error(`Failed to create BigNum from ADA amount: ${adaAmount}`)
  }

  const value = csl.Value.new(adaBigNum)
  if (!value) {
    getLogger().error('amountsToValue: Failed to create Value', {
      adaAmount,
    })
    throw new Error(`Failed to create Value from ADA amount: ${adaAmount}`)
  }

  // Get all token IDs except primary token
  const tokenIds = Object.keys(amounts).filter((id) => id !== primaryTokenId)

  if (tokenIds.length > 0) {
    const multiAsset = csl.MultiAsset.new()
    if (!multiAsset) {
      getLogger().error('amountsToValue: Failed to create MultiAsset')
      throw new Error('Failed to create MultiAsset')
    }

    // Group tokens by policy ID
    // tokenId is in format "policyId.assetNameHex" (Portfolio.Token.Id format)
    const groupedByPolicyId = tokenIds.reduce(
      (acc, tokenIdStr) => {
        const tokenId = tokenIdStr as Portfolio.Token.Id
        const [policyId, assetNameHex] = (tokenId as Portfolio.Token.Id).split(
          '.',
        )
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
          getLogger().error('amountsToValue: Failed to create ScriptHash', {
            policyIdStr,
          })
          throw new Error(
            `Failed to create ScriptHash from policy ID: ${policyIdStr}`,
          )
        }

        const assets = csl.Assets.new()
        if (!assets) {
          getLogger().error('amountsToValue: Failed to create Assets', {
            policyIdStr,
          })
          throw new Error(`Failed to create Assets for policy: ${policyIdStr}`)
        }

        for (const {tokenId, assetNameHex} of tokenGroup) {
          const name = csl.AssetName.new(
            new Uint8Array(Buffer.from(assetNameHex, 'hex')),
          )
          if (!name) {
            getLogger().error('amountsToValue: Failed to create AssetName', {
              tokenId,
              assetNameHex,
            })
            throw new Error(`Failed to create AssetName for asset: ${tokenId}`)
          }

          const amount = csl.BigNum.fromStr(amounts[tokenId] ?? '0')
          if (!amount) {
            getLogger().error(
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
        getLogger().error('amountsToValue: Error processing policy assets', {
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
  primaryTokenId: Portfolio.Token.Id = defaultPrimaryTokenId,
): CSLTransactionOutput {
  // Use normalizeToAddress to handle Byron (base58), Shelley (bech32), and hex addresses
  const address = normalizeToAddress(csl, output.address)
  if (!address) {
    getLogger().error('outputToCSL: Invalid address', {
      address: output.address,
    })
    throw new Error(`Invalid address: ${output.address}`)
  }

  const value = amountsToValue(csl, output.amounts, primaryTokenId)
  if (!value) {
    getLogger().error('outputToCSL: Failed to create Value', {
      address: output.address,
      amounts: output.amounts,
    })
    throw new Error(`Failed to create Value for address ${output.address}`)
  }

  const cslOutput = csl.TransactionOutput.new(address, value)
  if (!cslOutput) {
    getLogger().error('outputToCSL: Failed to create TransactionOutput', {
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
  primaryTokenId: Portfolio.Token.Id = defaultPrimaryTokenId,
): Promise<UnsignedTransaction> {
  return CardanoMobileWrapped.cslScope((csl) => {
    // Validate inputs
    validateInputs(state)

    // Basic validation
    // Allow transactions with no explicit outputs if they have a change address
    // (CSL will create change outputs automatically)
    if (state.outputs.length === 0 && !state.options.changeAddress) {
      getLogger().error('buildTransaction: No outputs in transaction')
      throw new NoOutputsError()
    }

    // Create CSL TransactionBuilder
    const cslTxBuilder = createCSLTransactionBuilder(csl, protocolParams)
    if (!cslTxBuilder) {
      getLogger().error(
        'buildTransaction: Failed to create CSL TransactionBuilder',
      )
      throw new Error('Failed to create CSL TransactionBuilder')
    }

    // Add outputs first (CSL builder needs outputs to calculate fees)
    for (let i = 0; i < state.outputs.length; i++) {
      const output = state.outputs[i]
      if (!output) continue
      try {
        const cslOutput = outputToCSL(csl, output, primaryTokenId)
        if (!cslOutput) {
          getLogger().error('buildTransaction: Failed to create CSL output', {
            outputIndex: i,
            address: output.address,
          })
          throw new Error(`Failed to create CSL output for output ${i}`)
        }
        cslTxBuilder.addOutput(cslOutput)
      } catch (error) {
        getLogger().error('buildTransaction: Error adding output', {
          outputIndex: i,
          address: output.address,
          error: error instanceof Error ? error.message : String(error),
        })
        throw error
      }
    }

    // Add certificates
    // NOTE: In Conway era, withdrawals require certificates that match the reward account credential
    // Certificates must be added BEFORE withdrawals to satisfy this requirement
    // Create CSL Certificate objects from certificate data within this CSL scope
    if (state.certificates.length > 0) {
      getLogger().info('buildTransaction: Processing certificates', {
        certificatesCount: state.certificates.length,
        certificates: state.certificates.map((c) => ({
          kind: 'kind' in c ? c.kind : 'unknown',
          stakeCredentialKeyHashHex:
            'stakeCredentialKeyHashHex' in c
              ? c.stakeCredentialKeyHashHex
              : undefined,
        })),
      })

      const certs = csl.Certificates.new()
      if (!certs) {
        getLogger().error('buildTransaction: Failed to create Certificates')
        throw new Error('Failed to create Certificates')
      }
      for (let i = 0; i < state.certificates.length; i++) {
        const certData = state.certificates[i]
        if (!certData) continue

        const certKind = 'kind' in certData ? certData.kind : 'unknown'
        getLogger().info('buildTransaction: Processing certificate', {
          certificateIndex: i,
          certificateKind: certKind,
        })

        try {
          // Create certificate using shared helper
          const cslCert = createCertificateFromData(csl, certData)
          certs.add(cslCert)
          getLogger().info('buildTransaction: Successfully added certificate', {
            certificateIndex: i,
            certificateKind: certKind,
          })
        } catch (error) {
          getLogger().error('buildTransaction: Error adding certificate', {
            certificateIndex: i,
            certificateKind: certKind,
            error: error instanceof Error ? error.message : String(error),
          })
          throw error
        }
      }
      cslTxBuilder.setCerts(certs)
      getLogger().info(
        'buildTransaction: Set certificates on transaction builder',
        {
          certificatesCount: state.certificates.length,
        },
      )
    }

    // Add withdrawals
    // NOTE: Certificates are only required when explicitly deregistering (matches yoroi-lib behavior)
    // Normal withdrawals don't require certificates
    if (state.withdrawals.length > 0) {
      getLogger().info('buildTransaction: Processing withdrawals', {
        withdrawalsCount: state.withdrawals.length,
        withdrawals: state.withdrawals,
        certificatesCount: state.certificates.length,
      })

      const withdrawals = csl.Withdrawals.new()
      if (!withdrawals) {
        getLogger().error('buildTransaction: Failed to create Withdrawals')
        throw new Error('Failed to create Withdrawals')
      }
      for (let i = 0; i < state.withdrawals.length; i++) {
        const withdrawal = state.withdrawals[i]
        if (!withdrawal) continue

        getLogger().info('buildTransaction: Processing withdrawal', {
          withdrawalIndex: i,
          rewardAddress: withdrawal.rewardAddress,
          amount: withdrawal.amount,
        })

        try {
          // Use normalizeToAddress to handle Byron (base58), Shelley (bech32), and hex addresses
          // Note: Withdrawals are only for Shelley wallets, but normalizeToAddress handles all formats
          const address = normalizeToAddress(csl, withdrawal.rewardAddress)
          if (!address) {
            getLogger().error('buildTransaction: Invalid withdrawal address', {
              withdrawalIndex: i,
              rewardAddress: withdrawal.rewardAddress,
            })
            throw new Error(
              `Invalid reward address: ${withdrawal.rewardAddress}`,
            )
          }
          const rewardAddr = csl.RewardAddress.fromAddress(address)
          if (!rewardAddr) {
            getLogger().error(
              'buildTransaction: Failed to create RewardAddress',
              {
                withdrawalIndex: i,
                rewardAddress: withdrawal.rewardAddress,
              },
            )
            throw new Error(
              `Invalid reward address: ${withdrawal.rewardAddress}`,
            )
          }
          // If certificates are present (e.g., when deregistering), validate they match the withdrawal
          // Normal withdrawals don't require certificates, so we only validate if certificates exist
          if (state.certificates.length > 0) {
            const withdrawalStakeCred = rewardAddr.paymentCred()
            const withdrawalKeyHash = withdrawalStakeCred?.toKeyhash()
            const withdrawalKeyHashHex = withdrawalKeyHash?.toHex()

            if (!withdrawalKeyHashHex) {
              getLogger().error(
                'buildTransaction: Failed to extract stake credential from withdrawal',
                {
                  withdrawalIndex: i,
                  rewardAddress: withdrawal.rewardAddress,
                },
              )
              throw new Error(
                `Failed to extract stake credential from withdrawal reward address: ${withdrawal.rewardAddress}`,
              )
            }

            // Verify that at least one certificate matches this withdrawal's stake credential
            let hasMatchingCert = false
            for (const certData of state.certificates) {
              const certStakeKeyHashHex =
                'stakeCredentialKeyHashHex' in certData
                  ? certData.stakeCredentialKeyHashHex
                  : undefined
              if (certStakeKeyHashHex === withdrawalKeyHashHex) {
                hasMatchingCert = true
                break
              }
            }

            if (!hasMatchingCert) {
              getLogger().error(
                'buildTransaction: No matching certificate for withdrawal',
                {
                  withdrawalIndex: i,
                  rewardAddress: withdrawal.rewardAddress,
                  withdrawalKeyHashHex,
                  certificateCount: state.certificates.length,
                  certificateKinds: state.certificates.map((c) =>
                    'kind' in c ? c.kind : 'unknown',
                  ),
                  certificateStakeKeyHashes: state.certificates
                    .map((c) =>
                      'stakeCredentialKeyHashHex' in c
                        ? c.stakeCredentialKeyHashHex
                        : undefined,
                    )
                    .filter((h): h is KeyHash => h !== undefined),
                },
              )
              throw new Error(
                `No matching certificate for withdrawal reward address: ${withdrawal.rewardAddress}. ` +
                  `Withdrawal requires a certificate with stake credential matching key hash: ${withdrawalKeyHashHex}. ` +
                  `Found ${state.certificates.length} certificate(s) but none match.`,
              )
            }
          }

          const amount = csl.BigNum.fromStr(withdrawal.amount)
          if (!amount) {
            getLogger().error(
              'buildTransaction: Failed to create BigNum for withdrawal',
              {
                withdrawalIndex: i,
                amount: withdrawal.amount,
              },
            )
            throw new Error(`Invalid withdrawal amount: ${withdrawal.amount}`)
          }
          withdrawals.insert(rewardAddr, amount)
          getLogger().info('buildTransaction: Successfully added withdrawal', {
            withdrawalIndex: i,
            rewardAddress: withdrawal.rewardAddress,
            amount: withdrawal.amount,
          })
        } catch (error) {
          getLogger().error('buildTransaction: Error adding withdrawal', {
            withdrawalIndex: i,
            rewardAddress: withdrawal.rewardAddress,
            error: error instanceof Error ? error.message : String(error),
          })
          throw error
        }
      }
      cslTxBuilder.setWithdrawals(withdrawals)
      getLogger().info(
        'buildTransaction: Set withdrawals on transaction builder',
        {
          withdrawalsCount: state.withdrawals.length,
        },
      )
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
        // Use normalizeToAddress to handle Byron (base58), Shelley (bech32), and hex addresses
        const cslAddr = normalizeToAddress(csl, utxo.receiver)
        if (!cslAddr) {
          getLogger().error('buildTransaction: Invalid address for input', {
            inputIndex: i,
            receiver: utxo.receiver,
          })
          throw new Error(`Invalid address: ${utxo.receiver}`)
        }

        const txHash = csl.TransactionHash.fromHex(utxo.txHash)
        if (!txHash) {
          getLogger().error('buildTransaction: Invalid transaction hash', {
            inputIndex: i,
            txHash: utxo.txHash,
          })
          throw new Error(`Invalid transaction hash: ${utxo.txHash}`)
        }

        const txInput = csl.TransactionInput.new(txHash, utxo.txIndex)
        if (!txInput) {
          getLogger().error(
            'buildTransaction: Failed to create TransactionInput',
            {
              inputIndex: i,
              txHash: utxo.txHash,
              txIndex: utxo.txIndex,
            },
          )
          throw new Error(
            `Failed to create TransactionInput for ${utxo.txHash}:${utxo.txIndex}`,
          )
        }

        const cslAmount = amountsToValue(csl, utxo.balance, primaryTokenId)
        if (!cslAmount) {
          getLogger().error('buildTransaction: Failed to create Value', {
            inputIndex: i,
            balance: utxo.balance,
          })
          throw new Error(`Failed to create Value for input ${i}`)
        }

        cslTxBuilder.addRegularInput(cslAddr, txInput, cslAmount)
      } catch (error) {
        getLogger().error('buildTransaction: Error adding input', {
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
        getLogger().error(
          'buildTransaction: Failed to create BigNum for manual fee',
          {
            feeAmount,
          },
        )
        throw new Error(`Invalid manual fee: ${feeAmount}`)
      }
      cslTxBuilder.setFee(feeBigNum)
    }

    // Add minting actions BEFORE change output handling
    // This ensures minted tokens are included in the change output
    if (state.options.mints && state.options.mints.length > 0) {
      const mint = csl.Mint.new()
      if (!mint) {
        getLogger().error('buildTransaction: Failed to create Mint')
        throw new Error('Failed to create Mint')
      }

      const nativeScripts = csl.NativeScripts.new()
      const plutusScripts = csl.PlutusScripts.new()

      for (let i = 0; i < state.options.mints.length; i++) {
        const mintAction = state.options.mints[i]
        if (!mintAction) continue

        try {
          // Create policy ID
          const policyId = csl.ScriptHash.fromHex(mintAction.policyId)
          if (!policyId) {
            getLogger().error('buildTransaction: Invalid policy ID', {
              mintIndex: i,
              policyId: mintAction.policyId,
            })
            throw new Error(`Invalid policy ID: ${mintAction.policyId}`)
          }

          // Create mint assets map for this policy (uses Int, not BigNum)
          const mintAssets = csl.MintAssets.new()
          if (!mintAssets) {
            getLogger().error('buildTransaction: Failed to create MintAssets')
            throw new Error('Failed to create MintAssets')
          }

          for (const asset of mintAction.assets) {
            const assetName = csl.AssetName.fromHex(asset.assetName)
            if (!assetName) {
              getLogger().error('buildTransaction: Invalid asset name', {
                mintIndex: i,
                assetName: asset.assetName,
              })
              throw new Error(`Invalid asset name: ${asset.assetName}`)
            }

            const amount = csl.Int.fromStr(asset.amount)
            if (!amount) {
              getLogger().error('buildTransaction: Invalid mint amount', {
                mintIndex: i,
                amount: asset.amount,
              })
              throw new Error(`Invalid mint amount: ${asset.amount}`)
            }

            mintAssets.insert(assetName, amount)
          }

          // Insert policy and assets into mint
          mint.insert(policyId, mintAssets)

          // Add script to appropriate collection
          if (mintAction.script.type === 'native') {
            const nativeScript = csl.NativeScript.fromHex(
              mintAction.script.script,
            )
            if (nativeScript) {
              nativeScripts.add(nativeScript)
            }
          } else {
            const plutusScript = csl.PlutusScript.fromHex(
              mintAction.script.script,
            )
            if (plutusScript) {
              plutusScripts.add(plutusScript)
            }
          }
        } catch (error) {
          getLogger().error('buildTransaction: Error adding mint action', {
            mintIndex: i,
            policyId: mintAction.policyId,
            error: error instanceof Error ? error.message : String(error),
          })
          throw error
        }
      }

      // setMint requires mint value and native scripts (if any)
      // Plutus scripts and redeemers are handled separately after building
      cslTxBuilder.setMint(mint, nativeScripts)

      // Store Plutus scripts and redeemers for later witness set handling
      // Note: Plutus scripts and redeemers need to be added to the final
      // transaction witness set after build() is called
      if (plutusScripts.len() > 0) {
        // Plutus scripts will be added to witness set in post-processing
        // This is handled by the transaction building flow
      }
    }

    // Handle change output
    if (state.options.manualChangeOutput) {
      const cslChangeOutput = outputToCSL(
        csl,
        state.options.manualChangeOutput,
        primaryTokenId,
      )
      if (!cslChangeOutput) {
        getLogger().error(
          'buildTransaction: Failed to create manual change output',
        )
        throw new Error('Failed to create manual change output')
      }
      cslTxBuilder.addOutput(cslChangeOutput)
    } else if (state.options.changeAddress && !state.options.manualFee) {
      // Use CSL's automatic change handling
      // Use normalizeToAddress to handle Byron (base58), Shelley (bech32), and hex addresses
      const changeAddr = normalizeToAddress(csl, state.options.changeAddress)
      if (!changeAddr) {
        getLogger().error('buildTransaction: Invalid change address', {
          changeAddress: state.options.changeAddress,
        })
        throw new Error(
          `Invalid change address: ${state.options.changeAddress}`,
        )
      }

      // Calculate totals before adding change to help debug issues
      const totalInput = calculateTotalInputValue(state.inputs)
      const totalOutput = calculateTotalOutputValue(
        state.outputs,
        state.options.manualChangeOutput,
      )

      // Calculate total withdrawals
      const totalWithdrawals: Balance.Amounts = {} as Balance.Amounts
      for (const withdrawal of state.withdrawals) {
        const current = BigInt(totalWithdrawals[primaryTokenId] || '0')
        const added = BigInt(withdrawal.amount)
        totalWithdrawals[primaryTokenId] = (
          current + added
        ).toString() as Balance.Quantity
      }

      // Check for non-ADA tokens in inputs
      const inputTokenIds = Object.keys(totalInput).filter(
        (id) => id !== primaryTokenId,
      )
      const hasTokens = inputTokenIds.length > 0

      // Calculate expected remaining ADA (before fee is calculated)
      // Withdrawals ADD to available ADA, outputs SUBTRACT
      const inputAda = BigInt(totalInput[primaryTokenId] || '0')
      const outputAda = BigInt(totalOutput[primaryTokenId] || '0')
      const withdrawalsAda = BigInt(totalWithdrawals[primaryTokenId] || '0')
      // Available ADA = input + withdrawals - outputs (fee will be subtracted by CSL)
      const availableAdaBeforeFee = inputAda + withdrawalsAda - outputAda

      // Get min UTXO value from protocol params
      const minUtxoValue = BigInt(protocolParams.minimumUtxoVal || '1000000') // Default 1 ADA

      // Estimate fee (CSL will calculate actual fee, but this gives us an idea)
      // Fee calculation happens inside addChangeIfNeeded, but we can estimate
      // Account for native scripts in witness set if minting is present
      let estimatedTxSize = 500 // Rough base estimate
      let witnessSetFeeBuffer = BigInt(0)
      if (state.options.mints && state.options.mints.length > 0) {
        // Add buffer for native scripts in witness set
        // Each native script adds ~100-150 bytes to the witness set
        const nativeScriptCount = state.options.mints.filter(
          (m) => m?.script.type === 'native',
        ).length
        if (nativeScriptCount > 0) {
          // Estimate witness set size: ~150 bytes per native script (conservative)
          const witnessSetSizeEstimate = nativeScriptCount * 150
          // Add fee for witness set size: coefficient * size
          witnessSetFeeBuffer =
            BigInt(protocolParams.linearFee.coefficient) *
            BigInt(witnessSetSizeEstimate)
          estimatedTxSize += nativeScriptCount * 100 // Also add to size estimate for logging
        }
      }
      const estimatedFee =
        BigInt(protocolParams.linearFee.constant) +
        BigInt(protocolParams.linearFee.coefficient) * BigInt(estimatedTxSize) +
        witnessSetFeeBuffer

      const expectedRemainingAda = availableAdaBeforeFee - estimatedFee

      getLogger().info('buildTransaction: About to add change if needed', {
        totalInputAda: totalInput[primaryTokenId] || '0',
        totalInputTokens: inputTokenIds.length,
        inputTokenIds: inputTokenIds.slice(0, 10), // Limit to first 10
        totalOutputAda: totalOutput[primaryTokenId] || '0',
        totalOutputTokens: Object.keys(totalOutput).filter(
          (id) => id !== primaryTokenId,
        ).length,
        totalWithdrawalsAda: totalWithdrawals[primaryTokenId] || '0',
        withdrawalsCount: state.withdrawals.length,
        inputsCount: state.inputs.length,
        inputs: state.inputs.map((input) => ({
          txId: input.utxo.txHash,
          index: input.utxo.txIndex,
          adaAmount: input.utxo.balance[primaryTokenId] || '0',
          tokenCount: Object.keys(input.utxo.balance).filter(
            (id) => id !== primaryTokenId,
          ).length,
          tokenIds: Object.keys(input.utxo.balance)
            .filter((id) => id !== primaryTokenId)
            .slice(0, 5), // Limit to first 5 tokens per UTXO
        })),
        hasTokens,
        changeAddress: state.options.changeAddress,
        // Financial calculations
        availableAdaBeforeFee: availableAdaBeforeFee.toString(),
        estimatedFee: estimatedFee.toString(),
        expectedRemainingAda: expectedRemainingAda.toString(),
        minUtxoValue: minUtxoValue.toString(),
        hasEnoughAdaForMinUtxo: expectedRemainingAda >= minUtxoValue,
        // Warning if tokens present but not enough ADA
        warning:
          hasTokens && expectedRemainingAda < minUtxoValue
            ? `UTXO has ${inputTokenIds.length} tokens but expected remaining ADA (${expectedRemainingAda.toString()}) is less than min UTXO (${minUtxoValue.toString()}). CSL will calculate actual fee which may be different.`
            : undefined,
      })

      try {
        // If minting with native scripts, calculate witness set size and estimate fee
        // BEFORE calling addChangeIfNeeded, since CSL calculates fee based on body size only
        // The witness set size increases total transaction size, which increases fee
        if (
          state.options.mints &&
          state.options.mints.length > 0 &&
          !state.options.manualFee
        ) {
          const nativeScriptCount = state.options.mints.filter(
            (m) => m?.script.type === 'native',
          ).length
          if (nativeScriptCount > 0) {
            // Calculate actual witness set size by serializing native scripts
            let actualWitnessSetSize = 0
            const tempWitnessSet = csl.TransactionWitnessSet.new()
            if (tempWitnessSet) {
              const tempNativeScripts = csl.NativeScripts.new()
              for (let i = 0; i < state.options.mints.length; i++) {
                const mintAction = state.options.mints[i]
                if (!mintAction || mintAction.script.type !== 'native') continue
                const nativeScript = csl.NativeScript.fromHex(
                  mintAction.script.script,
                )
                if (nativeScript) {
                  tempNativeScripts.add(nativeScript)
                }
              }
              if (tempNativeScripts.len() > 0) {
                tempWitnessSet.setNativeScripts(tempNativeScripts)
                // Serialize witness set to get actual size
                const witnessSetBytes = tempWitnessSet.toBytes()
                actualWitnessSetSize = witnessSetBytes.length
              }
            }

            if (actualWitnessSetSize > 0) {
              // Estimate base transaction body size (inputs, outputs, certificates, etc.)
              // We need to account for the change output that will be added by addChangeIfNeeded
              const baseBodySizeEstimate = 1000 // More conservative base estimate

              // Input size: ~60 bytes per input (tx hash + index + CBOR overhead)
              const inputsSize = state.inputs.length * 80

              // Output size: ~70 bytes base + address (~60 bytes) + value (~20 bytes) + tokens overhead
              // For change output with minted tokens, add extra size for token bundle
              let changeOutputSize = 0
              if (!state.options.manualChangeOutput) {
                // Base output size
                changeOutputSize = 150
                // Add size for minted tokens in change output
                // Each minted asset adds ~40 bytes (policy ID + asset name + amount)
                for (const mintAction of state.options.mints || []) {
                  if (mintAction && mintAction.assets) {
                    changeOutputSize +=
                      Object.keys(mintAction.assets).length * 50
                  }
                }
              }

              const outputsSize = state.outputs.length * 150 + changeOutputSize

              const certificatesSize = state.certificates.length * 120
              const withdrawalsSize = state.withdrawals.length * 60

              // Metadata size varies significantly - estimate conservatively
              // Each metadata entry adds overhead, and large values (like base64 images) add more
              let metadataSize = 0
              if (state.metadata.length > 0) {
                // Base overhead for metadata map
                metadataSize = 100
                // Add size for each metadata entry
                for (const meta of state.metadata) {
                  if (meta) {
                    // Estimate based on JSON stringified size
                    const metaStr = JSON.stringify(meta.data)
                    metadataSize += Math.max(metaStr.length, 200) // At least 200 bytes per entry
                  }
                }
              }

              // Mint field: policy ID + asset name + amount for each asset
              // Each mint adds ~60 bytes (policy ID ~56 bytes + asset name + amount)
              let mintSize = 0
              if (state.options.mints && state.options.mints.length > 0) {
                mintSize = 100 // Base overhead
                for (const mintAction of state.options.mints) {
                  if (mintAction && mintAction.assets) {
                    mintSize += Object.keys(mintAction.assets).length * 70
                  }
                }
              }

              const estimatedBodySize =
                baseBodySizeEstimate +
                inputsSize +
                outputsSize +
                certificatesSize +
                withdrawalsSize +
                metadataSize +
                mintSize

              // Apply a safety multiplier (2.5x) to account for CBOR encoding overhead,
              // variable-length encoding, and other factors we can't predict accurately
              // The actual body size is typically 2-3x larger than our estimate
              const adjustedBodySize = Math.ceil(estimatedBodySize * 2.5)

              // Estimate total transaction size including witness set
              const totalTxSizeEstimate =
                adjustedBodySize + actualWitnessSetSize

              // Calculate total fee: constant + coefficient * total_size
              const totalFee =
                BigInt(protocolParams.linearFee.constant) +
                BigInt(protocolParams.linearFee.coefficient) *
                  BigInt(totalTxSizeEstimate)

              // Set manual fee BEFORE calling addChangeIfNeeded
              // CSL will use this fee instead of calculating its own
              const feeBigNum = csl.BigNum.fromStr(totalFee.toString())
              if (feeBigNum) {
                cslTxBuilder.setFee(feeBigNum)
                getLogger().info(
                  'buildTransaction: Set manual fee accounting for native scripts',
                  {
                    estimatedBodySize,
                    adjustedBodySize,
                    actualWitnessSetSize,
                    totalTxSizeEstimate,
                    totalFee: totalFee.toString(),
                    nativeScriptCount,
                    inputsSize,
                    outputsSize,
                    changeOutputSize,
                    metadataSize,
                    mintSize,
                  },
                )
              }
            }
          }
        }

        cslTxBuilder.addChangeIfNeeded(changeAddr)
        getLogger().info(
          'buildTransaction: Successfully added change if needed',
        )
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error)
        const isInsufficientAdaError =
          errorMessage.includes('Not enough ADA leftover') ||
          errorMessage.includes('add_change_if_needed')

        getLogger().error('buildTransaction: Failed to add change if needed', {
          error: errorMessage,
          errorStack: error instanceof Error ? error.stack : undefined,
          totalInputAda: totalInput[primaryTokenId] || '0',
          totalOutputAda: totalOutput[primaryTokenId] || '0',
          totalWithdrawalsAda: totalWithdrawals[primaryTokenId] || '0',
          hasTokens,
          inputTokenIds,
          inputTokenCount: inputTokenIds.length,
          expectedRemainingAda: expectedRemainingAda.toString(),
          minUtxoValue: minUtxoValue.toString(),
          isInsufficientAdaError,
        })

        // Provide a more helpful error message when tokens are present
        if (isInsufficientAdaError && hasTokens) {
          const enhancedError = new Error(
            `Not enough ADA to create change output with ${inputTokenIds.length} tokens. ` +
              `The change output requires more ADA than the base minimum UTXO value (${minUtxoValue.toString()} lovelace) ` +
              `due to the tokens it contains. ` +
              `Expected remaining ADA: ${expectedRemainingAda.toString()} lovelace. ` +
              `Consider selecting UTXOs with more ADA or using pure ADA UTXOs when possible.`,
          )
          enhancedError.stack = error instanceof Error ? error.stack : undefined
          throw enhancedError
        }

        throw error
      }
    }

    // Add metadata
    let auxData: AuxiliaryData | undefined
    if (state.metadata.length > 0) {
      auxData = csl.AuxiliaryData.new()
      if (!auxData) {
        getLogger().error('buildTransaction: Failed to create AuxiliaryData')
        throw new Error('Failed to create AuxiliaryData')
      }
      const metadataMap = csl.GeneralTransactionMetadata.new()
      if (!metadataMap) {
        getLogger().error(
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
            getLogger().error('buildTransaction: Failed to encode metadata', {
              metadataIndex: i,
              label,
            })
            throw new Error(`Failed to encode metadata for label ${label}`)
          }
          const labelBigNum = csl.BigNum.fromStr(label.toString())
          if (!labelBigNum) {
            getLogger().error(
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
          getLogger().error('buildTransaction: Error adding metadata entry', {
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
      getLogger().error('buildTransaction: Failed to build transaction body')
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
      getLogger().error('buildTransaction: Insufficient funds', {
        inputAda: inputAda.toString(),
        outputAda: outputAda.toString(),
        feeAda: feeAda.toString(),
        required: (outputAda + feeAda).toString(),
      })
      throw new NotEnoughMoneyToSendError()
    }

    // Create witness set - include native scripts if minting is present
    // Native scripts used in minting need to be in the witness set
    const witnessSet = csl.TransactionWitnessSet.new()
    if (!witnessSet) {
      getLogger().error(
        'buildTransaction: Failed to create TransactionWitnessSet',
      )
      throw new Error('Failed to create TransactionWitnessSet')
    }

    // Add native scripts to witness set if minting is present
    if (state.options.mints && state.options.mints.length > 0) {
      const nativeScriptsForWitness = csl.NativeScripts.new()
      for (let i = 0; i < state.options.mints.length; i++) {
        const mintAction = state.options.mints[i]
        if (!mintAction) continue

        if (mintAction.script.type === 'native') {
          const nativeScript = csl.NativeScript.fromHex(
            mintAction.script.script,
          )
          if (nativeScript) {
            nativeScriptsForWitness.add(nativeScript)
          }
        }
      }

      if (nativeScriptsForWitness.len() > 0) {
        witnessSet.setNativeScripts(nativeScriptsForWitness)
        getLogger().info(
          'buildTransaction: Added native scripts to witness set',
          {
            nativeScriptCount: nativeScriptsForWitness.len(),
          },
        )
      }
    }

    // Create full transaction: [body, witness_set, auxiliary_data?]
    // auxData was already created above if metadata exists
    const fullTx = csl.Transaction.new(txBody, witnessSet, auxData)
    if (!fullTx) {
      getLogger().error('buildTransaction: Failed to create Transaction')
      throw new Error('Failed to create Transaction')
    }

    // Serialize full transaction to CBOR (not just the body)
    const txBytes = fullTx.toBytes()
    if (!txBytes || txBytes.length === 0) {
      getLogger().error(
        'buildTransaction: Failed to serialize transaction to bytes',
      )
      throw new Error('Failed to serialize transaction to bytes')
    }
    const cbor: TransactionCbor = Buffer.from(txBytes).toString(
      'hex',
    ) as TransactionCbor

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
  primaryTokenId: Portfolio.Token.Id = defaultPrimaryTokenId,
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
