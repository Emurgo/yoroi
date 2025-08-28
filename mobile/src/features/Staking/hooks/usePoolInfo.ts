import {FullPoolInfo, PoolInfoApi} from '@emurgo/yoroi-lib'
import {useSuspenseQuery} from '@tanstack/react-query'
import * as React from 'react'

import {useSelectedNetwork} from '~/features/WalletManager/hooks/useSelectedNetwork'

export const usePoolInfo = ({poolId}: {poolId: string}): FullPoolInfo => {
  const {networkManager} = useSelectedNetwork()
  const poolInfoApi = React.useMemo(
    () => new PoolInfoApi(networkManager.legacyApiBaseUrl),
    [networkManager.legacyApiBaseUrl],
  )
  const poolInfo = useSuspenseQuery({
    queryKey: ['usePoolInfo', poolId],
    queryFn: async () => {
      return poolInfoApi.getSingleFullPoolInfo(poolId)
    },
  })

  return poolInfo?.data ?? {chain: null, explorer: null}
}
