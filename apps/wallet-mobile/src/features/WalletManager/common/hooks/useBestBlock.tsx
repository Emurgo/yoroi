import {Chain} from '@yoroi/types'
import {useQuery, UseQueryOptions} from 'react-query'

import {useSelectedNetwork} from './useSelectedNetwork'

export const useBestBlock = ({options}: {options?: UseQueryOptions<Chain.Cardano.BestBlock, Error>}) => {
  const {networkManager, network} = useSelectedNetwork()
  const query = useQuery<Chain.Cardano.BestBlock, Error>({
    suspense: true,
    staleTime: 10_000,
    retry: 3,
    retryDelay: 1_000,
    queryKey: [network, 'tipStatus'],
    queryFn: () =>
      networkManager.api.bestBlock().catch(() => ({
        // TODO: Without this it break when offline. Needs better fixing
        epoch: 510,
        slot: 130081,
        globalSlot: 135086881,
        hash: 'ab0093eb78bcb0146355741388632eb50c69407df8fa32de85e5f198d725e8f4',
        height: 10850697,
      })),
    ...options,
  })

  if (!query.data) throw new Error('Failed to retrive tipStatus')

  return query.data
}
