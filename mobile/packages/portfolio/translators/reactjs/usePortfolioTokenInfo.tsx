import {Chain, Portfolio} from '@yoroi/types'

import {UseSuspenseQueryOptions, useSuspenseQuery} from '@tanstack/react-query'

import {queryTokenInfo} from '../../helpers/queries'

export function usePortfolioTokenInfo(
  {
    id,
    getTokenInfo,
    network,
    primaryTokenInfo,
  }: {
    id: Portfolio.Token.Id
    getTokenInfo: Portfolio.Api.Api['tokenInfo']
    network: Chain.SupportedNetworks
    primaryTokenInfo: Portfolio.Token.Info
  },
  options?: UseSuspenseQueryOptions<
    Portfolio.Token.Info,
    Error,
    Portfolio.Token.Info,
    [Chain.SupportedNetworks, 'usePortfolioTokenInfo', Portfolio.Token.Id]
  >,
) {
  const query = useSuspenseQuery({
    queryKey: [network, 'usePortfolioTokenInfo', id],
    ...options,
    queryFn: () => queryTokenInfo({id, getTokenInfo, primaryTokenInfo}),
  })

  return {
    ...query,
    tokenInfo: query.data,
  }
}
