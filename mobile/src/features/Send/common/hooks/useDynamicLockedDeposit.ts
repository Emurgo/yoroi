import {
  calcLockedDepositForRemainingUtxos,
  calcOptimizedLockedDeposit,
} from '@yoroi/cardano-wallet'
import {isPrimaryToken} from '@yoroi/portfolio'
import {Portfolio} from '@yoroi/types'
import {useSelectedWallet} from '@yoroi/wallet-manager'

import * as React from 'react'

import {usePortfolioPrimaryBreakdown} from '~/features/Portfolio/common/hooks/usePortfolioPrimaryBreakdown'

/**
 * Hook to calculate dynamic locked ADA deposit based on tokens being sent.
 * Returns current locked, optimized locked, and dynamic locked (excluding UTXOs being spent).
 */
export const useDynamicLockedDeposit = ({
  tokensBeingSent,
}: {
  tokensBeingSent: Record<Portfolio.Token.Id, Portfolio.Token.Amount>
}) => {
  const {wallet} = useSelectedWallet()
  const primaryBreakdown = usePortfolioPrimaryBreakdown({wallet})
  const primaryTokenId = wallet.portfolioPrimaryTokenInfo.id

  const [optimizedLocked, setOptimizedLocked] = React.useState<{
    current: bigint
    optimized: bigint
    savings: bigint
  } | null>(null)
  const [dynamicLocked, setDynamicLocked] = React.useState<bigint | null>(null)
  const [isCalculating, setIsCalculating] = React.useState(false)

  // Get token IDs being sent (excluding primary token)
  const tokenIdsBeingSent = React.useMemo(() => {
    return Object.keys(tokensBeingSent).filter((id) => {
      if (id === primaryTokenId) return false
      const tokenAmount = tokensBeingSent[id as Portfolio.Token.Id]
      if (!tokenAmount) return false
      return !isPrimaryToken(tokenAmount.info)
    })
  }, [tokensBeingSent, primaryTokenId])

  // Calculate optimized locked deposit (with CNT consolidation)
  React.useEffect(() => {
    let cancelled = false

    const calculateOptimized = async () => {
      setIsCalculating(true)
      try {
        const utxos = wallet.utxos()
        const protocolParams = wallet.protocolParams

        const result = await calcOptimizedLockedDeposit({
          rawUtxos: utxos,
          coinsPerUtxoByteStr: protocolParams.coinsPerUtxoByte,
          maxIterations: 5,
        })

        if (!cancelled) {
          setOptimizedLocked({
            current: BigInt(result.current.toString()),
            optimized: BigInt(result.optimized.toString()),
            savings: BigInt(result.savings.toString()),
          })
        }
      } catch (error) {
        // If optimization fails, use current locked as fallback
        if (!cancelled) {
          const currentLocked = primaryBreakdown.lockedAsStorageCost
          setOptimizedLocked({
            current: currentLocked,
            optimized: currentLocked,
            savings: BigInt(0),
          })
        }
      } finally {
        if (!cancelled) {
          setIsCalculating(false)
        }
      }
    }

    calculateOptimized()

    return () => {
      cancelled = true
    }
  }, [wallet, primaryBreakdown.lockedAsStorageCost])

  // Calculate dynamic locked deposit (excluding UTXOs being spent)
  React.useEffect(() => {
    let cancelled = false

    const calculateDynamic = async () => {
      if (tokenIdsBeingSent.length === 0) {
        // No tokens being sent, use current locked
        setDynamicLocked(primaryBreakdown.lockedAsStorageCost)
        return
      }

      setIsCalculating(true)
      try {
        const utxos = wallet.utxos()
        const protocolParams = wallet.protocolParams

        // Find UTXOs that contain tokens being sent
        const utxosToExclude = new Set<string>()
        for (const utxo of utxos) {
          for (const asset of utxo.assets) {
            if (tokenIdsBeingSent.includes(asset.tokenId)) {
              utxosToExclude.add(utxo.utxo_id)
              break
            }
          }
        }

        // Calculate locked deposit for remaining UTXOs
        const remainingLocked = await calcLockedDepositForRemainingUtxos({
          rawUtxos: utxos,
          coinsPerUtxoByteStr: protocolParams.coinsPerUtxoByte,
          excludeUtxoIds: utxosToExclude,
        })

        if (!cancelled) {
          setDynamicLocked(BigInt(remainingLocked.toString()))
        }
      } catch (error) {
        // If calculation fails, use current locked as fallback
        if (!cancelled) {
          setDynamicLocked(primaryBreakdown.lockedAsStorageCost)
        }
      } finally {
        if (!cancelled) {
          setIsCalculating(false)
        }
      }
    }

    calculateDynamic()

    return () => {
      cancelled = true
    }
  }, [wallet, tokenIdsBeingSent, primaryBreakdown.lockedAsStorageCost])

  const currentLocked = primaryBreakdown.lockedAsStorageCost

  return {
    // Current locked deposit (as-is, no optimization)
    currentLocked,
    // Optimized locked deposit (if CNTs were consolidated)
    optimizedLocked: optimizedLocked?.optimized ?? currentLocked,
    optimizedSavings: optimizedLocked?.savings ?? BigInt(0),
    // Dynamic locked deposit (excluding UTXOs being spent)
    dynamicLocked: dynamicLocked ?? currentLocked,
    // Amount that would be unlocked by sending these tokens
    unlockedBySending: currentLocked - (dynamicLocked ?? currentLocked),
    // Loading state
    isCalculating,
  }
}
