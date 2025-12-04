import {time} from '@yoroi/common'
import {Branded, Chain} from '@yoroi/types'

import {UseQueryOptions, useQuery} from '@tanstack/react-query'

import {persistPrefixKeyword} from '~/kernel/connection/ConnectionProvider'

import {useSelectedNetwork} from './useSelectedNetwork'

export const useBestBlock = ({
  options,
}: {
  options?: UseQueryOptions<Chain.Cardano.BestBlock, Error>
}) => {
  const {networkManager, network} = useSelectedNetwork()
  const query = useQuery<Chain.Cardano.BestBlock, Error>({
    staleTime: time.seconds(10),
    retry: 3,
    retryDelay: time.oneSecond,
    queryKey: [persistPrefixKeyword, network, 'tipStatus'],
    queryFn: () =>
      networkManager.api.bestBlock().catch(() => ({
        // TODO: Without this it break when offline. Needs better fixing
        epoch: Branded.asEpochNumber(510),
        slot: Branded.asSlotNumber(130081),
        globalSlot: Branded.asSlotNumber(135086881),
        hash: Branded.asBlockHash(
          'ab0093eb78bcb0146355741388632eb50c69407df8fa32de85e5f198d725e8f4',
        ),
        height: 10850697,
      })),
    ...options,
  })

  if (!query.data) throw new Error('Failed to retrive tipStatus')

  return query.data
}
