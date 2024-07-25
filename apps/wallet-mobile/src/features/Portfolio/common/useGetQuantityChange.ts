// TODO: API pending. Does previousQuantity need and separate call?
import {useQuery, UseQueryOptions} from 'react-query'

type QuantityChange = {
  previousQuantity: bigint
  quantity: bigint
}
export const useGetQuantityChange = (
  {name, quantity}: {name: string; quantity: bigint},
  options: UseQueryOptions<QuantityChange, Error, QuantityChange, ['useGetQuantityChange', string]> = {},
) => {
  const query = useQuery({
    useErrorBoundary: true,
    ...options,
    queryKey: ['useGetQuantityChange', name],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      const randomNumber = Math.floor(Math.random() * 10) + 90
      const reduction = (quantity * BigInt(randomNumber)) / BigInt(100 * 1000)
      const previousQuantityMock = quantity - reduction

      return {
        quantity,
        previousQuantity: previousQuantityMock,
      }
    },
  })

  return query.data
}
