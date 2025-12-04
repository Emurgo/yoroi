import {cardanoConfig} from '@yoroi/blockchains'
import {isHex} from '@yoroi/common'
import {getLogger} from '@yoroi/common'
import {
  ModernUtxo,
  NoOutputsError,
  NotEnoughMoneyToSendError,
  addInputs,
  addOutput,
  buildRecipeTransaction,
  createCardanoHaskellConfig,
  createTransactionBuilder,
  setChangeAddress,
  setTTLWithBuffer,
} from '@yoroi/tx'
import {Address, App, Balance, Branded, Portfolio, Wallet} from '@yoroi/types'

import type {Address as CSLAddress} from '@emurgo/cross-csl-core'

import {cardanoValueFromAmounts} from '../cardanoValueFromAmounts'
import {CardanoMobileWrapped} from '../wrappedCsl'

export type CreateUtxoConsolidationTxParams = {
  utxos: ModernUtxo[]
  externalAddresses: Address[]
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
}

export async function createUtxoConsolidationTx({
  utxos,
  externalAddresses,
  primaryTokenId,
  protocolParams,
  networkId,
  getAbsoluteSlotNumber,
  getChangeAddress,
  addressMode,
}: CreateUtxoConsolidationTxParams): Promise<{cbor: string}> {
  const absSlotNumber = await getAbsoluteSlotNumber()
  const changeAddressRaw = getChangeAddress(addressMode)
  const changeAddress =
    typeof changeAddressRaw === 'string'
      ? (changeAddressRaw as Address)
      : changeAddressRaw

  if (externalAddresses.length === 0) {
    throw new Error('No external addresses available')
  }

  const firstAddressRaw = externalAddresses[0]
  if (!firstAddressRaw) {
    throw new Error('First address is undefined')
  }
  const firstAddress =
    typeof firstAddressRaw === 'string'
      ? (firstAddressRaw as Address)
      : firstAddressRaw

  // Filter UTXOs that are NOT in the first address (these will be consolidated)
  const utxosToConsolidate = utxos.filter((utxo) => {
    const utxoReceiverStr =
      typeof utxo.receiver === 'string' ? utxo.receiver : utxo.receiver
    const firstAddrStr =
      typeof firstAddress === 'string' ? firstAddress : firstAddress
    return utxoReceiverStr !== firstAddrStr
  })

  // Get UTXOs from the first address that can be used to help pay for fees
  const utxosFromFirstAddress = utxos.filter((utxo) => {
    const utxoReceiverStr =
      typeof utxo.receiver === 'string' ? utxo.receiver : utxo.receiver
    const firstAddrStr =
      typeof firstAddress === 'string' ? firstAddress : firstAddress
    return utxoReceiverStr === firstAddrStr
  })

  if (utxosToConsolidate.length === 0) {
    throw new Error('No UTXOs to consolidate')
  }

  // Sum all amounts from UTXOs to consolidate
  // We'll send all tokens and most ADA, leaving room for fees
  const consolidatedAmounts: Balance.Amounts = {}
  let totalAdaFromConsolidation = BigInt(0)

  // Also calculate total ADA available from first address UTXOs (for fee payment)
  let totalAdaFromFirstAddress = BigInt(0)
  for (const utxo of utxosFromFirstAddress) {
    totalAdaFromFirstAddress += BigInt(utxo.balance[primaryTokenId] || '0')
  }

  for (const utxo of utxosToConsolidate) {
    for (const [tokenId, quantity] of Object.entries(utxo.balance)) {
      const tokenIdBranded = Branded.asTokenId(tokenId)
      if (tokenIdBranded === primaryTokenId) {
        // Sum ADA separately
        totalAdaFromConsolidation += BigInt(quantity)
      } else {
        // Send all non-ADA tokens
        const current = BigInt(
          consolidatedAmounts[tokenIdBranded] ?? Branded.ZERO_QUANTITY,
        )
        const toAdd = BigInt(quantity)
        consolidatedAmounts[tokenIdBranded] = (
          current + toAdd
        ).toString() as Balance.Quantity
      }
    }
  }

  // Total ADA available = consolidation UTXOs + first address UTXOs
  const totalAda = totalAdaFromConsolidation + totalAdaFromFirstAddress

  const protocolParamsConfig = createCardanoHaskellConfig(
    protocolParams,
    networkId,
  )

  const baseMinUtxoValue = BigInt(cardanoConfig.params.minUtxoValue.toString())
  const hasTokens = Object.keys(consolidatedAmounts).length > 0

  // Calculate actual minimum UTXO value if we have tokens
  // This is critical because outputs with tokens require more ADA than the base minimum
  let actualMinUtxoValue = baseMinUtxoValue
  if (hasTokens) {
    try {
      actualMinUtxoValue = await CardanoMobileWrapped.cslScope(async (csl) => {
        // Normalize address
        let normalizedAddress: CSLAddress | null = null
        if (csl.ByronAddress.isValid(firstAddress)) {
          const byronAddr = csl.ByronAddress.fromBase58(firstAddress)
          normalizedAddress = byronAddr.toAddress()
        } else {
          const isHexAddr = isHex(firstAddress)
          normalizedAddress = isHexAddr
            ? csl.Address.fromHex(firstAddress)
            : csl.Address.fromBech32(firstAddress)
        }

        if (!normalizedAddress || normalizedAddress.isMalformed()) {
          getLogger().error(
            'createUtxoConsolidationTx: Failed to normalize address for minAda calculation',
            {
              address: firstAddress,
            },
          )
          throw new Error(`Invalid address: ${firstAddress}`)
        }

        // Create value with tokens (using 0 ADA initially to calculate minimum)
        const tempAmounts: Balance.Amounts = {
          ...consolidatedAmounts,
          [primaryTokenId]: '0',
        }

        let value
        try {
          value = cardanoValueFromAmounts(csl, tempAmounts, primaryTokenId)
          if (!value) {
            getLogger().error(
              'createUtxoConsolidationTx: cardanoValueFromAmounts returned null',
              {
                address: firstAddress,
                amounts: consolidatedAmounts,
              },
            )
            throw new Error(
              'Failed to create Value for minAda calculation: cardanoValueFromAmounts returned null',
            )
          }
        } catch (error) {
          getLogger().error(
            'createUtxoConsolidationTx: Error creating Value for minAda calculation',
            {
              address: firstAddress,
              amounts: consolidatedAmounts,
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
            'createUtxoConsolidationTx: Failed to create TransactionOutput for minAda calculation',
            {
              address: firstAddress,
              valueCoin: errorValueCoin ? errorValueCoin.toStr() : '0',
              hasMultiasset: errorMultiasset
                ? errorMultiasset.len() > 0
                : false,
            },
          )
          throw new Error(
            `Failed to create TransactionOutput for minAda calculation: Pointer is NULL for address ${firstAddress}`,
          )
        }

        const dataCost = csl.DataCost.newCoinsPerByte(
          csl.BigNum.fromStr(protocolParams.coinsPerUtxoByte),
        )
        if (!dataCost) {
          getLogger().error(
            'createUtxoConsolidationTx: Failed to create DataCost for minAda calculation',
          )
          throw new Error('Failed to create DataCost for minAda calculation')
        }

        const minAda = csl.minAdaForOutput(txOutput, dataCost)
        if (!minAda) {
          getLogger().error(
            'createUtxoConsolidationTx: Failed to calculate minAdaForOutput',
            {
              address: firstAddress,
            },
          )
          throw new Error('Failed to calculate minAdaForOutput')
        }

        return BigInt(minAda.toStr())
      })
    } catch (error) {
      getLogger().error(
        'createUtxoConsolidationTx: Failed to calculate actual min UTXO value, using base minimum',
        {
          error: error instanceof Error ? error.message : String(error),
          errorStack: error instanceof Error ? error.stack : undefined,
          baseMinUtxoValue: baseMinUtxoValue.toString(),
        },
      )
      // Fall back to base minimum if calculation fails
      actualMinUtxoValue = baseMinUtxoValue
    }
  }

  // Estimate fee conservatively - actual fee will be calculated by builder
  // Use a larger estimate to ensure we have enough room
  // Fee = constant + (coefficient * tx_size_in_bytes)
  // For consolidation with multiple UTXOs, estimate larger size
  const estimatedTxSize = 1000 // bytes - conservative estimate for multiple UTXOs
  const estimatedFee =
    BigInt(protocolParams.linearFee.constant) +
    BigInt(protocolParams.linearFee.coefficient) * BigInt(estimatedTxSize)

  // Add safety margin - reserve extra ADA to account for fee estimation errors
  // The actual fee might be higher than estimated, so we'll be conservative
  const safetyMargin = BigInt(50000) // 0.05 ADA safety margin
  const reservedAda = estimatedFee + safetyMargin

  // Calculate ADA to send: use only consolidation UTXOs initially
  // We'll try building first without first address UTXOs, then add them if needed
  let adaToSend = totalAdaFromConsolidation - reservedAda

  // If we have tokens, we need at least the actual minimum UTXO value in output
  if (hasTokens) {
    // Check if we have at least the minimum UTXO value (considering all available UTXOs)
    // If we don't, consolidation is impossible
    if (totalAda < actualMinUtxoValue) {
      getLogger().error(
        'createUtxoConsolidationTx: Insufficient ADA for minimum UTXO value',
        {
          totalAdaFromConsolidation: totalAdaFromConsolidation.toString(),
          totalAdaFromFirstAddress: totalAdaFromFirstAddress.toString(),
          totalAda: totalAda.toString(),
          actualMinUtxoValue: actualMinUtxoValue.toString(),
          shortfall: (actualMinUtxoValue - totalAda).toString(),
          calculation: {
            step1_totalAdaFromConsolidation:
              totalAdaFromConsolidation.toString(),
            step2_totalAdaFromFirstAddress: totalAdaFromFirstAddress.toString(),
            step3_totalAda: totalAda.toString(),
            step4_actualMinUtxoValue: actualMinUtxoValue.toString(),
            step5_hasEnoughForMinUtxo: totalAda >= actualMinUtxoValue,
          },
        },
      )
      throw new Error(
        `Insufficient ADA for minimum UTXO value. Required: ${actualMinUtxoValue.toString()}, Available from consolidation UTXOs: ${totalAdaFromConsolidation.toString()}, Available from first address: ${totalAdaFromFirstAddress.toString()}, Total: ${totalAda.toString()}`,
      )
    }

    // If adaToSend is less than minimum after reserving fees, check if we can proceed
    // We'll try building first, and if it fails, we'll add first address UTXOs
    if (adaToSend < actualMinUtxoValue) {
      // Check if we have at least minimum UTXO value from consolidation UTXOs alone
      // If not, and we don't have first address UTXOs, we can't proceed
      if (totalAdaFromConsolidation < actualMinUtxoValue) {
        const requiredAda = reservedAda + actualMinUtxoValue
        const hasFirstAddressUtxos = utxosFromFirstAddress.length > 0

        if (!hasFirstAddressUtxos) {
          getLogger().error(
            'createUtxoConsolidationTx: Insufficient ADA for tokens and fees, no first address UTXOs available',
            {
              totalAdaFromConsolidation: totalAdaFromConsolidation.toString(),
              reservedAda: reservedAda.toString(),
              actualMinUtxoValue: actualMinUtxoValue.toString(),
              baseMinUtxoValue: baseMinUtxoValue.toString(),
              requiredAda: requiredAda.toString(),
              shortfall:
                totalAdaFromConsolidation < requiredAda
                  ? (requiredAda - totalAdaFromConsolidation).toString()
                  : '0',
              calculation: {
                step1_totalAdaFromConsolidation:
                  totalAdaFromConsolidation.toString(),
                step2_reservedAda: reservedAda.toString(),
                step3_adaToSend: adaToSend.toString(),
                step4_actualMinUtxoValue: actualMinUtxoValue.toString(),
                step5_requiredAda: requiredAda.toString(),
                step6_hasEnough: totalAdaFromConsolidation >= requiredAda,
                step7_hasFirstAddressUtxos: hasFirstAddressUtxos,
              },
            },
          )
          throw new Error(
            `Insufficient ADA to cover fees and minimum UTXO value. Required: ${requiredAda.toString()}, Available from consolidation UTXOs: ${totalAdaFromConsolidation.toString()}, Actual min UTXO: ${actualMinUtxoValue.toString()}`,
          )
        }
      } else {
      }
    }

    // Use the actual minimum UTXO value (not the base minimum)
    adaToSend = actualMinUtxoValue
    consolidatedAmounts[primaryTokenId] =
      adaToSend.toString() as Balance.Quantity
  } else {
    // No tokens - just ADA UTXOs
    // Send all ADA minus reserved amount (change will handle the rest)

    if (adaToSend > 0n) {
      consolidatedAmounts[primaryTokenId] =
        adaToSend.toString() as Balance.Quantity
    } else if (totalAda > reservedAda) {
      // If we have more ADA than reserved, send at least some
      // Use a smaller amount to ensure we have enough for fees
      const minAdaToSend = BigInt(1000000) // 1 ADA minimum
      if (totalAda > reservedAda + minAdaToSend) {
        consolidatedAmounts[primaryTokenId] = (
          totalAda - reservedAda
        ).toString() as Balance.Quantity
      } else {
        // Very tight situation - send minimum and hope builder adjusts
        consolidatedAmounts[primaryTokenId] =
          minAdaToSend.toString() as Balance.Quantity
        getLogger().warn(
          'createUtxoConsolidationTx: Very tight ADA situation, using minimum',
          {
            minAdaToSend: minAdaToSend.toString(),
            totalAda: totalAda.toString(),
            reservedAda: reservedAda.toString(),
          },
        )
      }
    } else {
      getLogger().error(
        'createUtxoConsolidationTx: Cannot create output - insufficient ADA',
        {
          totalAda: totalAda.toString(),
          reservedAda: reservedAda.toString(),
          shortfall: (reservedAda - totalAda).toString(),
          calculation: {
            step1_totalAda: totalAda.toString(),
            step2_reservedAda: reservedAda.toString(),
            step3_adaToSend: adaToSend.toString(),
            step4_canCreateOutput: totalAda > reservedAda,
          },
        },
      )
      throw new Error(
        'Insufficient ADA to cover fees - cannot consolidate UTXOs',
      )
    }
  }

  try {
    // Build transaction using functional TransactionBuilder
    let builderState = createTransactionBuilder()

    // First, try with only UTXOs to consolidate (not from first address)
    builderState = addInputs(builderState, utxosToConsolidate)

    // Add output - remaining ADA will go back as change to first address
    builderState = addOutput(builderState, firstAddress, consolidatedAmounts)

    // Set change address
    builderState = setChangeAddress(builderState, changeAddress)

    // Set TTL with buffer
    builderState = setTTLWithBuffer(builderState, absSlotNumber.toNumber())

    try {
      const result = await buildRecipeTransaction(
        builderState,
        protocolParamsConfig,
        primaryTokenId,
      )

      return result
    } catch (buildError) {
      // If build fails due to insufficient funds, try adding first address UTXOs
      const errorMessage =
        buildError instanceof Error
          ? buildError.message.toLowerCase()
          : String(buildError).toLowerCase()
      const isInsufficientFundsError =
        buildError instanceof NotEnoughMoneyToSendError ||
        (buildError instanceof Error &&
          (errorMessage.includes('insufficient') ||
            errorMessage.includes('not enough') ||
            errorMessage.includes('less than') ||
            errorMessage.includes('shortage')))

      if (isInsufficientFundsError && utxosFromFirstAddress.length > 0) {
        getLogger().info(
          'createUtxoConsolidationTx: Build failed with insufficient funds, adding UTXOs from first address',
          {
            error:
              buildError instanceof Error
                ? buildError.message
                : String(buildError),
            utxosFromFirstAddressCount: utxosFromFirstAddress.length,
            totalAdaFromFirstAddress: totalAdaFromFirstAddress.toString(),
          },
        )

        // Add UTXOs from first address to help cover fees
        builderState = addInputs(builderState, utxosFromFirstAddress)

        const result = await buildRecipeTransaction(
          builderState,
          protocolParamsConfig,
          primaryTokenId,
        )

        return result
      }

      // If it's not an insufficient funds error, or we don't have first address UTXOs, rethrow
      throw buildError
    }
  } catch (e) {
    getLogger().error('createUtxoConsolidationTx: Transaction build failed', {
      error: e instanceof Error ? e.message : String(e),
      errorStack: e instanceof Error ? e.stack : undefined,
      errorType:
        e instanceof NotEnoughMoneyToSendError
          ? 'NotEnoughMoneyToSendError'
          : e instanceof NoOutputsError
            ? 'NoOutputsError'
            : 'Unknown',
      inputsCount: utxosToConsolidate.length,
      outputAmounts: consolidatedAmounts,
      totalAda: totalAda.toString(),
      reservedAda: reservedAda.toString(),
    })
    if (e instanceof NotEnoughMoneyToSendError || e instanceof NoOutputsError)
      throw e
    throw new App.Errors.LibraryError((e as Error).message)
  }
}
