import {calculateLockedAda} from '@yoroi/cardano-wallet'
import {isPrimaryToken} from '@yoroi/portfolio'
import {rawUtxoToModernUtxo} from '@yoroi/tx'
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

  // Calculate both optimized and dynamic locked deposits using new service
  React.useEffect(() => {
    let cancelled = false

    const calculateLocked = async () => {
      try {
        setIsCalculating(true)
        const utxos = wallet.utxos()
        const protocolParams = wallet.protocolParams

        // Convert to ModernUtxo format using the utility function
        const modernUtxos = utxos.map((rawUtxo) =>
          rawUtxoToModernUtxo(
            {
              amount: rawUtxo.amount,
              receiver: rawUtxo.receiver,
              tx_hash: rawUtxo.tx_hash,
              tx_index: rawUtxo.tx_index,
              utxo_id: rawUtxo.utxo_id,
              assets: rawUtxo.assets.map((asset) => ({
                amount: asset.amount,
                tokenId: asset.tokenId,
                policyId: asset.policyId,
                name: asset.name,
              })),
            },
            undefined, // addressing - not needed for locked ADA calculation
            undefined, // derivationPath - not needed
            primaryTokenId,
          ),
        )

        // Create tokensBeingSent map if tokens are being sent
        const tokensBeingSentMap:
          | Record<Portfolio.Token.Id, Portfolio.Token.Amount>
          | undefined =
          tokenIdsBeingSent.length > 0
            ? tokenIdsBeingSent.reduce(
                (acc, tokenId) => {
                  const tokenAmount =
                    tokensBeingSent[tokenId as Portfolio.Token.Id]
                  if (tokenAmount) {
                    acc[tokenId as Portfolio.Token.Id] = tokenAmount
                  }
                  return acc
                },
                {} as Record<Portfolio.Token.Id, Portfolio.Token.Amount>,
              )
            : undefined

        const cacheKey = createCacheKey(
          utxos,
          protocolParams.coinsPerUtxoByte,
          tokensBeingSentMap
            ? new Map(
                Object.entries(tokensBeingSentMap).map(([id, amount]) => [
                  id,
                  amount.quantity.toString(),
                ]),
              )
            : undefined,
        )

        // Check cache first
        if (
          cacheRef.current.optimized?.key === cacheKey &&
          cacheRef.current.dynamic?.key === cacheKey &&
          cacheRef.current.optimized.result &&
          cacheRef.current.dynamic.result
        ) {
          if (!cancelled) {
            setOptimizedLocked(cacheRef.current.optimized.result)
            setDynamicLocked(cacheRef.current.dynamic.result)
            setIsCalculating(false)
          }
          return
        }

        // Use new service to calculate locked ADA
        const result = await calculateLockedAda({
          utxos: modernUtxos,
          protocolParams: {
            coinsPerUtxoByte: protocolParams.coinsPerUtxoByte,
            linearFee: {
              constant: protocolParams.linearFee.constant,
              coefficient: protocolParams.linearFee.coefficient,
            },
            minimumUtxoVal: '1000000',
          },
          tokensBeingSent: tokensBeingSentMap,
          primaryTokenId,
        })

        if (!cancelled) {
          const optimizedResult = {
            current: result.currentLocked,
            optimized: result.optimizedLocked,
            savings: result.optimizationSavings,
          }
          const dynamicResult = result.dynamicLocked

          // Cache the results
          cacheRef.current.optimized = {
            key: cacheKey,
            result: optimizedResult,
          }
          cacheRef.current.dynamic = {
            key: cacheKey,
            result: dynamicResult,
          }

          setOptimizedLocked(optimizedResult)
          setDynamicLocked(dynamicResult)
          setIsCalculating(false)
        }
      } catch (error) {
        // If calculation fails, use current locked as fallback
        if (!cancelled) {
          const currentLocked = primaryBreakdown.lockedAsStorageCost
          setOptimizedLocked({
            current: currentLocked,
            optimized: currentLocked,
            savings: BigInt(0),
          })
          setDynamicLocked(primaryBreakdown.lockedAsStorageCost)
          setIsCalculating(false)
        }
      }
    }

    calculateLocked()

    return () => {
      cancelled = true
    }
  }, [
    wallet,
    tokenIdsBeingSent,
    tokensBeingSent,
    primaryBreakdown.lockedAsStorageCost,
    primaryTokenId,
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
