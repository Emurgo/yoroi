import {API_ENDPOINTS} from '@yoroi/api'
import {poolInfoApiMaker} from '@yoroi/staking'

import {useQuery} from '@tanstack/react-query'
import * as React from 'react'

import {useSelectedNetwork} from '~/features/WalletManager/hooks/useSelectedNetwork'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'

/**
 * Returns the first Yoroi stake pool ID from pool transition info for the Earn Rewards Banner.
 * Uses the pool transition API response to get pools from the "yoroi" group's new entries.
 * Falls back to stub data if API fails.
 *
 * This ensures users delegate to a Yoroi pool from the configured transition data,
 * which is maintained server-side and can be updated without app releases.
 */
export const useYoroiStakePool = () => {
  const {wallet} = useSelectedWallet()
  const {networkManager} = useSelectedNetwork()

  const poolInfoApi = React.useMemo(() => {
    return poolInfoApiMaker({
      legacyApiBaseUrl: networkManager.legacyApiBaseUrl,
      zeroApiUrl: API_ENDPOINTS[networkManager.network].root,
    })
  }, [networkManager.legacyApiBaseUrl, networkManager.network])

  const query = useQuery({
    queryKey: ['yoroiStakePool', wallet.id, wallet.networkManager.network],
    queryFn: async () => {
      if (!wallet.isMainnet) {
        // No pool list available for testnets
        return null
      }

      try {
        const transitionData = await poolInfoApi.getPoolTransitionInfoPublic()
        if (!transitionData) {
          return null
        }

        // Get the first pool from the "yoroi" group's new entries
        const yoroiPools = transitionData.new?.yoroi
        if (yoroiPools && yoroiPools.length > 0) {
          return yoroiPools[0]
        }

        return null
      } catch (error) {
        // Error already logged in PoolInfoApi
        return null
      }
    },
    enabled: wallet.isMainnet,
    staleTime: 1000 * 60 * 60, // 1 hour - transition data doesn't change often
    retry: 2,
  })

  return {
    poolId: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
  }
}
