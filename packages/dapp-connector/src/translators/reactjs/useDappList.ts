import {time} from '@yoroi/common'
import {useQuery, UseQueryOptions, UseQueryResult} from '@tanstack/react-query'

import {DappListResponse} from '../../adapters/api'
import {useDappConnector} from './DappConnectorProvider'

type DappListQueryKey = readonly [string, 'dappList', string]

export const useDappList = (
  options?: UseQueryOptions<
    DappListResponse,
    Error,
    DappListResponse,
    DappListQueryKey
  >,
): UseQueryResult<DappListResponse, Error> => {
  const {manager} = useDappConnector()

  const queryKey: DappListQueryKey = [
    manager.walletId,
    'dappList',
    manager.network,
  ]

  return useQuery<DappListResponse, Error, DappListResponse, DappListQueryKey>({
    queryKey,
    queryFn: () => manager.getDAppList(),
    refetchOnMount: false,
    refetchInterval: time.oneDay,
    ...(options ?? {}),
  })
}
