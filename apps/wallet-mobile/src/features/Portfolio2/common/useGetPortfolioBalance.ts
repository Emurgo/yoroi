import { useQuery, UseQueryOptions } from "react-query"

interface IPortfolioBalance {
  currentADABalance: string
  oldADABalance: string
  exchangeRate: number
}

export const useGetPortfolioBalance = (
  options: UseQueryOptions<IPortfolioBalance, Error, IPortfolioBalance, ['useGetPortfolioBalance']> = {},
) => {
  const query = useQuery({
    useErrorBoundary: true,
    suspense: true,
    ...options,
    queryKey: ['useGetPortfolioBalance'],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      return {
        currentADABalance: '2416.66123',
        oldADABalance: '2418.02123',
        exchangeRate: 0.48,
      }
    },
  })

  return query
}
