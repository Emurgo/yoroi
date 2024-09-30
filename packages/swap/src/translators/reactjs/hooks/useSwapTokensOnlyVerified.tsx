import {Portfolio} from '@yoroi/types'
import {UseQueryOptions, useQuery} from '@tanstack/react-query'

import {useSwap} from './useSwap'

export const useSwapTokensOnlyVerified = (
  options?: UseQueryOptions<
    Array<Portfolio.Token.Info>,
    Error,
    Array<Portfolio.Token.Info>,
    ['useSwapTokensOnlyVerified']
  >,
) => {
  const {tokens} = useSwap()

  const query = useQuery({
    suspense: true,
    queryKey: ['useSwapTokensOnlyVerified'],
    ...options,
    queryFn: () => tokens.list.onlyVerified(),
  })

  return query.data ?? []
}
