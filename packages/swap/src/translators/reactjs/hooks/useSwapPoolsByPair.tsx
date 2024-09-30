import {Portfolio, Swap} from '@yoroi/types'
import {UseQueryOptions, useQuery} from '@tanstack/react-query'

import {useSwap} from './useSwap'

export const useSwapPoolsByPair = (
  tokenPair: {
    tokenA: Portfolio.Token.Id
    tokenB: Portfolio.Token.Id
  },
  options?: UseQueryOptions<
    Swap.Pool[],
    Error,
    Swap.Pool[],
    [
      'usePoolsByPair',
      {
        tokenA: Portfolio.Token.Id
        tokenB: Portfolio.Token.Id
      },
    ]
  >,
) => {
  const {pools} = useSwap()

  const query = useQuery({
    suspense: true,
    enabled: tokenPair?.tokenA !== undefined && tokenPair?.tokenB !== undefined,
    queryKey: ['usePoolsByPair', tokenPair],
    ...options,
    queryFn: () => pools.list.byPair(tokenPair),
  })

  return {
    ...query,
    poolList: query.data,
  }
}
