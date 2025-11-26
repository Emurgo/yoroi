import {API_ENDPOINTS} from '@yoroi/api'
import {FullPoolInfo, poolInfoApiMaker} from '@yoroi/staking'

import {useQuery} from '@tanstack/react-query'
import * as React from 'react'

import {useSelectedNetwork} from '~/features/WalletManager/hooks/useSelectedNetwork'
import {poolQueryKeys} from '~/queries'

export const usePoolInfo = ({poolId}: {poolId: string}): FullPoolInfo => {
  const {networkManager} = useSelectedNetwork()
  const poolInfoApi = React.useMemo(
    () =>
      poolInfoApiMaker({
        legacyApiBaseUrl: networkManager.legacyApiBaseUrl,
        zeroApiUrl: API_ENDPOINTS[networkManager.network].root,
      }),
    [networkManager.legacyApiBaseUrl, networkManager.network],
  )
  const poolInfo = useQuery({
    queryKey: poolQueryKeys.info(poolId),
    queryFn: async () => {
      return poolInfoApi.getSingleFullPoolInfo(poolId)
    },
    initialData: {chain: null, explorer: null},
  })

  return poolInfo?.data ?? {chain: null, explorer: null}
}
