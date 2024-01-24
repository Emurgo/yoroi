import {Swap} from '@yoroi/types'
import {UseQueryOptions, useQuery} from 'react-query'

import {useSwap} from './useSwap'

export const useSwapOrdersByStatusOpen = (
  options?: UseQueryOptions<
    Swap.OpenOrderResponse,
    Error,
    Swap.OpenOrderResponse,
    ['useSwapOrdersByStatusOpen', string]
  >,
) => {
  const {order, stakingKey} = useSwap()
  const query = useQuery({
    suspense: true,
    queryKey: ['useSwapOrdersByStatusOpen', stakingKey],
    ...options,
    queryFn: order.list.byStatusOpen,
  })

  if (query.data == null)
    throw new Error('[@yoroi/swap] useSwapOrdersByStatusOpen invalid state')

  return query.data
}
