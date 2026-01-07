import {isHex} from '@yoroi/common'
import {getLogger} from '@yoroi/logger'
import type {TransactionMetadata} from '@yoroi/tx'
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
import {
  Address,
  Balance,
  Branded,
  Portfolio,
  TokenId,
  Wallet,
} from '@yoroi/types'

import type {Address as CSLAddress} from '@emurgo/cross-csl-core'
import BigNumber from 'bignumber.js'

import {cardanoValueFromAmounts} from '../cardanoValueFromAmounts'
import {calculateChangeOutputMinAda, calculateLockedAda} from '../utxoService'
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
  getChangeAddress: (addressMode: Wallet.AddressMode) => Address | string
  addressMode: Wallet.AddressMode
  metadata?: Array<{label: string; data: TransactionMetadata['data']}>
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
  const changeAddressRaw = getChangeAddress(addressMode)
  const changeAddress =
    typeof changeAddressRaw === 'string'
      ? (changeAddressRaw as Address)
      : changeAddressRaw

  const protocolParamsConfig = createCardanoHaskellConfig(
    protocolParams,
    networkId,
  )

  try {
    // Calculate required amounts from outputs
    const requiredAmounts: Record<TokenId, Balance.Quantity> = {} as Record<
      TokenId,
      Balance.Quantity
    >
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
      const adaAmount = BigInt(
        entry.amounts[primaryTokenId] ?? Branded.ZERO_QUANTITY,
      )

      // Determine the ADA amount needed for this entry
      let adaNeeded = adaAmount

      // If output has tokens, we must verify the minimum ADA requirement
      // The default minUtxoValue (e.g. 1 ADA) might not be enough for a token bundle
      if (hasTokens) {
        // Calculate actual minimum ADA required for this output using CSL
        const actualMinAda = await CardanoMobileWrapped.cslScope(
          async (csl) => {
            // Create address within this cslScope to avoid pointer issues
            let normalizedAddress: CSLAddress | null = null
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
              getLogger().error(
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
                getLogger().error(
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
              getLogger().error(
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
              getLogger().error(
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
              getLogger().error(
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
              getLogger().error(
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

        // Use the calculated minimum or the hardcoded fallback, whichever is higher
        const minAdaToUse =
          actualMinAda > minUtxoValue ? actualMinAda : minUtxoValue

        if (adaNeeded < minAdaToUse) {
          adaNeeded = minAdaToUse
        }
      }

      // Update requiredAmounts for ADA
      const currentAda = BigInt(
        requiredAmounts[primaryTokenId] ?? Branded.ZERO_QUANTITY,
      )
      requiredAmounts[primaryTokenId] = (
        currentAda + adaNeeded
      ).toString() as Balance.Quantity

      for (const [tokenId, quantity] of Object.entries(entry.amounts)) {
        if (tokenId === primaryTokenId) continue
        const tokenIdBranded = Branded.asTokenId(tokenId)
        const current = BigInt(
          requiredAmounts[tokenIdBranded] ?? Branded.ZERO_QUANTITY,
        )
        const needed = BigInt(quantity as string | number)
        requiredAmounts[tokenIdBranded] = (
          current + needed
        ).toString() as Balance.Quantity
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
    let selectedUtxos = selectUtxosForAmounts(
      utxos,
      requiredAmounts,
      primaryTokenId,
      estimatedFee,
    )

    // Filter out UTXOs with tokens if we don't need their tokens
    // This prevents selecting token UTXOs when sending only ADA, which would
    // unnecessarily include locked ADA that just gets sent back as change
    const requiredTokenIds = new Set(
      Object.keys(requiredAmounts).filter(
        (id) => id !== primaryTokenId,
      ) as TokenId[],
    )
    const hasRequiredTokens = requiredTokenIds.size > 0

    if (!hasRequiredTokens) {
      // No tokens required - filter out UTXOs that have tokens (they have locked ADA)
      const originalCount = selectedUtxos.length
      selectedUtxos = selectedUtxos.filter((utxo) => {
        const hasTokens = Object.keys(utxo.balance).some(
          (tokenId) => tokenId !== primaryTokenId,
        )
        return !hasTokens // Only keep UTXOs without tokens
      })

      if (selectedUtxos.length < originalCount) {
        getLogger().debug(
          'createSendTx: Filtered out token UTXOs (not needed for ADA-only transfer)',
          {
            originalCount,
            filteredCount: selectedUtxos.length,
            removedCount: originalCount - selectedUtxos.length,
          },
        )

        // Recalculate if we still have enough ADA after filtering
        const totalAdaAfterFilter = selectedUtxos.reduce(
          (sum, utxo) =>
            sum + BigInt(utxo.balance[primaryTokenId] ?? Branded.ZERO_QUANTITY),
          BigInt(0),
        )
        const requiredAda = entries.reduce(
          (sum, entry) =>
            sum +
            BigInt(entry.amounts[primaryTokenId] ?? Branded.ZERO_QUANTITY),
          BigInt(0),
        )

        // Calculate minimum ADA needed from inputs
        // When subtractFeeFromAmount is true:
        //   - Fee is subtracted from OUTPUT, not from inputs
        //   - If we successfully filter out token UTXOs, there will be NO tokens in change
        //   - So we only need: requiredAda from inputs (fee comes from output reduction)
        //   - No minAdaForChange needed because there's no change output (or minimal change < minUtxo)
        // When subtractFeeFromAmount is false:
        //   - Fee needs to come from inputs
        //   - We also need minAdaForChange for change output
        const feeNeededFromInputs = subtractFeeFromAmount
          ? BigInt(0) // Fee is subtracted from output
          : BigInt(estimatedFee) // Fee needs to come from inputs

        // If we successfully filter out token UTXOs, there are no tokens in change
        // So we don't need minAdaForChange - the change will be minimal (< minUtxo) or zero
        const minAdaForChangeEstimate = subtractFeeFromAmount
          ? BigInt(0) // No tokens in change = no minAdaForChange needed
          : minUtxoValue // Conservative: 1 ADA minimum for change

        const totalNeededFromInputs =
          requiredAda + feeNeededFromInputs + minAdaForChangeEstimate

        if (totalAdaAfterFilter < totalNeededFromInputs) {
          // Not enough ADA after filtering - need to include token UTXOs
          getLogger().debug(
            'createSendTx: Not enough ADA without token UTXOs, including them',
            {
              totalAdaAfterFilter: totalAdaAfterFilter.toString(),
              requiredAda: requiredAda.toString(),
              feeNeededFromInputs: feeNeededFromInputs.toString(),
              minAdaForChangeEstimate: minAdaForChangeEstimate.toString(),
              totalNeededFromInputs: totalNeededFromInputs.toString(),
              subtractFeeFromAmount,
            },
          )
          // Revert to original selection
          selectedUtxos = selectUtxosForAmounts(
            utxos,
            requiredAmounts,
            primaryTokenId,
            estimatedFee,
          )
        }
      }
    }

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
        const adaAmount = BigInt(
          entry.amounts[primaryTokenId] ?? Branded.ZERO_QUANTITY,
        )

        // If output has tokens, ensure we meet the calculated minimum requirement
        const adjustedAmounts = {...entry.amounts}
        if (hasTokens) {
          // Use the calculated minAda if available, otherwise use the fallback
          const calculatedMinAda = entryMinAda.get(i)
          const minRequired =
            calculatedMinAda && calculatedMinAda > minUtxoValue
              ? calculatedMinAda
              : minUtxoValue

          // If the current amount is less than required, bump it up
          if (adaAmount < minRequired) {
            adjustedAmounts[primaryTokenId] =
              minRequired.toString() as Balance.Quantity
          }
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

    // Store the ORIGINAL amount BEFORE any modifications (for comparison later)
    // This must be done BEFORE proactive reduction modifies entries[0]
    const originalEntryAdaAmount = entries[0]
      ? BigInt(entries[0].amounts[primaryTokenId] ?? Branded.ZERO_QUANTITY)
      : BigInt(0)

    // If subtractFeeFromAmount is true, proactively reduce the output amount BEFORE building
    // This prevents initial build failures when the wallet has just enough ADA to cover fee + min UTXO
    // We reduce the first entry's ADA amount by a conservative fee estimate
    if (subtractFeeFromAmount && entries.length > 0) {
      const firstEntry = entries[0]
      if (firstEntry) {
        const minAdaForEntry = entryMinAda.get(0) || minUtxoValue

        // Calculate total input ADA
        const totalInputAda = selectedUtxos.reduce(
          (sum, utxo) =>
            sum + BigInt(utxo.balance[primaryTokenId] ?? Branded.ZERO_QUANTITY),
          BigInt(0),
        )

        // Calculate total output ADA (excluding change)
        const totalOutputAda = entries.reduce(
          (sum, entry) =>
            sum +
            BigInt(entry.amounts[primaryTokenId] ?? Branded.ZERO_QUANTITY),
          BigInt(0),
        )

        // Check if there are non-ADA assets that will go to change
        const totalInputAmounts: Record<string, bigint> = {}
        for (const utxo of selectedUtxos) {
          for (const [tokenId, quantity] of Object.entries(utxo.balance)) {
            totalInputAmounts[tokenId] =
              (totalInputAmounts[tokenId] || BigInt(0)) +
              BigInt(quantity as string | number)
          }
        }
        const totalOutputAmounts: Record<string, bigint> = {}
        for (const entry of entries) {
          for (const [tokenId, quantity] of Object.entries(entry.amounts)) {
            totalOutputAmounts[tokenId] =
              (totalOutputAmounts[tokenId] || BigInt(0)) +
              BigInt(quantity as string | number)
          }
        }
        // Calculate tokens that will be in change output
        const changeOutputTokens: Record<TokenId, bigint> = {}
        let hasNonAdaAssetsInChange = false
        for (const [tokenId, inputAmount] of Object.entries(
          totalInputAmounts,
        )) {
          if (tokenId === primaryTokenId) continue
          const outputAmount = totalOutputAmounts[tokenId] || BigInt(0)
          const remaining = inputAmount - outputAmount
          if (remaining > BigInt(0)) {
            hasNonAdaAssetsInChange = true
            changeOutputTokens[tokenId as TokenId] = remaining
          }
        }

        // Calculate spendable ADA from selected UTXOs (excluding locked ADA)
        // This is critical: we need to account for locked ADA in the selected UTXOs
        let spendableAda = totalInputAda
        try {
          const lockedAdaResult = await calculateLockedAda({
            utxos: selectedUtxos,
            protocolParams: {
              coinsPerUtxoByte: protocolParams.coinsPerUtxoByte,
              linearFee: protocolParams.linearFee,
              minimumUtxoVal: minUtxoValue.toString(),
            },
            primaryTokenId,
            // No tokens being sent in proactive reduction phase
          })
          spendableAda = totalInputAda - lockedAdaResult.currentLocked
          getLogger().debug(
            'createSendTx: Calculated spendable ADA (proactive)',
            {
              totalInputAda: totalInputAda.toString(),
              lockedAda: lockedAdaResult.currentLocked.toString(),
              spendableAda: spendableAda.toString(),
            },
          )
        } catch (error) {
          // Fallback: assume no locked ADA if calculation fails
          getLogger().debug(
            'createSendTx: Failed to calculate locked ADA (proactive), assuming no locked ADA',
            {
              error: error instanceof Error ? error.message : String(error),
            },
          )
        }

        // Calculate accurate minimum ADA for change output using CSL
        let minAdaForChange = BigInt(0)
        if (hasNonAdaAssetsInChange) {
          try {
            minAdaForChange = await calculateChangeOutputMinAda(
              changeAddress,
              changeOutputTokens,
              {
                coinsPerUtxoByte: protocolParams.coinsPerUtxoByte,
                linearFee: protocolParams.linearFee,
                minimumUtxoVal: minUtxoValue.toString(),
              },
              primaryTokenId,
            )
            getLogger().debug(
              'createSendTx: Calculated accurate minAdaForChange (proactive)',
              {
                minAdaForChange: minAdaForChange.toString(),
                tokenCount: Object.keys(changeOutputTokens).length,
              },
            )
          } catch (error) {
            // Fallback to conservative estimate if calculation fails
            getLogger().debug(
              'createSendTx: Failed to calculate minAdaForChange (proactive), using estimate',
              {
                error: error instanceof Error ? error.message : String(error),
              },
            )
            minAdaForChange = (minUtxoValue * BigInt(3)) / BigInt(2) // 1.5x fallback
          }
        } else {
          // No tokens in change, use base minimum
          minAdaForChange = minUtxoValue
        }

        // Proactively reduce the output amount by estimated fee + change requirement
        // Use a conservative fee estimate to avoid initial build failure
        const conservativeFeeEstimate =
          BigInt(protocolParams.linearFee.constant) +
          BigInt(protocolParams.linearFee.coefficient) * BigInt(600) // 600 bytes estimate

        // Calculate how much we can actually send
        // When subtractFeeFromAmount is true and there are no tokens in change:
        //   - Fee is subtracted from output, so output = spendableAda - fee
        //   - No change output needed (or minimal change < minUtxo)
        //   - Available = spendableAda - fee (no minAdaForChange needed)
        // When there are tokens in change:
        //   - Need to reserve minAdaForChange for change output
        //   - Available = spendableAda - fee - minAdaForChange
        // Use spendableAda (not totalInputAda) to account for locked ADA
        const availableAfterFeeAndChange =
          hasNonAdaAssetsInChange && !subtractFeeFromAmount
            ? spendableAda - conservativeFeeEstimate - minAdaForChange
            : spendableAda - conservativeFeeEstimate

        // When sending all ADA (totalOutputAda >= totalInputAda), reduce by fee estimate
        // This ensures we don't try to send more than available
        const isSendingAllAda = totalOutputAda >= totalInputAda

        if (isSendingAllAda) {
          // When sending all ADA, reduce output by fee estimate
          // Use availableAfterFeeAndChange, but ensure it's at least some minimum (even if below minAdaForEntry)
          // The actual minimum will be validated during build
          const adjustedAdaAmount =
            availableAfterFeeAndChange > BigInt(0)
              ? availableAfterFeeAndChange
              : BigInt(0)

          getLogger().debug(
            'createSendTx: Proactively reducing amount for subtractFeeFromAmount (sending all ADA)',
            {
              totalInputAda: totalInputAda.toString(),
              totalOutputAda: totalOutputAda.toString(),
              conservativeFeeEstimate: conservativeFeeEstimate.toString(),
              minAdaForChange: minAdaForChange.toString(),
              hasNonAdaAssetsInChange,
              subtractFeeFromAmount,
              availableAfterFeeAndChange: availableAfterFeeAndChange.toString(),
              adjustedAdaAmount: adjustedAdaAmount.toString(),
              minAdaForEntry: minAdaForEntry.toString(),
              firstEntryBefore: firstEntry.amounts[primaryTokenId],
              isSendingAllAda,
            },
          )

          // Always reduce when sending all ADA, even if below minimum UTXO
          // The build will validate and fail with a clear error if truly insufficient
          if (adjustedAdaAmount > BigInt(0)) {
            // Update the first entry with reduced amount
            entries[0] = {
              ...firstEntry,
              amounts: {
                ...firstEntry.amounts,
                [primaryTokenId]:
                  adjustedAdaAmount.toString() as Balance.Quantity,
              },
            }

            getLogger().debug(
              'createSendTx: Updated entry with reduced amount',
              {
                firstEntryAfter: entries[0]?.amounts[primaryTokenId],
                adjustedAdaAmount: adjustedAdaAmount.toString(),
                newTotalOutputAda: entries
                  .reduce(
                    (sum, entry) =>
                      sum +
                      BigInt(
                        entry.amounts[primaryTokenId] ?? Branded.ZERO_QUANTITY,
                      ),
                    BigInt(0),
                  )
                  .toString(),
              },
            )
          } else {
            getLogger().debug(
              'createSendTx: Cannot reduce amount - available after fees is zero or negative',
              {
                totalInputAda: totalInputAda.toString(),
                conservativeFeeEstimate: conservativeFeeEstimate.toString(),
                minAdaForChange: minAdaForChange.toString(),
                availableAfterFeeAndChange:
                  availableAfterFeeAndChange.toString(),
              },
            )
          }
        } else {
          // When not sending all ADA, ensure output doesn't exceed available after fees
          const maxSendableAda =
            availableAfterFeeAndChange > minAdaForEntry
              ? availableAfterFeeAndChange
              : minAdaForEntry

          if (
            totalOutputAda > maxSendableAda &&
            maxSendableAda >= minAdaForEntry
          ) {
            getLogger().debug(
              'createSendTx: Proactively reducing amount for subtractFeeFromAmount',
              {
                totalInputAda: totalInputAda.toString(),
                totalOutputAda: totalOutputAda.toString(),
                conservativeFeeEstimate: conservativeFeeEstimate.toString(),
                minAdaForChange: minAdaForChange.toString(),
                maxSendableAda: maxSendableAda.toString(),
                minAdaForEntry: minAdaForEntry.toString(),
              },
            )

            // Update the first entry with reduced amount
            entries[0] = {
              ...firstEntry,
              amounts: {
                ...firstEntry.amounts,
                [primaryTokenId]: maxSendableAda.toString() as Balance.Quantity,
              },
            }
          }
        }
      }
    }

    // Build transaction first to get actual fee
    // If subtractFeeFromAmount is true and initial build fails with "Not enough ADA" or "Insufficient input",
    // we'll catch it and retry with reduced amount
    let result: {cbor: string; fee: bigint} | undefined
    let initialBuildFailed = false

    try {
      result = await buildTxWithEntries(entries)
      getLogger().debug('createSendTx: Initial build completed', {
        subtractFeeFromAmount,
        fee: result.fee.toString(),
        entriesCount: entries.length,
        totalInputAda: selectedUtxos
          .reduce(
            (sum: bigint, utxo: ModernUtxo) =>
              sum +
              BigInt(utxo.balance[primaryTokenId] ?? Branded.ZERO_QUANTITY),
            BigInt(0),
          )
          .toString(),
        totalOutputAda: entries
          .reduce(
            (sum, entry) =>
              sum +
              BigInt(entry.amounts[primaryTokenId] ?? Branded.ZERO_QUANTITY),
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

      getLogger().debug('createSendTx: Initial build failed', {
        subtractFeeFromAmount,
        errorMessage,
        isNotEnoughAdaError,
        isInsufficientInputError,
        entriesCount: entries.length,
        totalInputAda: selectedUtxos
          .reduce(
            (sum: bigint, utxo: ModernUtxo) =>
              sum +
              BigInt(utxo.balance[primaryTokenId] ?? Branded.ZERO_QUANTITY),
            BigInt(0),
          )
          .toString(),
        totalOutputAda: entries
          .reduce(
            (sum, entry) =>
              sum +
              BigInt(entry.amounts[primaryTokenId] ?? Branded.ZERO_QUANTITY),
            BigInt(0),
          )
          .toString(),
      })

      // Check if this is an error about insufficient ADA for change output with tokens
      const isChangeOutputError =
        errorMessage.includes('Not enough ADA to create change output') ||
        errorMessage.includes('change output requires more ADA')

      // If subtractFeeFromAmount is true and we got "Not enough ADA" or "Insufficient input" error,
      // we'll handle it by reducing the amount and retrying
      // Also handle change output errors even when subtractFeeFromAmount is false,
      // as this is necessary to accommodate tokens in change output
      if (
        (subtractFeeFromAmount || isChangeOutputError) &&
        (isNotEnoughAdaError ||
          isInsufficientInputError ||
          isChangeOutputError) &&
        entries.length > 0
      ) {
        initialBuildFailed = true
        getLogger().debug(
          'createSendTx: Initial build failed, will retry with reduced amount',
          {
            subtractFeeFromAmount,
            isChangeOutputError,
            errorMessage,
            errorType: isChangeOutputError
              ? 'ChangeOutputInsufficientAda'
              : isNotEnoughAdaError
                ? 'NotEnoughAda'
                : 'InsufficientInput',
          },
        )
      } else {
        // Re-throw if it's not the error we're handling
        throw error
      }
    }

    // If subtractFeeFromAmount is true OR we had a change output error, adjust the first output and rebuild
    // This ensures that when sending MAX, the fee is automatically subtracted
    // from the output amount, preventing "Not enough ADA leftover" or "Insufficient input" errors
    // Also handles cases where change output requires more ADA due to tokens
    if ((subtractFeeFromAmount || initialBuildFailed) && entries.length > 0) {
      const firstEntry = entries[0]
      if (firstEntry) {
        // Check if selected UTXOs have non-ADA assets that will go to change
        const totalInputAda = selectedUtxos.reduce(
          (sum, utxo) =>
            sum + BigInt(utxo.balance[primaryTokenId] ?? Branded.ZERO_QUANTITY),
          BigInt(0),
        )

        // Calculate total output ADA (excluding change)
        const totalOutputAda = entries.reduce(
          (sum, entry) =>
            sum +
            BigInt(entry.amounts[primaryTokenId] ?? Branded.ZERO_QUANTITY),
          BigInt(0),
        )

        getLogger().debug('createSendTx: Preparing fee adjustment', {
          subtractFeeFromAmount,
          initialBuildFailed,
          totalInputAda: totalInputAda.toString(),
          totalOutputAda: totalOutputAda.toString(),
          fee: result?.fee.toString() || 'unknown',
          originalEntryAdaAmount: originalEntryAdaAmount.toString(),
          firstEntryAdaAmount:
            firstEntry.amounts[primaryTokenId] ?? Branded.ZERO_QUANTITY,
        })

        // Calculate total input amounts for each token
        const totalInputAmounts: Record<string, bigint> = {}
        for (const utxo of selectedUtxos) {
          for (const [tokenId, quantity] of Object.entries(utxo.balance)) {
            totalInputAmounts[tokenId] =
              (totalInputAmounts[tokenId] || BigInt(0)) +
              BigInt(quantity as string | number)
          }
        }

        // Calculate total output amounts for each token
        const totalOutputAmounts: Record<string, bigint> = {}
        for (const entry of entries) {
          for (const [tokenId, quantity] of Object.entries(entry.amounts)) {
            totalOutputAmounts[tokenId] =
              (totalOutputAmounts[tokenId] || BigInt(0)) +
              BigInt(quantity as string | number)
          }
        }

        // Calculate tokens that will be in change output
        const changeOutputTokens: Record<TokenId, bigint> = {}
        let hasNonAdaAssetsInChange = false
        for (const [tokenId, inputAmount] of Object.entries(
          totalInputAmounts,
        )) {
          if (tokenId === primaryTokenId) continue
          const outputAmount = totalOutputAmounts[tokenId] || BigInt(0)
          const remaining = inputAmount - outputAmount
          if (remaining > BigInt(0)) {
            hasNonAdaAssetsInChange = true
            changeOutputTokens[tokenId as TokenId] = remaining
          }
        }

        const currentAdaAmount = BigInt(
          firstEntry.amounts[primaryTokenId] ?? Branded.ZERO_QUANTITY,
        )
        const minAdaForEntry = entryMinAda.get(0) || minUtxoValue

        // If initial build failed, use iterative approach to find the right amount
        // If initial build succeeded, we can do a single adjustment with actual fee
        if (initialBuildFailed) {
          // Iterative approach: keep reducing until transaction builds successfully
          const estimatedFee =
            BigInt(protocolParams.linearFee.constant) +
            BigInt(protocolParams.linearFee.coefficient) * BigInt(500) // Estimate: 500 bytes

          // Calculate accurate minimum ADA for change output using CSL
          let minAdaForChange = BigInt(0)
          if (hasNonAdaAssetsInChange) {
            try {
              minAdaForChange = await calculateChangeOutputMinAda(
                changeAddress,
                changeOutputTokens,
                {
                  coinsPerUtxoByte: protocolParams.coinsPerUtxoByte,
                  linearFee: protocolParams.linearFee,
                  minimumUtxoVal: minUtxoValue.toString(),
                },
                primaryTokenId,
              )
              getLogger().debug(
                'createSendTx: Calculated accurate minAdaForChange',
                {
                  minAdaForChange: minAdaForChange.toString(),
                  tokenCount: Object.keys(changeOutputTokens).length,
                },
              )
            } catch (error) {
              // Fallback to conservative estimate if calculation fails
              getLogger().debug(
                'createSendTx: Failed to calculate minAdaForChange, using estimate',
                {
                  error: error instanceof Error ? error.message : String(error),
                },
              )
              minAdaForChange = (minUtxoValue * BigInt(3)) / BigInt(2) // 1.5x fallback
            }
          } else {
            // No tokens in change, use base minimum
            minAdaForChange = minUtxoValue
          }

          // Check if proactive reduction already happened
          // Compare currentAdaAmount to the original firstEntry amount (before any modifications)
          // Use the stored originalEntryAdaAmount variable, not entries[0] which may have been modified
          const wasProactivelyReduced =
            currentAdaAmount < originalEntryAdaAmount

          // Start with initial reduction
          // If proactive reduction already happened, reduce more conservatively
          // Otherwise, reduce appropriately based on subtractFeeFromAmount
          let attemptAdaAmount: bigint
          if (wasProactivelyReduced) {
            // Already reduced proactively, so reduce by smaller increments
            // The proactive reduction already accounted for conservativeFeeEstimate + minAdaForChange
            // So we only need to reduce by a small amount (~0.5 ADA) and iterate
            attemptAdaAmount = currentAdaAmount - BigInt('500000') // ~0.5 ADA initial reduction
          } else {
            // Not proactively reduced
            if (subtractFeeFromAmount) {
              // Fee is subtracted from output, so reduce by fee + minAdaForChange
              attemptAdaAmount =
                currentAdaAmount - estimatedFee - minAdaForChange
            } else {
              // Fee comes from inputs, minAdaForChange is for change output (from remaining ADA)
              // So we only need to reduce by fee to ensure we have enough for fee + change
              // The change output will come from remaining ADA after sending
              attemptAdaAmount = currentAdaAmount - estimatedFee
            }
          }
          let lastSuccessfulAmount: bigint | undefined
          const maxAttempts = 10
          let attempt = 0

          getLogger().debug('createSendTx: Starting iterative fee adjustment', {
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
              getLogger().error(
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
              getLogger().debug(
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
                // Reduce amount further
                // If proactive reduction already happened, use smaller fixed increments
                // Otherwise, use percentage-based reduction
                let reductionAmount: bigint
                if (wasProactivelyReduced) {
                  // Already reduced proactively, use smaller fixed increments (0.5 ADA)
                  reductionAmount = BigInt('500000')
                } else {
                  // Not proactively reduced, use percentage-based reduction (5%)
                  reductionAmount = (attemptAdaAmount * BigInt(5)) / BigInt(100)
                }
                attemptAdaAmount = attemptAdaAmount - reductionAmount

                getLogger().debug(
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
                getLogger().error(
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
            // After max attempts, throw NotEnoughMoneyToSendError so it can be properly handled by UI
            getLogger().error(
              'createSendTx: Failed to build transaction after max attempts',
              {
                maxAttempts,
                finalAttemptAmount: attemptAdaAmount.toString(),
                minAdaForChange: minAdaForChange.toString(),
                hasNonAdaAssetsInChange,
              },
            )
            throw new NotEnoughMoneyToSendError()
          }
        } else {
          // Initial build succeeded
          // Check if proactive reduction already happened
          // Use the stored original amount (before any modifications)
          const wasProactivelyReduced =
            currentAdaAmount < originalEntryAdaAmount

          if (wasProactivelyReduced) {
            // Proactive reduction already happened and build succeeded
            // Don't reduce further - the proactive reduction already accounted for fee and change
            getLogger().debug(
              'createSendTx: Build succeeded after proactive reduction, no further adjustment needed',
              {
                currentAdaAmount: currentAdaAmount.toString(),
                originalEntryAdaAmount: originalEntryAdaAmount.toString(),
                fee: result!.fee.toString(),
              },
            )
            // Use the current amount as-is since proactive reduction already handled it
          } else {
            // No proactive reduction happened, but subtractFeeFromAmount is true
            // Only subtract the actual fee (not minAdaForChange - that's for change output)
            const adjustedAdaAmount = currentAdaAmount - result!.fee
            const finalAdaAmount =
              adjustedAdaAmount > minAdaForEntry
                ? adjustedAdaAmount
                : minAdaForEntry

            getLogger().debug(
              'createSendTx: Subtracting fee from amount (no proactive reduction)',
              {
                currentAdaAmount: currentAdaAmount.toString(),
                fee: result!.fee.toString(),
                adjustedAdaAmount: adjustedAdaAmount.toString(),
                finalAdaAmount: finalAdaAmount.toString(),
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
              getLogger().debug(
                'createSendTx: Rebuilt with fee-adjusted amount',
                {
                  finalAdaAmount: finalAdaAmount.toString(),
                  newFee: result.fee.toString(),
                },
              )
            }
          }
        }
      }
    }

    if (!result) {
      // If result is undefined and we had initial build failure, it means we couldn't build the transaction
      // This typically indicates insufficient funds
      if (initialBuildFailed) {
        getLogger().error(
          'createSendTx: Transaction build failed - result is undefined after retries',
          {
            subtractFeeFromAmount,
            entriesCount: entries.length,
          },
        )
        throw new NotEnoughMoneyToSendError()
      }
      throw new Error('Transaction build failed: result is undefined')
    }
    return {cbor: result.cbor}
  } catch (e: unknown) {
    if (e instanceof NotEnoughMoneyToSendError || e instanceof NoOutputsError) {
      const err = e as Error
      getLogger().error('createSendTx: Transaction creation failed', {
        errorType: err.constructor.name,
        errorMessage: err.message,
        entriesCount: entries.length,
      })
      throw e
    }
    const error = e instanceof Error ? e : new Error(String(e))
    getLogger().error('createSendTx: Unexpected error', {
      error: error.message,
      errorStack: error.stack,
      entriesCount: entries.length,
    })
    throw new Error(`Failed to create send transaction: ${error.message}`)
  }
}
