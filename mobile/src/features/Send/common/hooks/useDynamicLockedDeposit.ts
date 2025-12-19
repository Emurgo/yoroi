import {
  calcLockedDepositAfterRemovingTokens,
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

  // Cache for expensive calculations
  const cacheRef = React.useRef<{
    optimized?: {
      key: string
      result: {current: bigint; optimized: bigint; savings: bigint}
    }
    dynamic?: {
      key: string
      result: bigint
    }
  }>({})

  // Get token IDs being sent (excluding primary token)
  const tokenIdsBeingSent = React.useMemo(() => {
    return Object.keys(tokensBeingSent).filter((id) => {
      if (id === primaryTokenId) return false
      const tokenAmount = tokensBeingSent[id as Portfolio.Token.Id]
      if (!tokenAmount) return false
      return !isPrimaryToken(tokenAmount.info)
    })
  }, [tokensBeingSent, primaryTokenId])

  // Create stable cache key from UTXOs and protocol params
  const createCacheKey = React.useCallback(
    (
      utxos: ReturnType<typeof wallet.utxos>,
      coinsPerUtxoByte: string,
      tokensBeingSentMap?: Map<string, string>,
    ) => {
      // Create stable key from UTXO IDs (sorted) + protocol params + token amounts
      const utxoIds = utxos
        .map((u) => u.utxo_id)
        .sort()
        .join(',')
      let tokenKey = ''
      if (tokensBeingSentMap && tokensBeingSentMap.size > 0) {
        // Sort by token ID and include amounts for cache key
        const tokenEntries = Array.from(tokensBeingSentMap.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([id, amount]) => `${id}:${amount}`)
        tokenKey = tokenEntries.join(',')
      }
      return `${utxoIds}|${coinsPerUtxoByte}|${tokenKey}`
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  // Calculate both optimized and dynamic locked deposits in a single effect
  React.useEffect(() => {
    let cancelled = false
    let finishedCount = 0
    const totalCalculations = 2 // optimized + dynamic

    const finishCalculation = () => {
      finishedCount += 1
      if (finishedCount === totalCalculations) {
        setIsCalculating(false)
      }
    }

    const calculateOptimized = async () => {
      try {
        const utxos = wallet.utxos()
        const protocolParams = wallet.protocolParams
        const cacheKey = createCacheKey(utxos, protocolParams.coinsPerUtxoByte)

        // Check cache first
        if (
          cacheRef.current.optimized?.key === cacheKey &&
          cacheRef.current.optimized.result
        ) {
          if (!cancelled) {
            setOptimizedLocked(cacheRef.current.optimized.result)
          }
          finishCalculation()
          return
        }

        const result = await calcOptimizedLockedDeposit({
          rawUtxos: utxos,
          coinsPerUtxoByteStr: protocolParams.coinsPerUtxoByte,
          maxIterations: 5,
        })

        if (!cancelled) {
          const optimizedResult = {
            current: BigInt(result.current.toString()),
            optimized: BigInt(result.optimized.toString()),
            savings: BigInt(result.savings.toString()),
          }
          // Cache the result
          cacheRef.current.optimized = {
            key: cacheKey,
            result: optimizedResult,
          }
          setOptimizedLocked(optimizedResult)
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
          finishCalculation()
        }
      }
    }

    const calculateDynamic = async () => {
      try {
        if (tokenIdsBeingSent.length === 0) {
          // No tokens being sent, use current locked
          if (!cancelled) {
            setDynamicLocked(primaryBreakdown.lockedAsStorageCost)
          }
          finishCalculation()
          return
        }

        const utxos = wallet.utxos()
        const protocolParams = wallet.protocolParams

        // Create map of token IDs to amounts being sent for efficient lookup
        // This handles partial amounts - if only part of a token is sent, the UTXO
        // still contains that token (with reduced amount) and still requires locked ADA
        const tokensBeingSentMap = new Map<string, string>()
        for (const tokenId of tokenIdsBeingSent) {
          const tokenAmount = tokensBeingSent[tokenId as Portfolio.Token.Id]
          if (tokenAmount) {
            tokensBeingSentMap.set(tokenId, tokenAmount.quantity.toString())
          }
        }

        const cacheKey = createCacheKey(
          utxos,
          protocolParams.coinsPerUtxoByte,
          tokensBeingSentMap,
        )

        // Check cache first
        if (
          cacheRef.current.dynamic?.key === cacheKey &&
          cacheRef.current.dynamic.result
        ) {
          if (!cancelled) {
            setDynamicLocked(cacheRef.current.dynamic.result)
          }
          finishCalculation()
          return
        }

        // Calculate locked deposit after removing/reducing tokens being sent from UTXOs
        const remainingLocked = await calcLockedDepositAfterRemovingTokens({
          rawUtxos: utxos,
          coinsPerUtxoByteStr: protocolParams.coinsPerUtxoByte,
          tokensBeingSent: tokensBeingSentMap,
        })

        if (!cancelled) {
          const dynamicResult = BigInt(remainingLocked.toString())
          // Cache the result
          cacheRef.current.dynamic = {
            key: cacheKey,
            result: dynamicResult,
          }
          setDynamicLocked(dynamicResult)
        }
      } catch (error) {
        // If calculation fails, use current locked as fallback
        if (!cancelled) {
          setDynamicLocked(primaryBreakdown.lockedAsStorageCost)
        }
      } finally {
        if (!cancelled) {
          finishCalculation()
        }
      }
    }

    // Start both calculations in parallel
    setIsCalculating(true)
    finishedCount = 0
    calculateOptimized()
    calculateDynamic()

    return () => {
      cancelled = true
    }
  }, [
    wallet,
    tokenIdsBeingSent,
    tokensBeingSent,
    primaryBreakdown.lockedAsStorageCost,
    createCacheKey,
  ])

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
