import {isByron} from '@yoroi/cardano-wallet'
import {YoroiWallet} from '@yoroi/cardano-wallet'
import {StakingInfo} from '@yoroi/staking'
import {useSelectedWallet} from '@yoroi/wallet-manager'

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
  const {meta} = useSelectedWallet()
  const isByronWallet = React.useMemo(
    () => (meta ? isByron(meta.implementation) : false),
    [meta],
  )

  const query = useQuery({
    ...options,
    retry: false,
    queryKey: [wallet.id, 'useStakingInfo'],
    queryFn: () => wallet.getStakingInfo(),
    enabled: !isByronWallet && options?.enabled !== false,
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
