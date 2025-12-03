import {YoroiWallet} from '@yoroi/cardano-wallet/types'
import {StakingInfo} from '@yoroi/staking'

import {UseQueryOptions, useQuery} from '@tanstack/react-query'
import * as React from 'react'

export const useStakingInfo = (
  wallet: YoroiWallet,
  options?: UseQueryOptions<
    StakingInfo,
    Error,
    StakingInfo,
    [string, 'useStakingInfo']
  >,
) => {
  const query = useQuery({
    ...options,
    retry: false,
    queryKey: [wallet.id, 'useStakingInfo'],
    queryFn: () => wallet.getStakingInfo(),
  })

  React.useEffect(() => {
    const unsubscribe = wallet.subscribe(({type}) => {
      return type === 'utxos' && query.refetch()
    })

    return () => {
      unsubscribe?.()
    }
  }, [query, wallet])

  return {
    stakingInfo: query.data,
    ...query,
  }
}
