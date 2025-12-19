import {RawUtxo} from '@yoroi/api'
import {getLogger} from '@yoroi/logger'
import {normalizeToAddress} from '@yoroi/tx'
import {
  Address,
  AssetName,
  BalanceQuantity,
  PolicyId,
  Portfolio,
  TransactionHash,
  UtxoId,
} from '@yoroi/types'

import {Address as CSLAddress} from '@emurgo/cross-csl-core'
import BigNumber from 'bignumber.js'

import {cardanoValueFromRemoteFormat} from './utils'
import {wrappedCsl} from './wrappedCsl'

// Re-export from assetHelpers to maintain backward compatibility
export {identifierToCardanoAsset} from './assetHelpers'

/**
 * Calculates locked deposit for remaining UTXOs after excluding those being spent.
 * Used for dynamic recalculation when tokens are added to a send transaction.
 *
 * @param rawUtxos - All available UTXOs
 * @param coinsPerUtxoByteStr - Protocol parameter for coins per UTXO byte
 * @param excludeUtxoIds - Set of UTXO IDs to exclude from calculation (those being spent)
 * @returns Total locked deposit for remaining UTXOs
 */
export async function calcLockedDepositForRemainingUtxos({
  rawUtxos,
  coinsPerUtxoByteStr,
  excludeUtxoIds,
}: {
  rawUtxos: RawUtxo[]
  coinsPerUtxoByteStr: string
  excludeUtxoIds: Set<string>
}) {
  // Filter out UTXOs that are being spent
  const remainingUtxos = rawUtxos.filter((u) => !excludeUtxoIds.has(u.utxo_id))

  // Calculate locked deposit for remaining UTXOs
  return calcLockedDeposit({
    rawUtxos: remainingUtxos,
    coinsPerUtxoByteStr,
  })
}

/**
 * Calculates locked deposit after removing or reducing specific tokens from UTXOs.
 * This is used when sending tokens from a UTXO - handles both full removal and partial amounts.
 * If only part of a token is being sent, the UTXO still contains that token (with reduced amount)
 * and still requires locked ADA.
 *
 * @param rawUtxos - All available UTXOs
 * @param coinsPerUtxoByteStr - Protocol parameter for coins per UTXO byte
 * @param tokensBeingSent - Map of token IDs to amounts being sent
 * @returns Total locked deposit for UTXOs after removing/reducing tokens
 */
export async function calcLockedDepositAfterRemovingTokens({
  rawUtxos,
  coinsPerUtxoByteStr,
  tokensBeingSent,
}: {
  rawUtxos: RawUtxo[]
  coinsPerUtxoByteStr: string
  tokensBeingSent: Map<string, string> // tokenId -> amount being sent
}) {
  // Create modified UTXOs with tokens removed or reduced
  // Only include UTXOs that will still have assets after removal
  // (UTXOs with no assets after removal will be completely spent and don't need locked deposit)
  const modifiedUtxos: RawUtxo[] = []
  for (const utxo of rawUtxos) {
    // Create mutable array for remaining assets
    const remainingAssets: Array<(typeof utxo.assets)[number]> = []

    for (const asset of utxo.assets) {
      const amountBeingSent = tokensBeingSent.get(asset.tokenId)

      if (amountBeingSent == null) {
        // Token not being sent, keep it as-is
        remainingAssets.push(asset)
      } else {
        // Token is being sent - check if partial or full amount
        const utxoAmount = BigInt(asset.amount)
        const sentAmount = BigInt(amountBeingSent)

        if (sentAmount >= utxoAmount) {
          // Sending full amount (or more) - remove token completely
          // Don't add to remainingAssets
        } else {
          // Sending partial amount - reduce the amount in UTXO
          const remainingAmount = (utxoAmount - sentAmount).toString()
          remainingAssets.push({
            ...asset,
            amount: remainingAmount as typeof asset.amount,
          })
        }
      }
    }

    // Only include UTXOs that still have assets after removal/reduction
    if (remainingAssets.length > 0) {
      modifiedUtxos.push({
        ...utxo,
        assets: remainingAssets,
      } as RawUtxo)
    }
  }

  // Calculate locked deposit for modified UTXOs
  return calcLockedDeposit({
    rawUtxos: modifiedUtxos,
    coinsPerUtxoByteStr,
  })
}

/**
 * Calculates optimized locked deposit by simulating CNT consolidation.
 * Attempts to consolidate CNTs into fewer UTXOs to minimize locked ADA.
 *
 * @param rawUtxos - All UTXOs containing assets
 * @param coinsPerUtxoByteStr - Protocol parameter for coins per UTXO byte
 * @param maxIterations - Maximum number of consolidation attempts (default: 5)
 * @returns Object with current and optimized locked deposit amounts
 */
export async function calcOptimizedLockedDeposit({
  rawUtxos,
  coinsPerUtxoByteStr,
  maxIterations = 5,
}: {
  rawUtxos: RawUtxo[]
  coinsPerUtxoByteStr: string
  maxIterations?: number
}): Promise<{
  current: BigNumber
  optimized: BigNumber
  savings: BigNumber
}> {
  const cslLocal = wrappedCsl()
  const csl = cslLocal.csl

  try {
    // Calculate current locked deposit
    const currentLocked = await calcLockedDeposit({
      rawUtxos,
      coinsPerUtxoByteStr,
    })

    // Get UTXOs with assets
    const utxosWithAssets = rawUtxos.filter((u) => u.assets.length > 0)

    if (utxosWithAssets.length === 0) {
      return {
        current: currentLocked,
        optimized: currentLocked,
        savings: new BigNumber(0),
      }
    }

    // Group assets by policy ID to simulate consolidation
    // The idea is that consolidating assets from the same policy into fewer UTXOs
    // can reduce the total locked ADA
    const assetsByPolicy = new Map<
      string,
      Array<{tokenId: string; amount: string; utxo: RawUtxo}>
    >()

    // Collect all assets grouped by policy
    for (const utxo of utxosWithAssets) {
      for (const asset of utxo.assets) {
        const policyId = asset.policyId
        if (!assetsByPolicy.has(policyId)) {
          assetsByPolicy.set(policyId, [])
        }
        assetsByPolicy.get(policyId)!.push({
          tokenId: asset.tokenId,
          amount: asset.amount,
          utxo,
        })
      }
    }

    // Try to consolidate: simulate creating fewer UTXOs with consolidated assets
    // We'll try grouping assets by policy and creating hypothetical consolidated UTXOs
    const coinsPerUtxoByte = csl.BigNum.fromStr(coinsPerUtxoByteStr)
    const dataCost = csl.DataCost.newCoinsPerByte(coinsPerUtxoByte)

    let bestOptimized = currentLocked

    // Try different consolidation strategies
    for (let iteration = 0; iteration < maxIterations; iteration++) {
      const consolidatedUtxos: RawUtxo[] = []

      // Strategy: Group assets by policy and create consolidated UTXOs
      // Use a representative address (from first UTXO) for consolidated UTXO
      const representativeAddress =
        utxosWithAssets[0]?.receiver ?? rawUtxos[0]?.receiver
      if (!representativeAddress) break

      // For each policy, try to consolidate into fewer UTXOs
      for (const [policyId, assets] of assetsByPolicy.entries()) {
        // Calculate how many UTXOs we need for this policy's assets
        // Try to consolidate into fewer UTXOs (e.g., 1-2 UTXOs per policy)
        const targetUtxoCount = Math.min(
          Math.ceil(assets.length / 10), // Rough estimate: ~10 assets per UTXO
          2, // Max 2 UTXOs per policy
        )

        // Distribute assets across target UTXOs
        const assetsPerUtxo = Math.ceil(assets.length / targetUtxoCount)

        for (let i = 0; i < targetUtxoCount; i++) {
          const startIdx = i * assetsPerUtxo
          const endIdx = Math.min(startIdx + assetsPerUtxo, assets.length)
          const utxoAssets = assets.slice(startIdx, endIdx)

          if (utxoAssets.length === 0) continue

          // Calculate total ADA needed for this consolidated UTXO
          // Use minimum ADA (1 ADA) as base, actual calculation will be done below
          const consolidatedUtxo: RawUtxo = {
            amount: '1000000' as BalanceQuantity, // 1 ADA minimum, will be recalculated
            receiver: representativeAddress as Address,
            tx_hash: `consolidated_${policyId}_${i}` as TransactionHash,
            tx_index: i,
            utxo_id: `consolidated_${policyId}_${i}` as UtxoId,
            assets: utxoAssets.map((a) => ({
              tokenId: a.tokenId as Portfolio.Token.Id,
              amount: a.amount as BalanceQuantity,
              policyId: policyId as PolicyId,
              name: (a.utxo.assets.find((aa) => aa.tokenId === a.tokenId)
                ?.name ?? '') as AssetName,
            })),
          }

          consolidatedUtxos.push(consolidatedUtxo)
        }
      }

      // Calculate locked deposit for consolidated UTXOs
      let consolidatedLocked = new BigNumber(0)

      for (const utxo of consolidatedUtxos) {
        try {
          const normalizedAddress = normalizeToAddress(csl, utxo.receiver)
          if (!normalizedAddress || normalizedAddress.isMalformed()) {
            continue
          }

          const value = cardanoValueFromRemoteFormat(utxo, csl)
          if (!value) continue

          const txOutput = csl.TransactionOutput.new(normalizedAddress, value)
          if (!txOutput) continue

          const minAda = csl.minAdaForOutput(txOutput, dataCost)
          consolidatedLocked = consolidatedLocked.plus(minAda.toStr())
        } catch (error) {
          getLogger().warn(
            'calcOptimizedLockedDeposit: Error calculating consolidated UTXO',
            {
              error: error instanceof Error ? error.message : String(error),
              utxoId: utxo.utxo_id,
            },
          )
        }
      }

      // Update best if this consolidation is better
      if (consolidatedLocked.isLessThan(bestOptimized)) {
        bestOptimized = consolidatedLocked
      }

      // If we found a good optimization, we can break early
      if (bestOptimized.isLessThan(currentLocked.multipliedBy(0.9))) {
        break
      }
    }

    const savings = currentLocked.minus(bestOptimized)

    return {
      current: currentLocked,
      optimized: bestOptimized,
      savings: savings.isGreaterThan(0) ? savings : new BigNumber(0),
    }
  } catch (e) {
    getLogger().error(e as Error, {
      utxosLength: rawUtxos.length,
      coinsPerUtxoByteStr,
    })
    // Return current locked as fallback
    const currentLocked = await calcLockedDeposit({
      rawUtxos,
      coinsPerUtxoByteStr,
    })
    return {
      current: currentLocked,
      optimized: currentLocked,
      savings: new BigNumber(0),
    }
  } finally {
    cslLocal.release()
  }
}

/**
 * Calculates the total locked deposit (minimum ADA) required for UTXOs containing assets.
 *
 * According to Cardano protocol (CIP-1852, Cardano Ledger specifications):
 * - Minimum ADA = UTxO Size in Bytes × coinsPerUtxoByte
 * - The UTxO size includes the address, so we must use the actual receiver address
 *   from each UTXO, not a placeholder, as different address types have different sizes.
 *
 * This matches the Cardano standard implementation used in yoroi-lib and other Cardano tools.
 */
export async function calcLockedDeposit({
  rawUtxos,
  coinsPerUtxoByteStr,
}: {
  rawUtxos: RawUtxo[]
  coinsPerUtxoByteStr: string
}) {
  const cslLocal = wrappedCsl()
  const csl = cslLocal.csl
  const result = new BigNumber(0)
  try {
    const utxosWithAssets = rawUtxos.filter((u) => u.assets.length > 0)
    const coinsPerUtxoByte = csl.BigNum.fromStr(coinsPerUtxoByteStr)
    const dataCost = csl.DataCost.newCoinsPerByte(coinsPerUtxoByte)

    const results = utxosWithAssets.map((u, index) => {
      try {
        // Use the actual receiver address from each UTXO, not a placeholder
        // This is critical because address size affects UTxO size calculation
        const receiverAddress = u.receiver
        if (!receiverAddress) {
          throw new Error('UTXO missing receiver address')
        }

        // Normalize address using tx package utility (supports Byron, hex, and bech32)
        const normalizedAddress: CSLAddress | undefined = normalizeToAddress(
          csl,
          receiverAddress,
        )

        if (!normalizedAddress || normalizedAddress.isMalformed()) {
          throw new Error(
            `calcLockedDeposit::Invalid receiver address: ${receiverAddress}`,
          )
        }

        const value = cardanoValueFromRemoteFormat(u, csl)
        if (!value) {
          throw new Error('cardanoValueFromRemoteFormat returned null value')
        }
        const txOutput = csl.TransactionOutput.new(normalizedAddress, value)
        if (!txOutput) {
          throw new Error('TransactionOutput.new returned null')
        }
        const minAda = csl.minAdaForOutput(txOutput, dataCost)
        return minAda.toStr()
      } catch (error) {
        getLogger().error(error as Error, {
          utxoIndex: index,
          utxoAmount: u.amount,
          utxoAssetsCount: u.assets.length,
          utxoReceiver: u.receiver,
          txHash: u.tx_hash,
          txIndex: u.tx_index,
        })
        // Return '0' for this UTXO to continue processing others
        return '0'
      }
    })

    const totalLocked = results.reduce((acc, v) => acc.plus(v), result)

    return totalLocked
  } catch (e) {
    getLogger().error(e as Error, {
      utxosLength: rawUtxos.length,
      coinsPerUtxoByteStr,
    })
    return result
  } finally {
    cslLocal.release()
  }
}
