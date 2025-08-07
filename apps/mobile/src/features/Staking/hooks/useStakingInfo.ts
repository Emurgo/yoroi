import {UseSuspenseQueryOptions, useSuspenseQuery} from '@tanstack/react-query'
import * as React from 'react'

import {YoroiWallet} from '~/wallets/cardano/types'
import {StakingInfo} from '~/wallets/types/staking'

export const useStakingInfo = (
  wallet: YoroiWallet,
  options?: UseSuspenseQueryOptions<
    StakingInfo,
    Error,
    StakingInfo,
    [string, 'useStakingInfo']
  >,
) => {
  const query = useSuspenseQuery({
    ...options,
    retry: false,
    queryKey: [wallet.id, 'useStakingInfo'],
    queryFn: () => wallet.getStakingInfo(),
  })

  React.useEffect(() => {
    const unsubscribe = wallet.subscribe(
      ({type}) => type === 'utxos' && query.refetch(),
    )

    return () => unsubscribe?.()
  }, [query, wallet])

  return {
    stakingInfo: query.data,
    ...query,
  }
}
