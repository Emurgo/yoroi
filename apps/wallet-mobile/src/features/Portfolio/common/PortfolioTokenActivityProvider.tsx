import {invalid, isNonNullable} from '@yoroi/common'
import {isPrimaryToken} from '@yoroi/portfolio'
import {Portfolio} from '@yoroi/types'
import {freeze, produce} from 'immer'
import React from 'react'
import {useQuery, useQueryClient} from '@tanstack/react-query'
import {merge, switchMap} from 'rxjs'

import {time} from '../../../kernel/constants'
import {logger} from '../../../kernel/logger/logger'
import {queryInfo} from '../../../kernel/query-client'
import {useSelectedNetwork} from '../../WalletManager/common/hooks/useSelectedNetwork'
import {useWalletManager} from '../../WalletManager/context/WalletManagerProvider'

const queryKey = [queryInfo.keyToPersist, 'portfolioTokenActivity']
const defaultPortfolioTokenActivityState: PortfolioTokenActivityState = freeze(
  {
    secondaryTokenIds: [],
    aggregatedBalances: {},
    tokenActivity: {},
    activityWindow: Portfolio.Token.ActivityWindow.OneDay,
    isLoading: false,
  },
  true,
)
const PortfolioTokenActivityContext = React.createContext<PortfolioTokenActivityState>({
  ...defaultPortfolioTokenActivityState,
})

type Props = {
  children: React.ReactNode
}

export const PortfolioTokenActivityProvider = ({children}: Props) => {
  const {walletManager} = useWalletManager()
  const {
    networkManager: {tokenManager},
  } = useSelectedNetwork()
  const queryClient = useQueryClient()
  const [state, dispatch] = React.useReducer(portfolioTokenActivityReducer, defaultPortfolioTokenActivityState)

  const actions = React.useRef<PortfolioTokenActivityActions>({
    aggregatedBalancesChanged: (aggregatedBalances) => {
      dispatch({
        type: PortfolioTokenActivityActionType.AggregatedBalancesChanged,
        aggregatedBalances,
      })
    },
    secondaryTokenIdsChanged: (secondaryTokenIds) => {
      dispatch({
        type: PortfolioTokenActivityActionType.SecondaryTokenIdsChanged,
        secondaryTokenIds,
      })
    },
    tokenActivityChanged: (tokenActivity) => {
      dispatch({
        type: PortfolioTokenActivityActionType.TokenActivityChanged,
        tokenActivity,
      })
    },
    activityWindowChanged: (activityWindow) => {
      dispatch({
        type: PortfolioTokenActivityActionType.ActivityWindowChanged,
        activityWindow,
      })
    },
  }).current

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

      actions.aggregatedBalancesChanged(aggregatedBalances)
      actions.secondaryTokenIdsChanged(
        Object.keys(aggregatedBalances).filter((id) => !isPrimaryToken(id)) as Portfolio.Token.Id[],
      )

      queryClient.invalidateQueries([queryKey])
    })

    return () => subscription.unsubscribe()
  }, [actions, queryClient, walletManager])

  const query = useQuery({
    enabled: state.secondaryTokenIds.length > 0,
    staleTime: time.oneMinute,
    cacheTime: time.fiveMinutes,
    retryDelay: time.oneSecond,
    optimisticResults: true,
    refetchInterval: time.oneMinute,
    queryKey,
    queryFn: async () => {
      if (state.secondaryTokenIds == null || state.secondaryTokenIds.length === 0) return

      const response = await tokenManager.api.tokenActivity(state.secondaryTokenIds, state.activityWindow)

      if (response.tag === 'left') {
        logger.error(JSON.stringify({endpoint: 'tokenActivity', ...response.error}))
        return null
      }
      return response.value.data
    },
  })

  React.useEffect(() => {
    if (query.data == null) return

    actions.tokenActivityChanged(query.data)
  }, [actions, query.data])

  const value = React.useMemo(() => ({...state, isLoading: query.isLoading}), [query.isLoading, state])

  return <PortfolioTokenActivityContext.Provider value={value}>{children}</PortfolioTokenActivityContext.Provider>
}

export const usePortfolioTokenActivity = () =>
  React.useContext(PortfolioTokenActivityContext) ??
  invalid('usePortfolioTokenActiviy requires PortfolioTokenActivitiyProvider')

type PortfolioTokenActivityState = Readonly<{
  secondaryTokenIds: Portfolio.Token.Id[]
  aggregatedBalances: Portfolio.Token.AmountRecords
  tokenActivity: Portfolio.Api.TokenActivityResponse
  activityWindow: Portfolio.Token.ActivityWindow
  isLoading: boolean
}>

enum PortfolioTokenActivityActionType {
  AggregatedBalancesChanged = 'AggregatedBalancesChanged',
  SecondaryTokenIdsChanged = 'SecondaryTokenIdsChanged',
  TokenActivityChanged = 'TokenActivityChanged',
  ActivityWindowChanged = 'ActivityWindowChanged',
}

type PortfolioTokenActivityAction =
  | {
      type: PortfolioTokenActivityActionType.AggregatedBalancesChanged
      aggregatedBalances: Portfolio.Token.AmountRecords
    }
  | {
      type: PortfolioTokenActivityActionType.SecondaryTokenIdsChanged
      secondaryTokenIds: Portfolio.Token.Id[]
    }
  | {
      type: PortfolioTokenActivityActionType.TokenActivityChanged
      tokenActivity: Portfolio.Api.TokenActivityResponse
    }
  | {
      type: PortfolioTokenActivityActionType.ActivityWindowChanged
      activityWindow: Portfolio.Token.ActivityWindow
    }

const portfolioTokenActivityReducer = (
  state: PortfolioTokenActivityState,
  action: PortfolioTokenActivityAction,
): PortfolioTokenActivityState => {
  return produce(state, (draft) => {
    switch (action.type) {
      case PortfolioTokenActivityActionType.AggregatedBalancesChanged:
        draft.aggregatedBalances = action.aggregatedBalances
        break
      case PortfolioTokenActivityActionType.SecondaryTokenIdsChanged:
        draft.secondaryTokenIds = action.secondaryTokenIds
        break
      case PortfolioTokenActivityActionType.TokenActivityChanged:
        draft.tokenActivity = action.tokenActivity
        break
      case PortfolioTokenActivityActionType.ActivityWindowChanged:
        draft.activityWindow = action.activityWindow
        break
    }
  })
}

type PortfolioTokenActivityActions = Readonly<{
  aggregatedBalancesChanged: (aggregatedBalances: Portfolio.Token.AmountRecords) => void
  secondaryTokenIdsChanged: (secondaryTokenIds: Portfolio.Token.Id[]) => void
  tokenActivityChanged: (tokenActivity: Portfolio.Api.TokenActivityResponse) => void
  activityWindowChanged: (activityWindow: Portfolio.Token.ActivityWindow) => void
}>
