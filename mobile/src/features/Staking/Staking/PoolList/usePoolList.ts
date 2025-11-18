import {API_ENDPOINTS} from '@yoroi/api'
import {getLogger} from '@yoroi/common'
import {ExplorerPoolInfo} from '@yoroi/staking'
import {Chain} from '@yoroi/types'

import axios from 'axios'
import * as React from 'react'

import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'

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

export const usePoolList = () => {
  const {wallet} = useSelectedWallet()
  const [pools, setPools] = React.useState<ExplorerPoolInfo[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<Error | null>(null)
  const [hasMore, setHasMore] = React.useState(true)
  const [currentPage, setCurrentPage] = React.useState(0)

  const apiUrl = React.useMemo(() => {
    if (wallet.isMainnet) {
      return API_ENDPOINTS[Chain.Network.Mainnet].root
    }
    if (wallet.networkManager.network === Chain.Network.Preprod) {
      return API_ENDPOINTS[Chain.Network.Preprod].root
    }
    return API_ENDPOINTS[Chain.Network.Preview].root
  }, [wallet.isMainnet, wallet.networkManager.network])

  const fetchPools = React.useCallback(
    async (_page: number) => {
      try {
        setIsLoading(true)
        setError(null)

        const params = new URLSearchParams({
          limit: String(POOLS_PER_PAGE),
          order: 'ranking',
        })

        const url = `${apiUrl}/v0/cexplorer-pool-list?${params.toString()}`
        const response = await axios.get<ExplorerPoolInfoApiRes>(url)

        const poolsData = response.data
        if (!poolsData.data?.data?.length) {
          setHasMore(false)
          return []
        }

        const newPools: ExplorerPoolInfo[] = poolsData.data.data.map(
          (pool) => ({
            id: pool.pool_id,
            hash: pool.pool_id_hash_raw,
            ticker: pool.pool_name.ticker,
            name: pool.pool_name.name,
            pic: `https://ix.cexplorer.io/${pool.pool_id}`,
            stake: String(pool.live_stake),
            roa: String(pool.stats.lifetime.roa),
            taxFix: String(pool.pool_update.active.fixed_cost),
            taxRatio: String(pool.pool_update.active.margin),
            saturation: String(pool.saturation),
          }),
        )

        return newPools
      } catch (e) {
        const logger = getLogger()
        const error = e instanceof Error ? e : new Error(String(e))
        logger.error(error, {
          origin: 'staking',
          operation: 'usePoolList.fetchPools',
        })
        setError(error)
        return []
      } finally {
        setIsLoading(false)
      }
    },
    [apiUrl],
  )

  const loadMore = React.useCallback(async () => {
    if (isLoading || !hasMore) return

    const nextPage = currentPage + 1
    const newPools = await fetchPools(nextPage)

    if (newPools.length > 0) {
      setPools((prev) => [...prev, ...newPools])
      setCurrentPage(nextPage)
    } else {
      setHasMore(false)
    }
  }, [currentPage, fetchPools, hasMore, isLoading])

  React.useEffect(() => {
    const loadInitial = async () => {
      const initialPools = await fetchPools(0)
      if (initialPools.length > 0) {
        setPools(initialPools)
        setCurrentPage(0)
        setHasMore(initialPools.length === POOLS_PER_PAGE)
      }
    }

    loadInitial()
  }, [fetchPools])

  return {
    pools,
    isLoading,
    error,
    loadMore,
    hasMore,
  }
}
