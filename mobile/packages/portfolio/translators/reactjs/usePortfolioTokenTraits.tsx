import {isRight} from '@yoroi/common'
import {Chain, Portfolio} from '@yoroi/types'

import {UseSuspenseQueryOptions, useSuspenseQuery} from '@tanstack/react-query'

export function usePortfolioTokenTraits(
  {
    id,
    getTokenTraits,
    network,
  }: {
    id: Portfolio.Token.Id
    getTokenTraits: Portfolio.Api.Api['tokenTraits']
    network: Chain.SupportedNetworks
  },
  options?: UseSuspenseQueryOptions<
    Portfolio.Token.Traits,
    Error,
    Portfolio.Token.Traits,
    [Chain.SupportedNetworks, 'usePortfolioTokenTraits', Portfolio.Token.Id]
  >,
) {
  const query = useSuspenseQuery({
    queryKey: [network, 'usePortfolioTokenTraits', id],
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
