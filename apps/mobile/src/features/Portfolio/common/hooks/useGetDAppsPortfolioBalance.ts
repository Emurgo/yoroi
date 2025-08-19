import {UseQueryOptions, useQuery} from '@tanstack/react-query'

interface IDAppPortfolioBalance {
  quantity: bigint
  previousQuantity: bigint
}

export const useGetDAppsPortfolioBalance = (
  quantity: bigint,
  options: Omit<
    UseQueryOptions<
      IDAppPortfolioBalance,
      Error,
      IDAppPortfolioBalance,
      ['useGetDAppsPortfolioBalance', number]
    >,
    'queryKey' | 'queryFn'
  > = {},
) => {
  const query = useQuery({
    throwOnError: true,
    ...options,
    queryKey: ['useGetDAppsPortfolioBalance', Number(quantity)],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      if (Number(quantity) === 0) {
        return {
          quantity: BigInt(0),
          previousQuantity: BigInt(0),
        }
      }

      return {
        quantity: BigInt(0),
        previousQuantity: BigInt(0),
      }
    },
  })

  return query.data
}
