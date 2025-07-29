import {useQuery, UseQueryOptions} from '@tanstack/react-query'
import {createUnknownTokenInfo, isPrimaryToken} from '@yoroi/portfolio'
import {Portfolio} from '@yoroi/types'

import {YoroiWallet} from '~/wallets/cardano/types'

export const usePortfolioTokenInfos = (
  {
    wallet,
    tokenIds,
    sourceId = 'useTokenInfos',
  }: {
    wallet: YoroiWallet
    tokenIds: ReadonlyArray<Portfolio.Token.Id>
    sourceId?: string
  },
  options: UseQueryOptions<
    Map<`${string}.${string}`, Portfolio.Token.Info>,
    Error
  > = {},
) => {
  const query = useQuery({
    queryKey: [wallet.networkManager.network, sourceId, tokenIds],
    ...options,
    queryFn: async () => {
      const secondaryTokenIds = tokenIds.filter((id) => !isPrimaryToken(id))
      const response = await wallet.networkManager.tokenManager.sync({
        secondaryTokenIds,
        sourceId,
      })
      const result = new Map<`${string}.${string}`, Portfolio.Token.Info>([
        [wallet.portfolioPrimaryTokenInfo.id, wallet.portfolioPrimaryTokenInfo],
      ])
      for (const [id, tokenInfo] of response) {
        result.set(id, tokenInfo?.record ?? createUnknownTokenInfo({id}))
      }
      return result
    },
  })

  return {
    ...query,
    tokenInfos: query.data,
  }
}
