import {isRight} from '@yoroi/common'
import {Chain, Portfolio} from '@yoroi/types'

import {UseSuspenseQueryOptions, useSuspenseQuery} from '@tanstack/react-query'

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
  options?: UseSuspenseQueryOptions<
    Portfolio.Token.Discovery | undefined,
    Error,
    Portfolio.Token.Discovery | undefined,
    [Chain.SupportedNetworks, 'usePortfolioTokenDiscovery', Portfolio.Token.Id]
  >,
) {
  const query = useSuspenseQuery({
    queryKey: [network, 'usePortfolioTokenDiscovery', id],
    ...options,
    queryFn: async () => {
      const response = await getTokenDiscovery(id)
      if (isRight(response)) return response.value.data
      // Return undefined instead of throwing - allows component to handle missing data gracefully
      // This is expected for tokens that don't exist in the discovery API (e.g., newly minted tokens)
      return undefined
    },
  })

  return {
    ...query,
    tokenDiscovery: query.data,
  }
}
