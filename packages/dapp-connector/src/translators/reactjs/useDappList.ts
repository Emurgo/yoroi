import {useQuery, UseQueryOptions} from 'react-query'
import {dappConnectorApiGetDappList, DappListResponse} from '../../adapters/api'

export const useDappList = (options?: UseQueryOptions<DappListResponse, Error, DappListResponse, 'dappList'>) => {
  return useQuery('dappList', {
    ...options,
    queryFn: dappConnectorApiGetDappList(),
  })
}
