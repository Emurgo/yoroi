import {Chain} from '@yoroi/types'
import {useQuery, UseQueryOptions} from '@tanstack/react-query'

import {useSelectedNetwork} from './useSelectedNetwork'

export const useBestBlock = ({options}: {options?: UseQueryOptions<Chain.Cardano.BestBlock, Error>}) => {
  const {networkManager, network} = useSelectedNetwork()
  const query = useQuery<Chain.Cardano.BestBlock, Error>({
    suspense: true,
    staleTime: 10_000,
    retry: 3,
    retryDelay: 1_000,
    queryKey: [network, 'tipStatus'],
    queryFn: () => networkManager.api.bestBlock(),
    ...options,
  })

  if (!query.data) throw new Error('Failed to retrive tipStatus')

  return query.data
}
