import {Balance} from '@yoroi/types'
import {UseQueryOptions, useQuery} from 'react-query'

import {useSwap} from './useSwap'

export const useSwapTokensByPairToken = (
  tokenIdBase: Balance.Token['info']['id'],
  options?: UseQueryOptions<
    Balance.Token[],
    Error,
    Balance.Token[],
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
