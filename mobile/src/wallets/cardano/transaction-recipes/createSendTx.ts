import {isHex} from '@yoroi/common'
import {
  ModernUtxo,
  NoOutputsError,
  NotEnoughMoneyToSendError,
  TransactionOutput,
  addInputs,
  addMetadata,
  addOutput,
  buildRecipeTransaction,
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

    // Build transaction using functional TransactionBuilder
    let builderState = createTransactionBuilder()

    // Add only selected UTXOs as inputs
    builderState = addInputs(builderState, selectedUtxos)

    // Add outputs from entries
    // Ensure outputs with tokens have minimum UTXO value in ADA
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i]
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

    // Build the transaction
    const result = await buildRecipeTransaction(
      builderState,
      protocolParamsConfig,
      primaryTokenId,
    )

    return result
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
