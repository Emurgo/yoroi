import {invalid, isNonNullable} from '@yoroi/common'
import {Portfolio} from '@yoroi/types'
import React from 'react'
import {useQuery, useQueryClient} from 'react-query'
import {merge, switchMap} from 'rxjs'

import {time} from '../../../kernel/constants'
import {queryInfo} from '../../../kernel/query-client'
import {useSelectedNetwork} from '../../WalletManager/common/hooks/useSelectedNetwork'
import {useWalletManager} from '../../WalletManager/context/WalletManagerProvider'

const queryKey = [queryInfo.keyToPersist, 'portfolioTokenActivity']
const useTokenActivity = () => {
  const {walletManager} = useWalletManager()
  const {
    networkManager: {tokenManager},
  } = useSelectedNetwork()
  const [aggregatedBalances, setAggregatedBalances] = React.useState<Portfolio.Token.AmountRecords>()
  const [tokenIds, setTokenIds] = React.useState<Portfolio.Token.Id[]>()
  const queryClient = useQueryClient()

  React.useEffect(() => {
    /**
     * Subscription when:
     * 1. balance inside any wallet changes
     * 2. wallets change (new wallet, wallet removed)
     */
    const subscription = merge(
      walletManager.walletMetas$.pipe(
        switchMap((metaMap) => {
          const wallets = Array.from(metaMap.keys())
            .map((id) => walletManager.getWalletById(id))
            .filter(isNonNullable)

          return merge(...wallets.map((wallet) => wallet.balance$))
        }),
      ),
      walletManager.walletMetas$,
    ).subscribe(() => {
      const aggregatedBalances = Array.from(walletManager.walletMetas.values())
        .map((meta) => walletManager.getWalletById(meta.id))
        .filter(isNonNullable)
        .reduce((amounts: Portfolio.Token.AmountRecords, wallet) => {
          for (const balance of wallet.balances.records.values()) {
            if (amounts[balance.info.id] != null) {
              amounts[balance.info.id].quantity += balance.quantity
            } else {
              amounts[balance.info.id] = {...balance}
            }
          }
          return amounts
        }, {})

      setAggregatedBalances(aggregatedBalances)
      setTokenIds(Object.keys(aggregatedBalances) as Portfolio.Token.Id[])

      queryClient.invalidateQueries({queryKey})
    })

    return () => subscription.unsubscribe()
  }, [queryClient, walletManager])

  const query = useQuery({
    enabled: tokenIds != null && tokenIds.length > 0,
    staleTime: time.oneMinute,
    cacheTime: time.fiveMinutes,
    retryDelay: time.oneSecond,
    optimisticResults: true,
    refetchInterval: time.oneMinute,
    queryKey,
    queryFn: async () => {
      if (tokenIds == null || tokenIds.length === 0) return

      const response = await tokenManager.api.tokenActivityUpdates(tokenIds)
      if (response.tag === 'left') throw response.error
      return response.value.data
    },
  })

  const tokenActivity = query.data

  return {aggregatedBalances, tokenActivity}
}

const PortfolioTokenActivityContext = React.createContext<undefined | PortfolioTokenActivityContext>(undefined)

type Props = {
  children: React.ReactNode
}

export const PortfolioTokenActivityProvider = ({children}: Props) => {
  const value = useTokenActivity()
  return <PortfolioTokenActivityContext.Provider value={value}>{children}</PortfolioTokenActivityContext.Provider>
}

export const usePortfolioTokenActivity = () =>
  React.useContext(PortfolioTokenActivityContext) ??
  invalid('usePortfolioTokenActiviy requires PortfolioTokenActivitiyProvider')

type PortfolioTokenActivityContext = {
  aggregatedBalances?: Portfolio.Token.AmountRecords
  tokenActivity?: Portfolio.Api.TokenActivityResponse
}
