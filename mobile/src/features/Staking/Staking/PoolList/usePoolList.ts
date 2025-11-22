import {API_ENDPOINTS} from '@yoroi/api'
import {getLogger} from '@yoroi/common'
import {
  DEFAULT_SATURATION_THRESHOLD,
  ExplorerPoolInfo,
  poolInfoApiMaker,
} from '@yoroi/staking'
import {Chain} from '@yoroi/types'

import {useInfiniteQuery, useQuery, useQueryClient} from '@tanstack/react-query'
import axios from 'axios'
import * as React from 'react'

import {useSelectedNetwork} from '~/features/WalletManager/hooks/useSelectedNetwork'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {poolQueryKeys} from '~/queries'

type ExplorerPoolInfoApiRes = {
  data?: {
    data?: Array<{
      pool_id: string
      pool_id_hash_raw: string
      pool_name: {
        ticker: string
        name: string
      }
      pool_update: {
        active: {
          fixed_cost: number
          margin: number
        }
      }
      stats: {
        lifetime: {
          roa: number
        }
      }
      live_stake: number
      roa: string
      saturation: number
    }>
  }
}

const POOLS_PER_PAGE = 50

const fetchPoolsPage = async (
  apiUrl: string,
  _page: number,
  searchQuery?: string,
): Promise<ExplorerPoolInfo[]> => {
  const params = new URLSearchParams({
    limit: String(POOLS_PER_PAGE),
    order: 'ranking',
  })

  // Add search parameter if provided
  if (searchQuery && searchQuery.trim().length > 0) {
    const trimmedSearch = searchQuery.trim()
    params.set('name', trimmedSearch)
  }

  const url = `${apiUrl}/cexplorer-pool-list?${params.toString()}`
  const response = await axios.get<ExplorerPoolInfoApiRes>(url)

  const poolsData = response.data
  if (!poolsData.data?.data?.length) {
    return []
  }

  const pools: ExplorerPoolInfo[] = poolsData.data.data.map((pool) => ({
    id: pool.pool_id,
    hash: pool.pool_id_hash_raw,
    ticker: pool.pool_name.ticker,
    name: pool.pool_name.name,
    pic: `https://ix.cexplorer.io/${pool.pool_id}`,
    stake:
      pool.live_stake != null &&
      typeof pool.live_stake === 'number' &&
      isFinite(pool.live_stake)
        ? String(pool.live_stake)
        : '',
    roa: String(pool.stats.lifetime.roa),
    taxFix: String(pool.pool_update.active.fixed_cost),
    taxRatio: String(pool.pool_update.active.margin),
    saturation: String(pool.saturation),
  }))

  return pools
}

export const usePoolList = (searchQuery?: string) => {
  const {wallet} = useSelectedWallet()

  const apiUrl = React.useMemo(() => {
    if (wallet.isMainnet) {
      return API_ENDPOINTS[Chain.Network.Mainnet].root
    }
    if (wallet.networkManager.network === Chain.Network.Preprod) {
      return API_ENDPOINTS[Chain.Network.Preprod].root
    }
    return API_ENDPOINTS[Chain.Network.Preview].root
  }, [wallet.isMainnet, wallet.networkManager.network])

  // Normalize search query
  const normalizedSearch = searchQuery?.trim() || undefined

  // Create query key - React Query will refetch when this changes
  const queryKey = React.useMemo(
    () =>
      poolQueryKeys.list(
        wallet.id,
        wallet.networkManager.network,
        normalizedSearch,
      ),
    [wallet.id, wallet.networkManager.network, normalizedSearch],
  )

  // Memoize queryFn to ensure it uses the latest normalizedSearch
  const queryFn = React.useCallback(
    async ({pageParam = 0}: {pageParam?: number}) => {
      return fetchPoolsPage(apiUrl, pageParam, normalizedSearch)
    },
    [apiUrl, normalizedSearch],
  )

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    error,
    isLoading,
  } = useInfiniteQuery({
    queryKey,
    queryFn,
    getNextPageParam: (lastPage, allPages) => {
      // If we got fewer pools than expected, we've reached the end
      if (lastPage.length < POOLS_PER_PAGE) {
        return undefined
      }
      return allPages.length
    },
    initialPageParam: 0,
    staleTime: normalizedSearch ? 0 : 5 * 60 * 1000, // No cache for search results, longer for regular list
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    retry: normalizedSearch ? 1 : 2, // Fewer retries for search queries (they're fast)
    // When queryKey changes, React Query automatically treats it as a new query and fetches immediately
    // refetchOnMount is not needed - queryKey changes trigger new fetches automatically
    refetchOnWindowFocus: false, // Don't refetch on window focus
    // Ensure query is enabled and fetches immediately
    enabled: true,
  })

  const {networkManager} = useSelectedNetwork()

  // Fetch pool transition info to get preferred pools
  const poolInfoApi = React.useMemo(
    () =>
      poolInfoApiMaker({
        legacyApiBaseUrl: networkManager.legacyApiBaseUrl,
        zeroApiUrl: apiUrl,
      }),
    [networkManager.legacyApiBaseUrl, apiUrl],
  )

  const transitionDataQuery = useQuery({
    queryKey: ['poolTransitionInfo', wallet.networkManager.network],
    queryFn: () => poolInfoApi.getPoolTransitionInfoPublic(),
    enabled: wallet.isMainnet && !normalizedSearch, // Only fetch for mainnet and when not searching
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: 2,
  })

  // Extract preferred pool IDs from transition data
  const preferredPoolIds = React.useMemo(() => {
    const transitionData = transitionDataQuery.data
    if (!transitionData?.new) {
      return new Set<string>()
    }

    // Flatten all preferred pool IDs from all groups
    const allPreferredIds = new Set<string>()
    for (const groupName of Object.keys(transitionData.new)) {
      const poolIds = transitionData.new[groupName]
      if (Array.isArray(poolIds)) {
        poolIds.forEach((id) => allPreferredIds.add(id))
      }
    }

    return allPreferredIds
  }, [transitionDataQuery.data])

  // Memoize sorted array for query key to avoid recreating it
  const preferredPoolIdsArray = React.useMemo(
    () => Array.from(preferredPoolIds).sort(),
    [preferredPoolIds],
  )

  // Get saturation threshold from transition data or use default
  const saturationThreshold = React.useMemo(() => {
    const transitionData = transitionDataQuery.data
    const threshold =
      transitionData?.saturationThreshold ?? DEFAULT_SATURATION_THRESHOLD
    // Ensure threshold is between 0 and 1
    if (threshold < 0 || threshold > 1) {
      return DEFAULT_SATURATION_THRESHOLD
    }
    return threshold
  }, [transitionDataQuery.data])

  // Fetch preferred pools individually if they're not in the loaded pages
  const preferredPoolsQuery = useQuery({
    queryKey: [
      'preferredPools',
      wallet.networkManager.network,
      preferredPoolIdsArray.join(','),
    ],
    queryFn: async () => {
      if (preferredPoolIds.size === 0) return []

      const logger = getLogger()
      // Fetch all preferred pools in parallel
      const poolPromises = preferredPoolIdsArray.map((poolId) =>
        poolInfoApi.getPool(poolId).catch((error) => {
          logger.warn('Failed to fetch preferred pool', {
            origin: 'staking',
            operation: 'usePoolList',
            poolId,
            error: error instanceof Error ? error.message : String(error),
          })
          return null
        }),
      )

      const results = await Promise.all(poolPromises)
      return results.filter((pool): pool is ExplorerPoolInfo => pool !== null)
    },
    enabled:
      wallet.isMainnet &&
      !normalizedSearch &&
      preferredPoolIds.size > 0 &&
      !!transitionDataQuery.data,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
  })

  // Sort pools: preferred non-saturated pools first, then rest
  const pools = React.useMemo(() => {
    const allPools = data?.pages.flat() ?? []
    const fetchedPreferredPools = preferredPoolsQuery.data ?? []

    if (allPools.length === 0 && fetchedPreferredPools.length === 0) {
      return []
    }

    // If no preferred pools, return original order
    if (preferredPoolIds.size === 0) {
      return allPools
    }

    // Merge fetched preferred pools with loaded pools, avoiding duplicates
    // Use Set for O(1) lookup performance
    const loadedPoolIds = new Set(allPools.map((p) => p.id))
    const mergedPools = [
      ...allPools,
      ...fetchedPreferredPools.filter((p) => !loadedPoolIds.has(p.id)),
    ]

    // Separate pools into preferred non-saturated, preferred saturated, and others
    const preferredNonSaturated: ExplorerPoolInfo[] = []
    const preferredSaturated: ExplorerPoolInfo[] = []
    const others: ExplorerPoolInfo[] = []

    for (const pool of mergedPools) {
      if (preferredPoolIds.has(pool.id)) {
        const saturation = Number(pool.saturation)
        const isSaturated =
          isNaN(saturation) || saturation > saturationThreshold
        if (!isSaturated) {
          preferredNonSaturated.push(pool)
        } else {
          preferredSaturated.push(pool)
        }
      } else {
        others.push(pool)
      }
    }

    // Return: preferred non-saturated first, then preferred saturated, then others
    return [...preferredNonSaturated, ...preferredSaturated, ...others]
  }, [
    data?.pages,
    preferredPoolIds,
    saturationThreshold,
    preferredPoolsQuery.data,
  ])

  // Prefetch next page automatically when current page finishes loading
  // But only prefetch ONE page ahead to avoid infinite loops
  // Skip auto-prefetch when searching (let user control via scroll)
  const prefetchTriggeredRef = React.useRef<number>(0)

  // Reset prefetch ref when search changes
  React.useEffect(() => {
    prefetchTriggeredRef.current = 0
  }, [normalizedSearch])

  React.useEffect(() => {
    const currentPageCount = data?.pages.length ?? 0

    // Only prefetch if:
    // - We have more pages available
    // - We're not currently fetching
    // - Initial load is done
    // - We haven't already prefetched for this page count
    // - We're not searching (search results should load on-demand)
    // - We only have 1 page (so we prefetch page 2, but not beyond)
    if (
      hasNextPage &&
      !isFetchingNextPage &&
      !isLoading &&
      currentPageCount === 1 && // Only prefetch when we have exactly 1 page
      prefetchTriggeredRef.current < currentPageCount &&
      !normalizedSearch // Don't auto-prefetch when searching
    ) {
      // Mark that we've triggered prefetch for this page count
      prefetchTriggeredRef.current = currentPageCount

      // Prefetch next page proactively (page 2)
      // This will be ready when user scrolls, making it feel instant
      // But we won't prefetch page 3 automatically - user scroll will trigger it
      fetchNextPage()
    }
  }, [
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    data?.pages.length,
    fetchNextPage,
    normalizedSearch,
  ])

  const loadMore = React.useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const errorResult: Error | null =
    error instanceof Error ? error : error ? new Error(String(error)) : null

  return {
    pools,
    isLoading,
    error: errorResult,
    loadMore,
    hasMore: hasNextPage ?? false,
    isFetchingMore: isFetchingNextPage,
  }
}

// Prefetch function for use in DashboardScreen
export const usePrefetchPoolList = () => {
  const {wallet} = useSelectedWallet()
  const queryClient = useQueryClient()

  return React.useCallback(() => {
    if (!wallet.isMainnet) return // Only prefetch for mainnet

    const apiUrl = API_ENDPOINTS[Chain.Network.Mainnet].root
    const queryKey = ['poolList', wallet.id, wallet.networkManager.network, '']

    // Prefetch first page
    const prefetchPromise = queryClient.prefetchInfiniteQuery({
      queryKey,
      queryFn: async ({pageParam = 0}) => {
        return fetchPoolsPage(apiUrl, pageParam as number)
      },
      initialPageParam: 0,
    })

    // Ensure we have a promise before calling .then()
    if (prefetchPromise && typeof prefetchPromise.then === 'function') {
      prefetchPromise
        .then(() => {
          // Prefetch second page immediately after first page completes
          // We fetch it directly and it will be picked up by the infinite query
          fetchPoolsPage(apiUrl, 1)
            .then((page2Data) => {
              // Manually set the query data for page 2
              queryClient.setQueryData(queryKey, (oldData: unknown) => {
                if (!oldData) return oldData
                const infiniteData = oldData as {
                  pages: ExplorerPoolInfo[][]
                  pageParams: number[]
                }
                // Only add if not already present
                if (infiniteData.pages.length < 2) {
                  return {
                    ...infiniteData,
                    pages: [...infiniteData.pages, page2Data],
                    pageParams: [...infiniteData.pageParams, 1],
                  }
                }
                return oldData
              })
            })
            .catch(() => {
              // Silently fail - prefetch is best effort
            })
        })
        .catch(() => {
          // Silently fail - prefetch is best effort
        })
    }
  }, [wallet.id, wallet.isMainnet, wallet.networkManager.network, queryClient])
}
