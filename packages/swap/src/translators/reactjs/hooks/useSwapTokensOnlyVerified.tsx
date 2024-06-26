import {Balance} from '@yoroi/types'
import {UseQueryOptions, useQuery} from '@tanstack/react-query'

import {useSwap} from './useSwap'

export const useSwapTokensOnlyVerified = (
  options?: UseQueryOptions<
    Balance.TokenInfo[],
    Error,
    Balance.TokenInfo[],
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

  return {
    ...query,
    onlyVerifiedTokens: query.data,
  }
}
