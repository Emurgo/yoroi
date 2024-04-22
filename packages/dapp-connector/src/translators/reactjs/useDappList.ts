import {useQuery} from 'react-query'
import {dappConnectorApiGetDappList} from '../../adapters/api'

export const useDappList = () => {
  return useQuery('dappList', dappConnectorApiGetDappList())
}
