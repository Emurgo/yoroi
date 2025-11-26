import {createUnknownTokenInfo, isPrimaryToken} from '@yoroi/portfolio'
import {Portfolio} from '@yoroi/types'

import {
  UseQueryOptions,
  UseSuspenseQueryOptions,
  useQuery,
  useSuspenseQuery,
} from '@tanstack/react-query'

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
  options: Omit<
    UseQueryOptions<Map<Portfolio.Token.Id, Portfolio.Token.Info>, Error>,
    'queryKey' | 'queryFn'
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
      const result = new Map<Portfolio.Token.Id, Portfolio.Token.Info>([
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

export const usePortfolioTokenInfosSuspense = (
  {
    wallet,
    tokenIds,
    sourceId = 'useTokenInfos',
  }: {
    wallet: YoroiWallet
    tokenIds: ReadonlyArray<Portfolio.Token.Id>
    sourceId?: string
  },
  options?: UseSuspenseQueryOptions<
    Map<Portfolio.Token.Id, Portfolio.Token.Info>,
    Error,
    Map<Portfolio.Token.Id, Portfolio.Token.Info>,
    [string, string, ReadonlyArray<Portfolio.Token.Id>]
  >,
) => {
  const query = useSuspenseQuery({
    queryKey: [wallet.networkManager.network, sourceId, tokenIds],
    ...options,
    queryFn: async () => {
      const secondaryTokenIds = tokenIds.filter((id) => !isPrimaryToken(id))
      const response = await wallet.networkManager.tokenManager.sync({
        secondaryTokenIds,
        sourceId,
      })
      const result = new Map<Portfolio.Token.Id, Portfolio.Token.Info>([
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
