import {Swap} from '@yoroi/types'
import {UseQueryOptions, useQuery} from 'react-query'

import {useSwap} from './useSwap'

export const useSwapOrdersByStatusCompleted = (
  options?: UseQueryOptions<
    Swap.CompletedOrderResponse,
    Error,
    Swap.CompletedOrderResponse,
    ['useSwapOrdersByStatusCompleted']
  >,
) => {
  const {order} = useSwap()

  const query = useQuery({
    suspense: true,
    queryKey: ['useSwapOrdersByStatusCompleted'],
    ...options,
    queryFn: order.list.byStatusCompleted,
  })

  if (query.data == null)
    throw new Error(
      '[@yoroi/swap] useSwapOrdersByStatusCompleted invalid state',
    )

  return query.data
}
