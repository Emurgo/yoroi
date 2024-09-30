import {Portfolio} from '@yoroi/types'
import {UseQueryOptions, useQuery} from '@tanstack/react-query'

import {useSwap} from './useSwap'

export const useSwapTokensByPair = (
  tokenIdBase: Portfolio.Token.Id,
  options?: UseQueryOptions<
    Array<Portfolio.Token.Info>,
    Error,
    Array<Portfolio.Token.Info>,
    ['useSwapTokensByPair', string]
  >,
) => {
  const {tokens} = useSwap()

  const query = useQuery({
    suspense: true,
    queryKey: ['useSwapTokensByPair', tokenIdBase],
    ...options,
    queryFn: () => tokens.list.byPair(tokenIdBase),
  })

  return {
    ...query,
    tokensByPair: query.data,
  }
}
