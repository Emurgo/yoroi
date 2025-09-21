import {FullPoolInfo, PoolInfoApi} from '@emurgo/yoroi-lib'
import {useQuery} from '@tanstack/react-query'
import * as React from 'react'

import {useSelectedNetwork} from '~/features/WalletManager/hooks/useSelectedNetwork'

export const usePoolInfo = ({poolId}: {poolId: string}): FullPoolInfo => {
  const {networkManager} = useSelectedNetwork()
  const poolInfoApi = React.useMemo(
    () => new PoolInfoApi(networkManager.legacyApiBaseUrl),
    [networkManager.legacyApiBaseUrl],
  )
  const poolInfo = useQuery({
    queryKey: ['usePoolInfo', poolId],
    queryFn: async () => {
      return poolInfoApi.getSingleFullPoolInfo(poolId)
    },
    initialData: {chain: null, explorer: null},
  })

  return poolInfo?.data ?? {chain: null, explorer: null}
}
