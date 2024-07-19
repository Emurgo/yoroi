import {isRight} from '@yoroi/common'
import {Chain, Portfolio} from '@yoroi/types'
import {UseQueryOptions, useQuery} from 'react-query'

export function usePortfolioTokenDiscovery(
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
    [Chain.SupportedNetworks, 'usePortfolioTokenDiscovery', Portfolio.Token.Id]
  >,
) {
  const query = useQuery({
    queryKey: [network, 'usePortfolioTokenDiscovery', id],
    ...options,
    queryFn: async () => {
      const response = await getTokenDiscovery(id)
      if (isRight(response)) return response.value.data
      throw new Error('usePortfolioTokenDiscovery')
    },
  })

  return {
    ...query,
    tokenDiscovery: query.data,
  }
}
