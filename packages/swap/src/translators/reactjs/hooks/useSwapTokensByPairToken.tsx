import {Portfolio} from '@yoroi/types'
import {UseQueryOptions, useQuery} from 'react-query'

import {useSwap} from './useSwap'

export const useSwapTokensByPairToken = (
  tokenIdBase: Portfolio.TokenInfo['id'],
  options?: UseQueryOptions<
    Portfolio.Token[],
    Error,
    Portfolio.Token[],
    ['useSwapTokensByPairToken', string]
  >,
) => {
  const {pairs} = useSwap()

  const query = useQuery({
    suspense: true,
    queryKey: ['useSwapTokensByPairToken', tokenIdBase],
    ...options,
    queryFn: () => pairs.list.byToken(tokenIdBase),
  })

  return {
    ...query,
    pairsByToken: query.data,
  }
}
