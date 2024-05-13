import {isRight} from '@yoroi/common'
import {Chain, Portfolio} from '@yoroi/types'
import {UseQueryOptions, useQuery} from 'react-query'

export function usePorfolioTokenDiscovery(
  {
    id,
    getTokenDiscovery,
    network,
  }: {
    id: Portfolio.Token.Id
    getTokenDiscovery: Portfolio.Api.Api['tokenDiscovery']
    network: Chain.SupportedNetworks
  },
  options?: UseQueryOptions<
    Portfolio.Token.Discovery,
    Error,
    Portfolio.Token.Discovery,
    [Chain.SupportedNetworks, 'usePorfolioTokenDiscovery', Portfolio.Token.Id]
  >,
) {
  const query = useQuery({
    queryKey: [network, 'usePorfolioTokenDiscovery', id],
    ...options,
    queryFn: async () => {
      const response = await getTokenDiscovery(id)
      if (isRight(response)) return response.value.data
      throw new Error('usePorfolioTokenDiscovery')
    },
  })

  return {
    ...query,
    tokenDiscovery: query.data,
  }
}
