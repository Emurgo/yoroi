import {Balance} from '@yoroi/types'
import {UseQueryOptions, useQuery} from 'react-query'

import {useSwap} from './useSwap'

export const useSwapTokensByPair = (
  tokenIdBase: Balance.Token['info']['id'],
  options?: UseQueryOptions<
    Balance.Token[],
    Error,
    Balance.Token[],
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
