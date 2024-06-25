import {Swap} from '@yoroi/types'
import {UseMutationOptions} from '@tanstack/react-query'
import {useMutationWithInvalidations} from '@yoroi/common'

import {useSwap} from './useSwap'

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
