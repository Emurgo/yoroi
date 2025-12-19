/**
 * UTXO Selection and Locked ADA Service
 *
 * Provides comprehensive verification and calculation capabilities for:
 * - UTXO selection strategies
 * - Locked ADA calculations
 * - Transfer feasibility analysis
 * - UTXO reorganization suggestions
 * - CNT-specific transfer requirements
 */
import {RawUtxo} from '@yoroi/api'
import {CardanoMobileWrapped} from '@yoroi/common'
import {isHex} from '@yoroi/common'
import {getLogger} from '@yoroi/logger'
import {primaryTokenId as defaultPrimaryTokenId} from '@yoroi/portfolio'
import {ModernUtxo} from '@yoroi/tx'
import {filterPureAdaUtxos, selectUtxosForAmounts} from '@yoroi/tx'
import {
  Address,
  Balance,
  Branded,
  PolicyId,
  Portfolio,
  TokenId,
  TransactionHash,
  UtxoId,
} from '@yoroi/types'

import {
  calcLockedDeposit,
  calcLockedDepositAfterRemovingTokens,
  calcOptimizedLockedDeposit,
} from './assetUtils'
import {cardanoValueFromAmounts} from './cardanoValueFromAmounts'
import {
  FeeEstimationError,
  InsufficientTokensError,
  UtxoSelectionFailedError,
  createErrorSuggestions,
} from './utxoServiceErrors'
import {
  AnalyzeReorganizationParams,
  AnalyzeTransferFeasibilityParams,
  CalculateCntTransferParams,
  CalculateLockedAdaParams,
  CntTransferResult,
  ConsolidationPlan,
  LockedAdaResult,
  ProtocolParams,
  ReorganizationOpportunity,
  ReorganizationResult,
  SelectUtxosForTransferParams,
  TransferFeasibilityResult,
  UtxoSelectionResult,
} from './utxoServiceTypes'

const logger = getLogger()

/**
 * Analyze transfer feasibility before attempting to build a transaction
 */
export async function analyzeTransferFeasibility(
  params: AnalyzeTransferFeasibilityParams,
): Promise<TransferFeasibilityResult> {
  const {
    utxos,
    requiredAmounts,
    protocolParams,
    primaryTokenId,
    estimatedFee = BigInt('200000'), // Default 0.2 ADA
    changeAddress,
  } = params

  const primaryTokenIdStr =
    typeof primaryTokenId === 'string' ? primaryTokenId : primaryTokenId

  try {
    // Calculate required ADA from outputs
    const requiredAdaFromOutputs = Object.entries(requiredAmounts).reduce(
      (sum, [tokenId, quantity]) => {
        if (tokenId === primaryTokenIdStr) {
          return sum + BigInt(quantity || '0')
        }
        return sum
      },
      BigInt(0),
    )

    // Select UTXOs for the transfer
    const selectionResult = await selectUtxosForTransfer({
      utxos,
      requiredAmounts,
      protocolParams,
      primaryTokenId,
      strategy: 'smart',
      estimatedFee,
      changeAddress,
    })

    // Calculate total input ADA
    const totalInputAda = selectionResult.totalInputAda

    // Calculate change output minimum ADA
    const changeOutputMinAda = selectionResult.changeOutputMinAda

    // Calculate total required ADA (outputs + fee + change minimum)
    const requiredAda =
      requiredAdaFromOutputs + BigInt(estimatedFee) + changeOutputMinAda

    // Calculate dynamic locked ADA (excluding UTXOs being spent)
    const tokensBeingSent = Object.entries(requiredAmounts).reduce(
      (acc, [tokenId, quantity]) => {
        if (tokenId !== primaryTokenIdStr) {
          acc[tokenId as Portfolio.Token.Id] = {
            info: {} as Portfolio.Token.Info,
            quantity: BigInt(quantity || '0'),
          } as Portfolio.Token.Amount
        }
        return acc
      },
      {} as Record<Portfolio.Token.Id, Portfolio.Token.Amount>,
    )

    const lockedAdaResult = await calculateLockedAda({
      utxos,
      protocolParams,
      tokensBeingSent:
        Object.keys(tokensBeingSent).length > 0 ? tokensBeingSent : undefined,
      primaryTokenId,
    })

    const dynamicLockedAda = lockedAdaResult.dynamicLocked

    // Calculate available ADA (total - dynamic locked)
    const totalAda = utxos.reduce(
      (sum, utxo) => sum + BigInt(utxo.balance[primaryTokenIdStr] || '0'),
      BigInt(0),
    )
    const availableAda = totalAda - dynamicLockedAda

    // Check feasibility
    const isFeasible =
      totalInputAda >= requiredAda && availableAda >= requiredAdaFromOutputs

    const suggestions: string[] = []
    let reason: string | undefined

    if (!isFeasible) {
      if (totalInputAda < requiredAda) {
        reason = `Insufficient ADA: Need ${requiredAda.toString()} but only ${totalInputAda.toString()} available from selected UTXOs`
        suggestions.push(
          `Reduce transfer amount by ${(requiredAda - totalInputAda).toString()} ADA to proceed`,
        )
      }

      if (availableAda < requiredAdaFromOutputs) {
        reason = `Insufficient spendable ADA: Need ${requiredAdaFromOutputs.toString()} but only ${availableAda.toString()} available (${dynamicLockedAda.toString()} ADA locked)`
        if (lockedAdaResult.optimizationSavings > BigInt(0)) {
          suggestions.push(
            `Consider consolidating CNT tokens to unlock ${lockedAdaResult.optimizationSavings.toString()} ADA`,
          )
        }
      }

      // Add error-specific suggestions
      const errorSuggestions = createErrorSuggestions('INSUFFICIENT_ADA', {
        requiredAda: requiredAda.toString(),
        availableAda: availableAda.toString(),
        unlockedByConsolidation: lockedAdaResult.optimizationSavings,
      })
      suggestions.push(...errorSuggestions)
    }

    return {
      isFeasible,
      reason,
      requiredAda,
      availableAda,
      suggestions,
      selectedUtxos: selectionResult.selectedUtxos,
      estimatedFee: BigInt(estimatedFee),
      changeOutputMinAda,
      dynamicLockedAda,
    }
  } catch (error) {
    logger.error(error as Error, {
      function: 'analyzeTransferFeasibility',
      utxosCount: utxos.length,
    })

    throw new FeeEstimationError(
      `Failed to analyze transfer feasibility: ${error instanceof Error ? error.message : String(error)}`,
      ['Try again with a simpler transaction', 'Reduce the number of outputs'],
    )
  }
}

/**
 * Select UTXOs for a transfer with smart selection strategies
 */
export async function selectUtxosForTransfer(
  params: SelectUtxosForTransferParams,
): Promise<UtxoSelectionResult> {
  const {
    utxos,
    requiredAmounts,
    protocolParams,
    primaryTokenId,
    strategy = 'smart',
    estimatedFee = BigInt('200000'),
    changeAddress,
  } = params

  const primaryTokenIdStr =
    typeof primaryTokenId === 'string' ? primaryTokenId : primaryTokenId

  try {
    // Use existing selectUtxosForAmounts as base
    const selectedUtxos = selectUtxosForAmounts(
      utxos,
      requiredAmounts,
      primaryTokenId,
      estimatedFee.toString(),
    )

    if (selectedUtxos.length === 0) {
      throw new UtxoSelectionFailedError(
        'No UTXOs could be selected for the transfer',
        ['Verify you have sufficient funds', 'Check UTXO availability'],
      )
    }

    // Calculate total input amounts
    const totalInputAda = selectedUtxos.reduce(
      (sum, utxo) => sum + BigInt(utxo.balance[primaryTokenIdStr] || '0'),
      BigInt(0),
    )

    const totalInputTokens: Record<TokenId, bigint> = {}
    for (const utxo of selectedUtxos) {
      for (const [tokenId, quantity] of Object.entries(utxo.balance)) {
        if (tokenId !== primaryTokenIdStr) {
          totalInputTokens[tokenId as TokenId] =
            (totalInputTokens[tokenId as TokenId] || BigInt(0)) +
            BigInt(quantity || '0')
        }
      }
    }

    // Calculate tokens that will go to change
    const changeOutputTokens: Record<TokenId, bigint> = {}
    for (const [tokenId, inputAmount] of Object.entries(totalInputTokens)) {
      const outputAmount = BigInt(requiredAmounts[tokenId as TokenId] || '0')
      const remaining = inputAmount - outputAmount
      if (remaining > BigInt(0)) {
        changeOutputTokens[tokenId as TokenId] = remaining
      }
    }

    // Calculate minimum ADA for change output using CSL
    const changeOutputMinAda = await calculateChangeOutputMinAda(
      changeAddress,
      changeOutputTokens,
      protocolParams,
      primaryTokenId,
    )

    // Generate warnings
    const warnings: string[] = []
    if (Object.keys(changeOutputTokens).length > 0) {
      const tokenCount = Object.keys(changeOutputTokens).length
      warnings.push(
        `Selected UTXOs contain ${tokenCount} token type(s) that will go to change output`,
      )
    }

    // Check for unexpected tokens in selected UTXOs
    const requiredTokenIds = new Set(
      Object.keys(requiredAmounts).filter((id) => id !== primaryTokenIdStr),
    )
    for (const utxo of selectedUtxos) {
      const utxoTokenIds = Object.keys(utxo.balance).filter(
        (id) => id !== primaryTokenIdStr,
      )
      for (const tokenId of utxoTokenIds) {
        if (!requiredTokenIds.has(tokenId)) {
          warnings.push(
            `UTXO ${utxo.txHash}:${utxo.txIndex} contains unexpected token ${tokenId} that will go to change`,
          )
        }
      }
    }

    return {
      selectedUtxos,
      selectionStrategy: strategy,
      totalInputAda,
      totalInputTokens,
      changeOutputTokens,
      changeOutputMinAda,
      warnings,
    }
  } catch (error) {
    logger.error(error as Error, {
      function: 'selectUtxosForTransfer',
      utxosCount: utxos.length,
      strategy,
    })

    if (error instanceof UtxoSelectionFailedError) {
      throw error
    }

    throw new UtxoSelectionFailedError(
      `Failed to select UTXOs: ${error instanceof Error ? error.message : String(error)}`,
      [
        'Try consolidating your UTXOs',
        'Reduce the number of tokens being sent',
      ],
    )
  }
}

/**
 * Calculate locked ADA with current, dynamic, and optimized values
 */
export async function calculateLockedAda(
  params: CalculateLockedAdaParams,
): Promise<LockedAdaResult> {
  const {utxos, protocolParams, tokensBeingSent, primaryTokenId} = params

  try {
    // Convert ModernUtxo to RawUtxo format for existing functions
    const rawUtxos = convertModernUtxosToRawUtxos(utxos, primaryTokenId)

    // Calculate current locked ADA
    const currentLockedBigNumber = await calcLockedDeposit({
      rawUtxos,
      coinsPerUtxoByteStr: protocolParams.coinsPerUtxoByte,
    })
    const currentLocked = BigInt(currentLockedBigNumber.toString())

    // Calculate dynamic locked ADA (after removing tokens being sent)
    let dynamicLocked = currentLocked
    if (tokensBeingSent && Object.keys(tokensBeingSent).length > 0) {
      const tokensBeingSentMap = new Map<string, string>()
      for (const [tokenId, tokenAmount] of Object.entries(tokensBeingSent)) {
        tokensBeingSentMap.set(tokenId, tokenAmount.quantity.toString())
      }

      const dynamicLockedBigNumber = await calcLockedDepositAfterRemovingTokens(
        {
          rawUtxos,
          coinsPerUtxoByteStr: protocolParams.coinsPerUtxoByte,
          tokensBeingSent: tokensBeingSentMap,
        },
      )
      dynamicLocked = BigInt(dynamicLockedBigNumber.toString())
    }

    // Calculate optimized locked ADA (if CNTs were consolidated)
    const optimizedResult = await calcOptimizedLockedDeposit({
      rawUtxos,
      coinsPerUtxoByteStr: protocolParams.coinsPerUtxoByte,
      maxIterations: 5,
    })
    const optimizedLocked = BigInt(optimizedResult.optimized.toString())
    const optimizationSavings = BigInt(optimizedResult.savings.toString())

    // Calculate unlocked by sending
    const unlockedBySending = currentLocked - dynamicLocked

    // Create consolidation plan if there are savings
    let consolidationPlan: ConsolidationPlan | null = null
    if (optimizationSavings > BigInt(0)) {
      // Find UTXOs with CNT tokens that could be consolidated
      const cntUtxos = utxos.filter((utxo) => {
        return Object.keys(utxo.balance).some((tokenIdStr) => {
          const tokenId = tokenIdStr as TokenId
          if (tokenId === (primaryTokenId as TokenId)) return false
          // Check if token is a CNT (has assets)
          const tokenAmount = utxo.balance[tokenId]
          return tokenAmount && BigInt(tokenAmount) > BigInt(0)
        })
      })

      if (cntUtxos.length > 1) {
        consolidationPlan = {
          utxosToConsolidate: cntUtxos,
          targetUtxoCount: Math.ceil(cntUtxos.length / 2), // Target half the UTXOs
          estimatedSavings: optimizationSavings,
          steps: [
            `Consolidate ${cntUtxos.length} UTXOs containing CNT tokens`,
            `Target: ${Math.ceil(cntUtxos.length / 2)} UTXOs`,
            `Estimated savings: ${optimizationSavings.toString()} ADA`,
          ],
        }
      }
    }

    return {
      currentLocked,
      dynamicLocked,
      optimizedLocked,
      unlockedBySending,
      optimizationSavings,
      consolidationPlan,
    }
  } catch (error) {
    logger.error(error as Error, {
      function: 'calculateLockedAda',
      utxosCount: utxos.length,
    })

    // Return fallback values
    return {
      currentLocked: BigInt(0),
      dynamicLocked: BigInt(0),
      optimizedLocked: BigInt(0),
      unlockedBySending: BigInt(0),
      optimizationSavings: BigInt(0),
      consolidationPlan: null,
    }
  }
}

/**
 * Analyze UTXO reorganization opportunities
 */
export async function analyzeReorganizationOpportunities(
  params: AnalyzeReorganizationParams,
): Promise<ReorganizationResult> {
  const {utxos, protocolParams, primaryTokenId} = params

  const primaryTokenIdStr =
    typeof primaryTokenId === 'string' ? primaryTokenId : primaryTokenId

  const opportunities: ReorganizationOpportunity[] = []

  try {
    // 1. Find CNT consolidation opportunities
    const cntUtxos = utxos.filter((utxo) => {
      const tokenIds = Object.keys(utxo.balance).filter(
        (id) => id !== primaryTokenIdStr,
      )
      return tokenIds.length > 0
    })

    if (cntUtxos.length > 1) {
      // Group CNT UTXOs by policy ID to find consolidation opportunities
      const cntByPolicy = new Map<string, ModernUtxo[]>()
      for (const utxo of cntUtxos) {
        for (const tokenId of Object.keys(utxo.balance)) {
          if (tokenId === primaryTokenIdStr) continue
          const policyId = tokenId.substring(0, 56) // First 56 hex chars
          if (!cntByPolicy.has(policyId)) {
            cntByPolicy.set(policyId, [])
          }
          if (!cntByPolicy.get(policyId)!.includes(utxo)) {
            cntByPolicy.get(policyId)!.push(utxo)
          }
        }
      }

      for (const [policyId, policyUtxos] of cntByPolicy.entries()) {
        if (policyUtxos.length > 1) {
          // Calculate current locked ADA for these UTXOs
          const currentLocked = await calculateLockedAda({
            utxos: policyUtxos,
            protocolParams,
            primaryTokenId,
          })

          // Estimate consolidated locked ADA (simplified: assume 1 UTXO)
          // This is a rough estimate - actual calculation would require building a transaction
          const estimatedConsolidatedLocked =
            currentLocked.currentLocked / BigInt(policyUtxos.length)
          const potentialSavings =
            currentLocked.currentLocked - estimatedConsolidatedLocked

          // Estimate consolidation fee (rough: 0.2 ADA per UTXO consolidated)
          const estimatedFee = BigInt(policyUtxos.length) * BigInt('200000')
          const netBenefit = potentialSavings - estimatedFee

          if (netBenefit > BigInt(0)) {
            opportunities.push({
              type: 'consolidate_cnt',
              description: `Consolidate ${policyUtxos.length} UTXOs with CNT tokens from policy ${policyId.substring(0, 8)}...`,
              utxosInvolved: policyUtxos,
              potentialSavings,
              estimatedFee,
              netBenefit,
              steps: [
                `Select ${policyUtxos.length} UTXOs containing CNT tokens`,
                `Create consolidation transaction to merge into fewer UTXOs`,
                `Estimated fee: ${estimatedFee.toString()} ADA`,
                `Net benefit: ${netBenefit.toString()} ADA`,
              ],
            })
          }
        }
      }
    }

    // 2. Find small UTXO merge opportunities
    const pureAdaUtxos = filterPureAdaUtxos(utxos, primaryTokenId)
    const smallUtxos = pureAdaUtxos.filter((utxo) => {
      const adaAmount = BigInt(utxo.balance[primaryTokenIdStr] || '0')
      return adaAmount < BigInt('5000000') // Less than 5 ADA
    })

    if (smallUtxos.length > 3) {
      // Estimate savings from merging small UTXOs
      // This is simplified - actual calculation would require building a transaction
      const estimatedFee = BigInt(smallUtxos.length) * BigInt('150000') // Lower fee estimate
      const potentialSavings = BigInt('0') // Minimal savings, mainly for convenience
      const netBenefit = potentialSavings - estimatedFee

      // Only suggest if there are many small UTXOs (convenience factor)
      if (smallUtxos.length > 5) {
        opportunities.push({
          type: 'merge_small_utxos',
          description: `Merge ${smallUtxos.length} small UTXOs for better organization`,
          utxosInvolved: smallUtxos.slice(0, 10), // Limit to first 10
          potentialSavings,
          estimatedFee,
          netBenefit,
          steps: [
            `Select ${smallUtxos.length} small UTXOs (< 5 ADA each)`,
            `Create consolidation transaction`,
            `Estimated fee: ${estimatedFee.toString()} ADA`,
            `Benefit: Better UTXO organization`,
          ],
        })
      }
    }

    const totalPotentialSavings = opportunities.reduce(
      (sum, opp) => sum + opp.netBenefit,
      BigInt(0),
    )

    return {
      opportunities,
      totalPotentialSavings,
    }
  } catch (error) {
    logger.error(error as Error, {
      function: 'analyzeReorganizationOpportunities',
      utxosCount: utxos.length,
    })

    return {
      opportunities: [],
      totalPotentialSavings: BigInt(0),
    }
  }
}

/**
 * Calculate CNT transfer requirements
 */
export async function calculateCntTransferRequirements(
  params: CalculateCntTransferParams,
): Promise<CntTransferResult> {
  const {
    cntTokenId,
    cntAmount,
    utxos,
    protocolParams,
    primaryTokenId,
    changeAddress,
  } = params

  const primaryTokenIdStr =
    typeof primaryTokenId === 'string' ? primaryTokenId : primaryTokenId

  try {
    // Find UTXOs containing the CNT token
    const utxosContainingCnt = utxos.filter((utxo) => {
      const tokenAmount = utxo.balance[cntTokenId]
      return (
        tokenAmount &&
        BigInt(tokenAmount) >= BigInt(cntAmount.quantity.toString())
      )
    })

    if (utxosContainingCnt.length === 0) {
      throw new InsufficientTokensError(
        cntTokenId,
        BigInt(cntAmount.quantity.toString()),
        BigInt(0),
        ['Verify you have enough CNT tokens in your wallet'],
      )
    }

    // Calculate minimum ADA required for output with CNT
    const requiredAda = await calculateChangeOutputMinAda(
      changeAddress,
      {[cntTokenId]: BigInt(cntAmount.quantity.toString())},
      protocolParams,
      primaryTokenId,
    )

    // Check if sending CNT will unlock ADA (if entire UTXO is spent)
    let willUnlockAda = BigInt(0)
    for (const utxo of utxosContainingCnt) {
      const utxoCntAmount = BigInt(utxo.balance[cntTokenId] || '0')
      const sendingAmount = BigInt(cntAmount.quantity.toString())

      // If we're sending the entire CNT amount from this UTXO
      if (utxoCntAmount === sendingAmount) {
        // Check if UTXO has other tokens
        const otherTokens = Object.keys(utxo.balance).filter(
          (id) => id !== primaryTokenIdStr && id !== cntTokenId,
        )

        // If no other tokens, the UTXO will be fully spent and ADA unlocked
        if (otherTokens.length === 0) {
          const utxoAda = BigInt(utxo.balance[primaryTokenIdStr] || '0')
          // Calculate locked ADA for this UTXO
          const rawUtxos = convertModernUtxosToRawUtxos([utxo], primaryTokenId)
          const lockedForUtxo = await calcLockedDeposit({
            rawUtxos,
            coinsPerUtxoByteStr: protocolParams.coinsPerUtxoByte,
          })
          // Unlocked ADA is the UTXO's ADA minus what's needed for the output
          willUnlockAda +=
            BigInt(utxoAda.toString()) - BigInt(lockedForUtxo.toString())
        }
      }
    }

    // Automatic ADA added is the minimum required
    const automaticAdaAdded = requiredAda

    const explanation = `Sending ${cntAmount.quantity.toString()} ${cntTokenId.substring(0, 8)}... requires ${requiredAda.toString()} ADA minimum.${willUnlockAda > BigInt(0) ? ` This will unlock ${willUnlockAda.toString()} ADA from UTXO(s) being spent.` : ''}`

    return {
      requiredAda,
      automaticAdaAdded,
      utxosContainingCnt,
      willUnlockAda,
      explanation,
    }
  } catch (error) {
    logger.error(error as Error, {
      function: 'calculateCntTransferRequirements',
      cntTokenId,
      cntAmount: cntAmount.quantity.toString(),
    })

    if (error instanceof InsufficientTokensError) {
      throw error
    }

    throw new FeeEstimationError(
      `Failed to calculate CNT transfer requirements: ${error instanceof Error ? error.message : String(error)}`,
      ['Verify CNT token ID is correct', 'Check UTXO availability'],
    )
  }
}

/**
 * Calculate minimum ADA for change output using CSL
 * Exported for use in transaction building
 */
export async function calculateChangeOutputMinAda(
  changeAddress: string,
  changeTokens: Record<TokenId, bigint>,
  protocolParams: ProtocolParams,
  primaryTokenId: Portfolio.Token.Id,
): Promise<bigint> {
  if (Object.keys(changeTokens).length === 0) {
    // No tokens in change, use base minimum
    return BigInt(protocolParams.minimumUtxoVal || '1000000')
  }

  return CardanoMobileWrapped.cslScope(async (csl) => {
    try {
      // Normalize address
      let normalizedAddress
      if (csl.ByronAddress.isValid(changeAddress)) {
        const byronAddr = csl.ByronAddress.fromBase58(changeAddress)
        normalizedAddress = byronAddr.toAddress()
      } else {
        const isHexAddr = isHex(changeAddress)
        normalizedAddress = isHexAddr
          ? csl.Address.fromHex(changeAddress)
          : csl.Address.fromBech32(changeAddress)
      }

      if (!normalizedAddress || normalizedAddress.isMalformed()) {
        throw new Error(`Invalid change address: ${changeAddress}`)
      }

      // Create value with tokens (using 0 ADA initially to calculate minimum)
      const amounts: Balance.Amounts = {
        [primaryTokenId]: Branded.ZERO_QUANTITY,
      } as Balance.Amounts
      for (const [tokenId, quantity] of Object.entries(changeTokens)) {
        amounts[tokenId as TokenId] = quantity.toString() as Balance.Quantity
      }

      const value = cardanoValueFromAmounts(csl, amounts, primaryTokenId)
      const txOutput = csl.TransactionOutput.new(normalizedAddress, value)
      if (!txOutput) {
        throw new Error('Failed to create TransactionOutput')
      }

      const dataCost = csl.DataCost.newCoinsPerByte(
        csl.BigNum.fromStr(protocolParams.coinsPerUtxoByte),
      )
      const minAda = csl.minAdaForOutput(txOutput, dataCost)

      return BigInt(minAda.toStr())
    } catch (error) {
      logger.error(error as Error, {
        function: 'calculateChangeOutputMinAda',
        changeAddress,
        tokenCount: Object.keys(changeTokens).length,
      })

      // Fallback to conservative estimate
      const baseMin = BigInt(protocolParams.minimumUtxoVal || '1000000')
      const tokenCount = Object.keys(changeTokens).length
      return baseMin + BigInt(tokenCount) * BigInt('100000') // 0.1 ADA per token
    }
  })
}

/**
 * Helper: Convert ModernUtxo to RawUtxo format
 */
function convertModernUtxosToRawUtxos(
  utxos: ModernUtxo[],
  primaryTokenId: Portfolio.Token.Id = defaultPrimaryTokenId,
): RawUtxo[] {
  const primaryTokenIdStr =
    typeof primaryTokenId === 'string' ? primaryTokenId : primaryTokenId

  return utxos.map((utxo) => {
    const assets: Array<{
      amount: Balance.Quantity
      tokenId: Portfolio.Token.Id
      policyId: string
      name: string
    }> = []

    // Get primary token amount (ADA)
    const adaAmount = (utxo.balance[primaryTokenIdStr as TokenId] ||
      Branded.ZERO_QUANTITY) as Balance.Quantity

    for (const [tokenId, quantity] of Object.entries(utxo.balance)) {
      const typedTokenId = tokenId as TokenId
      // Skip primary token (ADA) - it's in the amount field
      if (typedTokenId === (primaryTokenIdStr as TokenId)) continue

      // Extract policy ID and asset name from token ID
      // Token ID format: <policyId>.<assetName>
      const dotIndex = tokenId.indexOf('.')
      const policyId =
        dotIndex > 0 ? tokenId.substring(0, dotIndex) : tokenId.substring(0, 56)
      const assetName = dotIndex > 0 ? tokenId.substring(dotIndex + 1) : ''

      assets.push({
        amount: (quantity || Branded.ZERO_QUANTITY) as Balance.Quantity,
        tokenId: typedTokenId as Portfolio.Token.Id,
        policyId,
        name: assetName,
      })
    }

    return {
      amount: adaAmount,
      receiver: utxo.receiver as Address,
      tx_hash: utxo.txHash as TransactionHash,
      tx_index: utxo.txIndex,
      utxo_id: `${utxo.txHash}:${utxo.txIndex}` as UtxoId,
      assets: assets.map((asset) => ({
        amount: asset.amount,
        tokenId: asset.tokenId,
        policyId: asset.policyId as PolicyId,
        name: asset.name,
      })),
    } as unknown as RawUtxo
  })
}
