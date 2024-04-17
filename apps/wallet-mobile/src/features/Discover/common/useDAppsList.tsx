import {useQuery, UseQueryOptions} from 'react-query'

import {useSelectedWallet} from '../../../features/WalletManager/Context'
import {DAppItem, mockDAppList} from './DAppMock'

type Result = {
  dapps: DAppItem[]
  filters: Record<string, string[]>
}

export const useDAppsList = (options?: UseQueryOptions<Result, Error, Result, [string, string]>) => {
  const wallet = useSelectedWallet()

  return useQuery({
    suspense: true,
    ...options,
    queryKey: [wallet.id, 'dappsList'],
    queryFn: async () => {
      return await new Promise<Result>((resolve) => {
        return setTimeout(() => resolve(result), 1000)
      })
    },
  })
}

const result = {
  dapps: mockDAppList,
  filters: {
    Media: ['News', 'Entertainment'],
    Investment: ['DeFi', 'DEX', 'NFT Marketplace', 'Stablecoin'],
    NFT: ['NFT Marketplace'],
    Trading: ['DEX', 'Trading Tools', 'Stablecoin'],
    Community: ['DAO', 'Decentralised Storage'],
  },
}
