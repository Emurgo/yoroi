import {isHex} from '@yoroi/common'
import {
  ModernUtxo,
  NoOutputsError,
  NotEnoughMoneyToSendError,
  TransactionOutput,
  addInputs,
  addMetadata,
  addOutput,
  buildTransaction,
  createCardanoHaskellConfig,
  createTransactionBuilder,
  selectUtxosForAmounts,
  setChangeAddress,
  setTTLWithBuffer,
} from '@yoroi/tx'
import {Balance, Portfolio, Wallet} from '@yoroi/types'

import {logger} from '~/kernel/logger/logger'

import {cardanoValueFromAmounts} from '../cardanoValueFromAmounts'
import {CardanoMobileWrapped} from '../wrappedCsl'

export type CreateSendTxParams = {
  utxos: ModernUtxo[]
  entries: TransactionOutput[]
  primaryTokenId: Portfolio.Token.Id
  protocolParams: {
    coinsPerUtxoByte: string
    keyDeposit: string
    linearFee: {constant: string; coefficient: string}
    poolDeposit: string
  }
  networkId: number
  getAbsoluteSlotNumber: () => Promise<BigNumber>
  getChangeAddress: (addressMode: Wallet.AddressMode) => string
  addressMode: Wallet.AddressMode
  metadata?: Array<{label: string; data: any}>
  /**
   * If true, subtract transaction fee from the primary token amount in the first output.
   * This is useful when sending MAX amount - the output will be automatically adjusted
   * to account for fees, ensuring the transaction can be built successfully.
   */
  subtractFeeFromAmount?: boolean
}

export async function createSendTx({
  utxos,
  entries,
  primaryTokenId,
  protocolParams,
  networkId,
  getAbsoluteSlotNumber,
  getChangeAddress,
  addressMode,
  metadata,
  subtractFeeFromAmount = false,
}: CreateSendTxParams): Promise<{cbor: string}> {
  const absSlotNumber = await getAbsoluteSlotNumber()
  const changeAddress = getChangeAddress(addressMode)

  const protocolParamsConfig = createCardanoHaskellConfig(
    protocolParams,
    networkId,
  )

  try {
    // Calculate required amounts from outputs
    const requiredAmounts: Record<string, string> = {}
    const minUtxoValue = BigInt(
      protocolParamsConfig.minimumUtxoVal || '1000000',
    ) // Default to 1 ADA if not set
    // Store calculated minAda for each entry index
    const entryMinAda: Map<number, bigint> = new Map()

    // Calculate actual minimum ADA for each output that has tokens
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i]
      if (!entry) continue

      const hasTokens = Object.keys(entry.amounts).some(
        (tokenId) => tokenId !== primaryTokenId,
      )
      const adaAmount = BigInt(entry.amounts[primaryTokenId] || '0')

      // If output has tokens but insufficient ADA, calculate actual minimum UTXO value
      if (hasTokens && adaAmount < minUtxoValue) {
        // Calculate actual minimum ADA required for this output using CSL
        const actualMinAda = await CardanoMobileWrapped.cslScope(
          async (csl) => {
            // Create address within this cslScope to avoid pointer issues
            let normalizedAddress: any
            if (csl.ByronAddress.isValid(entry.address)) {
              const byronAddr = csl.ByronAddress.fromBase58(entry.address)
              normalizedAddress = byronAddr.toAddress()
            } else {
              const isHexAddr = isHex(entry.address)
              normalizedAddress = isHexAddr
                ? csl.Address.fromHex(entry.address)
                : csl.Address.fromBech32(entry.address)
            }

            if (!normalizedAddress || normalizedAddress.isMalformed()) {
              logger.error(
                'createSendTx: Failed to normalize address for minAda calculation',
                {
                  address: entry.address,
                  entryIndex: i,
                },
              )
              throw new Error(`Invalid address: ${entry.address}`)
            }

            // Create value with tokens (using 0 ADA initially to calculate minimum)
            const tempAmounts: Balance.Amounts = {
              ...entry.amounts,
              [primaryTokenId]: '0',
            }

            let value
            try {
              value = cardanoValueFromAmounts(csl, tempAmounts, primaryTokenId)
              if (!value) {
                logger.error(
                  'createSendTx: cardanoValueFromAmounts returned null',
                  {
                    address: entry.address,
                    amounts: entry.amounts,
                    entryIndex: i,
                  },
                )
                throw new Error(
                  'Failed to create Value for minAda calculation: cardanoValueFromAmounts returned null',
                )
              }
            } catch (error) {
              logger.error(
                'createSendTx: Error creating Value for minAda calculation',
                {
                  address: entry.address,
                  amounts: entry.amounts,
                  entryIndex: i,
                  error: error instanceof Error ? error.message : String(error),
                  errorStack: error instanceof Error ? error.stack : undefined,
                },
              )
              throw error
            }

            const txOutput = csl.TransactionOutput.new(normalizedAddress, value)
            if (!txOutput) {
              const errorValueCoin = value.coin()
              const errorMultiasset = value.multiasset()
              logger.error(
                'createSendTx: Failed to create TransactionOutput for minAda calculation',
                {
                  address: entry.address,
                  entryIndex: i,
                  valueCoin: errorValueCoin ? errorValueCoin.toStr() : '0',
                  hasMultiasset: errorMultiasset
                    ? errorMultiasset.len() > 0
                    : false,
                },
              )
              throw new Error(
                `Failed to create TransactionOutput for minAda calculation: Pointer is NULL for address ${entry.address}`,
              )
            }

            const dataCost = csl.DataCost.newCoinsPerByte(
              csl.BigNum.fromStr(protocolParams.coinsPerUtxoByte),
            )
            if (!dataCost) {
              logger.error(
                'createSendTx: Failed to create DataCost for minAda calculation',
                {
                  entryIndex: i,
                },
              )
              throw new Error(
                'Failed to create DataCost for minAda calculation',
              )
            }

            const minAda = csl.minAdaForOutput(txOutput, dataCost)
            if (!minAda) {
              logger.error(
                'createSendTx: Failed to calculate minAdaForOutput',
                {
                  address: entry.address,
                  entryIndex: i,
                },
              )
              throw new Error('Failed to calculate minAdaForOutput')
            }

            return BigInt(minAda.toStr())
          },
        )

        // Store the calculated minAda for this entry
        entryMinAda.set(i, actualMinAda)

        const currentAda = BigInt(requiredAmounts[primaryTokenId] || '0')
        // Use the calculated minimum or the hardcoded fallback, whichever is higher
        const minAdaToUse =
          actualMinAda > minUtxoValue ? actualMinAda : minUtxoValue
        requiredAmounts[primaryTokenId] = (currentAda + minAdaToUse).toString()
      }

      for (const [tokenId, quantity] of Object.entries(entry.amounts)) {
        const current = BigInt(requiredAmounts[tokenId] || '0')
        const needed = BigInt(quantity)
        requiredAmounts[tokenId] = (current + needed).toString()
      }
    }

    // Estimate fee (rough estimate: base fee + per-byte fee for a typical transaction)
    // This is conservative - actual fee will be calculated by CSL
    const estimatedFee = (
      BigInt(protocolParams.linearFee.constant) +
      BigInt(protocolParams.linearFee.coefficient) * BigInt(500)
    ) // Rough estimate: 500 bytes
      .toString()

    // Select only necessary UTXOs
    const selectedUtxos = selectUtxosForAmounts(
      utxos,
      requiredAmounts,
      primaryTokenId,
      estimatedFee,
    )

    // Helper function to build transaction with given entries
    const buildTxWithEntries = async (
      txEntries: TransactionOutput[],
    ): Promise<{cbor: string; fee: bigint}> => {
      // Build transaction using functional TransactionBuilder
      let builderState = createTransactionBuilder()

      // Add only selected UTXOs as inputs
      builderState = addInputs(builderState, selectedUtxos)

      // Add outputs from entries
      // Ensure outputs with tokens have minimum UTXO value in ADA
      for (let i = 0; i < txEntries.length; i++) {
        const entry = txEntries[i]
        if (!entry) continue

        const hasTokens = Object.keys(entry.amounts).some(
          (tokenId) => tokenId !== primaryTokenId,
        )
        const adaAmount = BigInt(entry.amounts[primaryTokenId] || '0')

        // If output has tokens but insufficient ADA, use calculated minAda or fallback
        const adjustedAmounts = {...entry.amounts}
        if (hasTokens && adaAmount < minUtxoValue) {
          // Use the calculated minAda if available, otherwise use the fallback
          const calculatedMinAda = entryMinAda.get(i)
          const minAdaToUse =
            calculatedMinAda && calculatedMinAda > minUtxoValue
              ? calculatedMinAda
              : minUtxoValue

          adjustedAmounts[primaryTokenId] =
            minAdaToUse.toString() as Balance.Quantity
        }

        builderState = addOutput(
          builderState,
          entry.address,
          adjustedAmounts,
          entry.datum,
        )
      }

      // Set change address
      builderState = setChangeAddress(builderState, changeAddress)

      // Set TTL with buffer to prevent expiration
      builderState = setTTLWithBuffer(builderState, absSlotNumber.toNumber())

      // Add metadata if present
      if (metadata && metadata.length > 0) {
        for (const meta of metadata) {
          const label = String(meta.label)
          builderState = addMetadata(builderState, label, meta.data)
        }
      }

      // Build the transaction and get fee
      const unsignedTx = await buildTransaction(
        builderState,
        protocolParamsConfig,
        primaryTokenId,
      )

      // Extract fee from transaction CBOR
      const fee = await CardanoMobileWrapped.cslScope(async (csl) => {
        if (!unsignedTx.cbor) {
          throw new Error('Transaction CBOR not available')
        }
        const tx = csl.Transaction.fromHex(unsignedTx.cbor)
        if (!tx) {
          throw new Error('Failed to parse transaction from CBOR')
        }
        const body = tx.body()
        const feeBigNum = body.fee()
        return BigInt(feeBigNum.toStr())
      })

      return {cbor: unsignedTx.cbor || '', fee}
    }

    // Build transaction first to get actual fee
    // If subtractFeeFromAmount is true and initial build fails with "Not enough ADA" or "Insufficient input",
    // we'll catch it and retry with reduced amount
    let result: {cbor: string; fee: bigint} | undefined
    let initialBuildFailed = false

    try {
      result = await buildTxWithEntries(entries)
      logger.debug('createSendTx: Initial build completed', {
        subtractFeeFromAmount,
        fee: result.fee.toString(),
        entriesCount: entries.length,
        totalInputAda: selectedUtxos
          .reduce(
            (sum, utxo) => sum + BigInt(utxo.balance[primaryTokenId] || '0'),
            BigInt(0),
          )
          .toString(),
        totalOutputAda: entries
          .reduce(
            (sum, entry) => sum + BigInt(entry.amounts[primaryTokenId] || '0'),
            BigInt(0),
          )
          .toString(),
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      const isNotEnoughAdaError =
        errorMessage.includes('Not enough ADA leftover') ||
        errorMessage.includes('Not enough ADA')
      const isInsufficientInputError =
        errorMessage.includes('Insufficient input') ||
        errorMessage.includes('shortage')

      logger.debug('createSendTx: Initial build failed', {
        subtractFeeFromAmount,
        errorMessage,
        isNotEnoughAdaError,
        isInsufficientInputError,
        entriesCount: entries.length,
        totalInputAda: selectedUtxos
          .reduce(
            (sum, utxo) => sum + BigInt(utxo.balance[primaryTokenId] || '0'),
            BigInt(0),
          )
          .toString(),
        totalOutputAda: entries
          .reduce(
            (sum, entry) => sum + BigInt(entry.amounts[primaryTokenId] || '0'),
            BigInt(0),
          )
          .toString(),
      })

      // If subtractFeeFromAmount is true and we got "Not enough ADA" or "Insufficient input" error,
      // we'll handle it by reducing the amount and retrying
      if (
        subtractFeeFromAmount &&
        (isNotEnoughAdaError || isInsufficientInputError) &&
        entries.length > 0
      ) {
        initialBuildFailed = true
        logger.debug(
          'createSendTx: Initial build failed, will retry with reduced amount',
          {
            errorMessage,
            errorType: isNotEnoughAdaError
              ? 'NotEnoughAda'
              : 'InsufficientInput',
          },
        )
      } else {
        // Re-throw if it's not the error we're handling or subtractFeeFromAmount is false
        throw error
      }
    }

    // If subtractFeeFromAmount is true, adjust the first output and rebuild
    // This ensures that when sending MAX, the fee is automatically subtracted
    // from the output amount, preventing "Not enough ADA leftover" or "Insufficient input" errors
    if (subtractFeeFromAmount && entries.length > 0) {
      const firstEntry = entries[0]
      if (firstEntry) {
        // Check if selected UTXOs have non-ADA assets that will go to change
        const totalInputAda = selectedUtxos.reduce(
          (sum, utxo) => sum + BigInt(utxo.balance[primaryTokenId] || '0'),
          BigInt(0),
        )

        // Calculate total output ADA (excluding change)
        const totalOutputAda = entries.reduce(
          (sum, entry) => sum + BigInt(entry.amounts[primaryTokenId] || '0'),
          BigInt(0),
        )

        logger.debug('createSendTx: Preparing fee adjustment', {
          subtractFeeFromAmount,
          initialBuildFailed,
          totalInputAda: totalInputAda.toString(),
          totalOutputAda: totalOutputAda.toString(),
          fee: result?.fee.toString() || 'unknown',
          firstEntryAdaAmount: firstEntry.amounts[primaryTokenId] || '0',
        })

        // Calculate total input amounts for each token
        const totalInputAmounts: Record<string, bigint> = {}
        for (const utxo of selectedUtxos) {
          for (const [tokenId, quantity] of Object.entries(utxo.balance)) {
            totalInputAmounts[tokenId] =
              (totalInputAmounts[tokenId] || BigInt(0)) + BigInt(quantity)
          }
        }

        // Calculate total output amounts for each token
        const totalOutputAmounts: Record<string, bigint> = {}
        for (const entry of entries) {
          for (const [tokenId, quantity] of Object.entries(entry.amounts)) {
            totalOutputAmounts[tokenId] =
              (totalOutputAmounts[tokenId] || BigInt(0)) + BigInt(quantity)
          }
        }

        // Check if there are non-ADA assets that will remain in change
        let hasNonAdaAssetsInChange = false
        for (const [tokenId, inputAmount] of Object.entries(
          totalInputAmounts,
        )) {
          if (tokenId === primaryTokenId) continue
          const outputAmount = totalOutputAmounts[tokenId] || BigInt(0)
          if (inputAmount > outputAmount) {
            hasNonAdaAssetsInChange = true
            break
          }
        }

        const currentAdaAmount = BigInt(
          firstEntry.amounts[primaryTokenId] || '0',
        )
        const minAdaForEntry = entryMinAda.get(0) || minUtxoValue

        // If initial build failed, use iterative approach to find the right amount
        // If initial build succeeded, we can do a single adjustment with actual fee
        if (initialBuildFailed) {
          // Iterative approach: keep reducing until transaction builds successfully
          const estimatedFee =
            BigInt(protocolParams.linearFee.constant) +
            BigInt(protocolParams.linearFee.coefficient) * BigInt(500) // Estimate: 500 bytes

          // Calculate minimum ADA for change output if needed
          // Use a conservative estimate: 1.5x minUtxoValue for safety margin
          let minAdaForChange = BigInt(0)
          if (hasNonAdaAssetsInChange) {
            // Use 1.5x as a safety margin since actual minAda depends on asset count/size
            minAdaForChange = (minUtxoValue * BigInt(3)) / BigInt(2) // 1.5x
          }

          // Start with initial reduction
          let attemptAdaAmount =
            currentAdaAmount - estimatedFee - minAdaForChange
          let lastSuccessfulAmount: bigint | undefined
          const maxAttempts = 10
          let attempt = 0

          logger.debug('createSendTx: Starting iterative fee adjustment', {
            initialBuildFailed,
            totalInputAda: totalInputAda.toString(),
            totalOutputAda: totalOutputAda.toString(),
            estimatedFee: estimatedFee.toString(),
            hasNonAdaAssetsInChange,
            minAdaForChange: minAdaForChange.toString(),
            currentAdaAmount: currentAdaAmount.toString(),
            initialAttemptAmount: attemptAdaAmount.toString(),
          })

          while (attempt < maxAttempts) {
            attempt++
            // Ensure we don't go below minimum UTXO value for this output
            const finalAdaAmount =
              attemptAdaAmount > minAdaForEntry
                ? attemptAdaAmount
                : minAdaForEntry

            // Check if we've gone too low
            if (
              finalAdaAmount <= minAdaForEntry &&
              attemptAdaAmount <= minAdaForEntry
            ) {
              logger.error(
                'createSendTx: Cannot reduce amount further - hit minimum',
                {
                  attempt,
                  finalAdaAmount: finalAdaAmount.toString(),
                  minAdaForEntry: minAdaForEntry.toString(),
                },
              )
              throw new Error(
                'Cannot send MAX amount: insufficient ADA after accounting for fees and minimum change requirements',
              )
            }

            // Create adjusted entries with reduced ADA amount
            const adjustedEntries: TransactionOutput[] = [
              {
                ...firstEntry,
                amounts: {
                  ...firstEntry.amounts,
                  [primaryTokenId]:
                    finalAdaAmount.toString() as Balance.Quantity,
                },
              },
              ...entries.slice(1),
            ]

            try {
              result = await buildTxWithEntries(adjustedEntries)
              lastSuccessfulAmount = finalAdaAmount
              logger.debug(
                'createSendTx: Build successful after fee adjustment',
                {
                  attempt,
                  newFee: result.fee.toString(),
                  finalAdaAmount: finalAdaAmount.toString(),
                  initialBuildFailed,
                },
              )
              break // Success!
            } catch (error) {
              const errorMessage =
                error instanceof Error ? error.message : String(error)
              const isNotEnoughAdaError =
                errorMessage.includes('Not enough ADA leftover') ||
                errorMessage.includes('Not enough ADA')
              const isInsufficientInputError =
                errorMessage.includes('Insufficient input') ||
                errorMessage.includes('shortage')

              if (
                (isNotEnoughAdaError || isInsufficientInputError) &&
                attempt < maxAttempts
              ) {
                // Reduce amount further - subtract additional safety margin
                // Use a percentage-based reduction: reduce by 5% each attempt
                const reductionAmount =
                  (attemptAdaAmount * BigInt(5)) / BigInt(100)
                attemptAdaAmount = attemptAdaAmount - reductionAmount

                logger.debug(
                  'createSendTx: Build failed, reducing amount further',
                  {
                    attempt,
                    errorMessage,
                    errorType: isNotEnoughAdaError
                      ? 'NotEnoughAda'
                      : 'InsufficientInput',
                    newAttemptAmount: attemptAdaAmount.toString(),
                    reductionAmount: reductionAmount.toString(),
                    finalAdaAmount: finalAdaAmount.toString(),
                  },
                )
              } else {
                // Not a "Not enough ADA" or "Insufficient input" error, or max attempts reached
                logger.error(
                  'createSendTx: Build failed after fee adjustment',
                  {
                    attempt,
                    error: errorMessage,
                    isNotEnoughAdaError,
                    isInsufficientInputError,
                    finalAdaAmount: finalAdaAmount.toString(),
                    minAdaForChange: minAdaForChange.toString(),
                    estimatedFee: estimatedFee.toString(),
                    initialBuildFailed,
                  },
                )
                throw error
              }
            }
          }

          if (!result || !lastSuccessfulAmount) {
            throw new Error(
              'Failed to build transaction after multiple reduction attempts',
            )
          }
        } else {
          // Initial build succeeded - but we still need to subtract fee when subtractFeeFromAmount is true
          // This handles cases where the build succeeds but would fail during change calculation
          // Calculate minimum ADA for change output if needed
          let minAdaForChange = BigInt(0)
          if (hasNonAdaAssetsInChange) {
            minAdaForChange = minUtxoValue
          }

          // Always subtract fee when subtractFeeFromAmount is true, even if initial build succeeded
          // The initial build might succeed but fail later during change calculation
          const adjustedAdaAmount =
            currentAdaAmount - result!.fee - minAdaForChange
          const finalAdaAmount =
            adjustedAdaAmount > minAdaForEntry
              ? adjustedAdaAmount
              : minAdaForEntry

          logger.debug(
            'createSendTx: Single fee adjustment (subtracting fee from amount)',
            {
              totalInputAda: totalInputAda.toString(),
              totalOutputAda: totalOutputAda.toString(),
              fee: result!.fee.toString(),
              hasNonAdaAssetsInChange,
              minAdaForChange: minAdaForChange.toString(),
              currentAdaAmount: currentAdaAmount.toString(),
              adjustedAdaAmount: adjustedAdaAmount.toString(),
              finalAdaAmount: finalAdaAmount.toString(),
              minAdaForEntry: minAdaForEntry.toString(),
            },
          )

          // Only rebuild if the amount actually changed
          if (finalAdaAmount < currentAdaAmount) {
            const adjustedEntries: TransactionOutput[] = [
              {
                ...firstEntry,
                amounts: {
                  ...firstEntry.amounts,
                  [primaryTokenId]:
                    finalAdaAmount.toString() as Balance.Quantity,
                },
              },
              ...entries.slice(1),
            ]

            result = await buildTxWithEntries(adjustedEntries)
            logger.debug(
              'createSendTx: Rebuild successful after fee adjustment',
              {
                newFee: result.fee.toString(),
                originalAmount: currentAdaAmount.toString(),
                adjustedAmount: finalAdaAmount.toString(),
                feeSubtracted: (currentAdaAmount - finalAdaAmount).toString(),
              },
            )
          } else {
            logger.debug(
              'createSendTx: No adjustment needed - amount already sufficient',
              {
                currentAdaAmount: currentAdaAmount.toString(),
                finalAdaAmount: finalAdaAmount.toString(),
                fee: result!.fee.toString(),
              },
            )
          }
        }
      }
    }

    if (!result) {
      throw new Error('Transaction build failed: result is undefined')
    }
    return {cbor: result.cbor}
  } catch (e) {
    if (e instanceof NotEnoughMoneyToSendError || e instanceof NoOutputsError) {
      logger.error('createSendTx: Transaction creation failed', {
        errorType: e.constructor.name,
        errorMessage: e.message,
        entriesCount: entries.length,
      })
      throw e
    }
    const error = e instanceof Error ? e : new Error(String(e))
    logger.error('createSendTx: Unexpected error', {
      error: error.message,
      errorStack: error.stack,
      entriesCount: entries.length,
    })
    throw new Error(`Failed to create send transaction: ${error.message}`)
  }
}
