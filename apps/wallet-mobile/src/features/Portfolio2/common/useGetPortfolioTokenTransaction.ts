import { useQuery, UseQueryOptions } from 'react-query'


export const TOKEN_TRANSACTION_DIRECTION = {
  SENT: 'SENT',
  RECEIVED: 'RECEIVED',
  STAKE_REWARD: 'STAKE_REWARD',
  STAKE_DELEGATED: 'STAKE_DELEGATED',
  FAILED: 'FAILED',
} as const

export type TokenTransactionDirection = (typeof TOKEN_TRANSACTION_DIRECTION)[keyof typeof TOKEN_TRANSACTION_DIRECTION]
export type ITokenTransaction = {
  id: string
  amount: string
  fee: string
  direction: TokenTransactionDirection
  submittedAt: string
  lastUpdatedAt: string
  asset?: number
}


const mockTransactions: ITokenTransaction[] = [{
  id: '1',
  amount: '0',
  fee: '0',
  direction: TOKEN_TRANSACTION_DIRECTION.RECEIVED,
  submittedAt: '2024-05-08T11:04:27.000Z',
  lastUpdatedAt: '2024-05-08T11:04:27.000Z',
  asset: 0
},
{
  id: '2',
  amount: '0',
  fee: '0',
  direction: TOKEN_TRANSACTION_DIRECTION.STAKE_REWARD,
  submittedAt: '2024-05-08T11:04:27.000Z',
  lastUpdatedAt: '2024-05-08T11:04:27.000Z',
  asset: 0
},
{
  id: '3',
  amount: '0',
  fee: '0',
  direction: TOKEN_TRANSACTION_DIRECTION.STAKE_DELEGATED,
  submittedAt: '2024-05-08T11:04:27.000Z',
  lastUpdatedAt: '2024-05-08T11:04:27.000Z',
  asset: 0
},
{
  id: '4',
  amount: '0',
  fee: '0',
  direction: TOKEN_TRANSACTION_DIRECTION.SENT,
  submittedAt: '2024-05-08T11:04:27.000Z',
  lastUpdatedAt: '2024-05-08T11:04:27.000Z',
  asset: 0
},
{
  id: '5',
  amount: '0',
  fee: '0',
  direction: TOKEN_TRANSACTION_DIRECTION.FAILED,
  submittedAt: '2024-05-08T11:04:27.000Z',
  lastUpdatedAt: '2024-05-08T11:04:27.000Z',
  asset: 0,
}]


export const useGetPortfolioTokenTransaction = (
  name: string,
  options: UseQueryOptions<ITokenTransaction[], Error, ITokenTransaction[], ['useGetPortfolioTokenTransaction', string]> = {},
) => {
  const query = useQuery({
    useErrorBoundary: true,
    ...options,
    refetchOnMount: false,
    queryKey: ['useGetPortfolioTokenTransaction', name],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      return Array.from({ length: 40 }, (_, i) => {
        const tx = mockTransactions[i % mockTransactions.length];
        tx.id = String(i);

        if (i % 5 === 0) {
          const date = new Date('2024-04-30T11:04:27.000Z')
          date.setDate(date.getDate() - i)
          tx.submittedAt = date.toISOString()
          tx.lastUpdatedAt = date.toISOString()
        }

        return tx
      });
    },
  })

  return query
}
