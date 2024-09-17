import {createUnknownTokenInfo, isPrimaryToken} from '@yoroi/portfolio'
import {Portfolio} from '@yoroi/types'
import {useQuery, UseQueryOptions} from 'react-query'

import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'

export const usePortfolioTokenInfos = (
  {wallet, tokenIds}: {wallet: YoroiWallet; tokenIds: ReadonlyArray<Portfolio.Token.Id>},
  options: UseQueryOptions<Map<`${string}.${string}`, Portfolio.Token.Info>, Error>,
) => {
  const query = useQuery({
    queryKey: [wallet.networkManager.network, 'useTokenInfos', tokenIds],
    ...options,
    queryFn: async () => {
      const secondaryTokenIds = tokenIds.filter((id) => !isPrimaryToken(id))
      const response = await wallet.networkManager.tokenManager.sync({secondaryTokenIds, sourceId: 'useTokenInfos'})
      const result = new Map<`${string}.${string}`, Portfolio.Token.Info>([
        [wallet.portfolioPrimaryTokenInfo.id, wallet.portfolioPrimaryTokenInfo],
      ])
      for (const [id, tokenInfo] of response) {
        result.set(id, tokenInfo?.record ?? createUnknownTokenInfo({id, name: `Unknown ${id}`}))
      }
      return result
    },
  })

  return {
    ...query,
    tokenInfos: query.data,
  }
}
