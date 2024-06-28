import {isRight} from '@yoroi/common'
import {Chain, Portfolio} from '@yoroi/types'
import {UseQueryOptions, useQuery} from 'react-query'

export function usePorfolioTokenTraits(
  {
    id,
    getTokenTraits,
    network,
  }: {
    id: Portfolio.Token.Id
    getTokenTraits: Portfolio.Api.Api['tokenTraits']
    network: Chain.SupportedNetworks
  },
  options?: UseQueryOptions<
    Portfolio.Token.Traits,
    Error,
    Portfolio.Token.Traits,
    [Chain.SupportedNetworks, 'usePorfolioTokenTraits', Portfolio.Token.Id]
  >,
) {
  const query = useQuery({
    queryKey: [network, 'usePorfolioTokenTraits', id],
    ...options,
    queryFn: async () => {
      const response = await getTokenTraits(id)
      if (isRight(response)) return response.value.data
      throw new Error('usePorfolioTokenTraits')
    },
  })

  return {
    ...query,
    tokenTraits: query.data,
  }
}
