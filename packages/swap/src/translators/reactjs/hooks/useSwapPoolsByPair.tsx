import {Portfolio, Swap} from '@yoroi/types'
import {UseQueryOptions, useQuery} from 'react-query'

import {useSwap} from './useSwap'

export const useSwapPoolsByPair = (
  tokenPair: {
    tokenA: Portfolio.TokenInfo['id']
    tokenB: Portfolio.TokenInfo['id']
  },
  options?: UseQueryOptions<
    Swap.Pool[],
    Error,
    Swap.Pool[],
    [
      'usePoolsByPair',
      {
        tokenA: Portfolio.TokenInfo['id']
        tokenB: Portfolio.TokenInfo['id']
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
