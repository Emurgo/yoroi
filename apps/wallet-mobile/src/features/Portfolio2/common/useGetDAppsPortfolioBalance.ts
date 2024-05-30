import {useQuery, UseQueryOptions} from 'react-query'

interface IDAppPortfolioBalance {
  quantity: bigint
  previousQuantity: bigint
}

export const useGetDAppsPortfolioBalance = (
  options: UseQueryOptions<IDAppPortfolioBalance, Error, IDAppPortfolioBalance, ['useGetDAppsPortfolioBalance']> = {},
) => {
  const query = useQuery({
    useErrorBoundary: true,
    ...options,
    queryKey: ['useGetDAppsPortfolioBalance'],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return {
        quantity: BigInt(120000000),
        previousQuantity: BigInt(120160000),
      }
    },
  })

  return query.data
}
