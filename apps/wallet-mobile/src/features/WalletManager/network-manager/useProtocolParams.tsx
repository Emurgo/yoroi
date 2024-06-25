import {useQuery, UseQueryOptions} from '@tanstack/react-query'
import {Api} from '@yoroi/types'

import {time} from '../../../kernel/constants'
import {queryInfo} from '../../../kernel/query-client'
import {useSelectedNetwork} from '../common/hooks/useSelectedNetwork'
import {protocolParamsPlaceholder} from './network-manager'

export const useProtocolParams = (
  options?: UseQueryOptions<
    Api.Cardano.ProtocolParams,
    Error,
    Api.Cardano.ProtocolParams,
    [string, string, 'useProtocolParams']
  >,
) => {
  const {network, networkManager} = useSelectedNetwork()
  const query = useQuery({
    suspense: true,
    // TODO: it should be infinity until it is invalided when epoch changes after conway
    staleTime: time.oneHour,
    cacheTime: time.oneHour,
    keepPreviousData: true,
    queryKey: [queryInfo.keyToPersist, network, 'useProtocolParams'],
    ...options,
    queryFn: () => networkManager.api.protocolParams(),
  })

  return {
    ...query,
    protocolParams: query.data ?? protocolParamsPlaceholder,
  }
}
