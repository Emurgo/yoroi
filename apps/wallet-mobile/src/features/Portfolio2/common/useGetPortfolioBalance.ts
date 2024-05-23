import { useQuery, UseQueryOptions } from "react-query"

interface IPortfolioBalance {
  currentBalance: string
  oldBalance: string
  usdExchangeRate: number
}

export const useGetPortfolioBalance = (
  options: UseQueryOptions<IPortfolioBalance, Error, IPortfolioBalance, ['useGetPortfolioBalance']> = {},
) => {
  const query = useQuery({
    useErrorBoundary: true,
    ...options,
    queryKey: ['useGetPortfolioBalance'],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 5000))
      return {
        currentBalance: '2416.66123',
        oldBalance: '2418.02123',
        usdExchangeRate: 0.48,
      }
    },
  })

  return query
}
