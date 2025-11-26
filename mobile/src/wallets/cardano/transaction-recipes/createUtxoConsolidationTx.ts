import {cardanoConfig} from '@yoroi/blockchains'
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
import {App, Balance, Portfolio, Wallet} from '@yoroi/types'

import {logger} from '~/kernel/logger/logger'

export type CreateUtxoConsolidationTxParams = {
  utxos: ModernUtxo[]
  externalAddresses: string[]
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
  const changeAddress = getChangeAddress(addressMode)

  if (externalAddresses.length === 0) {
    throw new Error('No external addresses available')
  }

  const firstAddress = externalAddresses[0]
  if (!firstAddress) {
    throw new Error('First address is undefined')
  }

  // Filter UTXOs that are NOT in the first address
  const utxosToConsolidate = utxos.filter(
    (utxo) => utxo.receiver !== firstAddress,
  )

  if (utxosToConsolidate.length === 0) {
    throw new Error('No UTXOs to consolidate')
  }

  // Sum all amounts from UTXOs to consolidate
  // We'll send all tokens and most ADA, leaving room for fees
  const consolidatedAmounts: Balance.Amounts = {}
  let totalAda = BigInt(0)

  for (const utxo of utxosToConsolidate) {
    for (const [tokenId, quantity] of Object.entries(utxo.balance)) {
      if (tokenId === primaryTokenId) {
        // Sum ADA separately
        totalAda += BigInt(quantity)
      } else {
        // Send all non-ADA tokens
        const current = BigInt(consolidatedAmounts[tokenId] || '0')
        const toAdd = BigInt(quantity)
        consolidatedAmounts[tokenId] = (
          current + toAdd
        ).toString() as Balance.Quantity
      }
    }
  }

  const protocolParamsConfig = createCardanoHaskellConfig(
    protocolParams,
    networkId,
  )

  const minUtxoValue = BigInt(cardanoConfig.params.minUtxoValue.toString())
  const hasTokens = Object.keys(consolidatedAmounts).length > 0

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

  // Calculate ADA to send: total ADA minus reserved amount
  // The remaining ADA will go back as change to the first address
  let adaToSend = totalAda - reservedAda

  // If we have tokens, we need at least minimum UTXO value in output
  if (hasTokens) {
    if (adaToSend < minUtxoValue) {
      // If we don't have enough ADA after fees, we can't consolidate
      if (totalAda < reservedAda + minUtxoValue) {
        logger.error('UTXO consolidation: Insufficient ADA', {
          totalAda: totalAda.toString(),
          reservedAda: reservedAda.toString(),
          minUtxoValue: minUtxoValue.toString(),
          required: (reservedAda + minUtxoValue).toString(),
        })
        throw new Error('Insufficient ADA to cover fees and minimum UTXO value')
      }
      adaToSend = minUtxoValue
    }
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
      }
    } else {
      logger.error('UTXO consolidation: Cannot create output', {
        totalAda: totalAda.toString(),
        reservedAda: reservedAda.toString(),
      })
      throw new Error(
        'Insufficient ADA to cover fees - cannot consolidate UTXOs',
      )
    }
  }

  try {
    // Build transaction using functional TransactionBuilder
    let builderState = createTransactionBuilder()

    // Add all UTXOs to consolidate as inputs
    builderState = addInputs(builderState, utxosToConsolidate)

    // Add output - remaining ADA will go back as change to first address
    builderState = addOutput(builderState, firstAddress, consolidatedAmounts)

    // Set change address
    builderState = setChangeAddress(builderState, changeAddress)

    // Set TTL with buffer
    builderState = setTTLWithBuffer(builderState, absSlotNumber.toNumber())

    // Build the transaction
    return await buildRecipeTransaction(
      builderState,
      protocolParamsConfig,
      primaryTokenId,
    )
  } catch (e) {
    if (e instanceof NotEnoughMoneyToSendError || e instanceof NoOutputsError)
      throw e
    throw new App.Errors.LibraryError((e as Error).message)
  }
}
