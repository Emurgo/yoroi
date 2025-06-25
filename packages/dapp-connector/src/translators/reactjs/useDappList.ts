import {time} from '@yoroi/common'

import {useQuery, UseQueryOptions} from '@tanstack/react-query'

import {DappListResponse} from '../../adapters/api'
import {useDappConnector} from './DappConnectorProvider'

export const useDappList = (
  options?: UseQueryOptions<
    DappListResponse,
    Error,
    DappListResponse,
    [string, 'dappList', string]
  >,
) => {
  const {manager} = useDappConnector()
  return useQuery([manager.walletId, 'dappList', manager.network], {
    queryFn: () => manager.getDAppList(),
    refetchOnMount: false,
    refetchInterval: time.oneDay,
    ...options,
  })
}
