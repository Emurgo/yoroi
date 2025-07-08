import {useQuery, UseQueryOptions} from '@tanstack/react-query'

interface IDAppPortfolioBalance {
  quantity: bigint
  previousQuantity: bigint
}

export const useGetDAppsPortfolioBalance = (
  quantity: bigint,
  options: UseQueryOptions<
    IDAppPortfolioBalance,
    Error,
    IDAppPortfolioBalance,
    ['useGetDAppsPortfolioBalance', number]
  > = {},
) => {
  const query = useQuery({
    useErrorBoundary: true,
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
        quantity: BigInt(120000000),
        previousQuantity: BigInt(120160000),
      }
    },
  })

  return query.data
}
