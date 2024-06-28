import {useQuery, UseQueryOptions} from 'react-query'
import {DappListResponse} from '../../adapters/api'
import {useDappConnector} from './DappConnectorProvider'

export const useDappList = (options?: UseQueryOptions<DappListResponse, Error, DappListResponse, ['dappList']>) => {
  const {manager} = useDappConnector()
  return useQuery(['dappList'], {
    ...options,
    queryFn: () => manager.getDAppList(),
  })
}
