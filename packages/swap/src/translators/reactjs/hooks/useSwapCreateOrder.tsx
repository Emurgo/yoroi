import {Swap} from '@yoroi/types'
import {UseMutationOptions} from 'react-query'

import {useSwap} from './useSwap'
import {useMutationWithInvalidations} from '../../../utils/useMutationsWithInvalidations'

export const useSwapCreateOrder = (
  options?: UseMutationOptions<
    Swap.CreateOrderResponse,
    Error,
    Swap.CreateOrderData
  >,
) => {
  const {order, stakingKey} = useSwap()

  const mutation = useMutationWithInvalidations({
    mutationFn: (orderData) => order.create(orderData),
    invalidateQueries: [
      ['useSwapOrdersByStatusOpen', stakingKey],
      ['useSwapOrdersByStatusCompleted', stakingKey],
    ],
    useErrorBoundary: true,
    ...options,
  })

  return {
    createOrderData: mutation.mutate,
    ...mutation,
  }
}
