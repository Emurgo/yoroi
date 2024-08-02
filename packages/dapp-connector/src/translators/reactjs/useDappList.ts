import {useQuery, UseQueryOptions} from 'react-query'
import {DappListResponse} from '../../adapters/api'
import {useDappConnector} from './DappConnectorProvider'

export const useDappList = (
  options?: UseQueryOptions<DappListResponse, Error, DappListResponse, [string, 'dappList', string]>,
) => {
  const {manager} = useDappConnector()
  return useQuery([manager.walletId, 'dappList', String(manager.chainId)], {
    queryFn: () => manager.getDAppList(),
    refetchOnMount: false,
    refetchInterval: ONE_DAY,
    ...options,
  })
}

const ONE_DAY = 1000 * 60 * 60 * 24
