import {Swap} from '@yoroi/types'
import {UseQueryOptions, useQuery} from 'react-query'

import {useSwap} from './useSwap'

export const useSwapOrdersByStatusOpen = (
  options?: UseQueryOptions<
    Swap.OpenOrderResponse,
    Error,
    Swap.OpenOrderResponse,
    ['useSwapOrdersByStatusOpen']
  >,
) => {
  const {order} = useSwap()
  const query = useQuery({
    suspense: true,
    queryKey: ['useSwapOrdersByStatusOpen'],
    ...options,
    queryFn: order.list.byStatusOpen,
  })

  if (query.data == null)
    throw new Error('[@yoroi/swap] useSwapOrdersByStatusOpen invalid state')

  return query.data
}
