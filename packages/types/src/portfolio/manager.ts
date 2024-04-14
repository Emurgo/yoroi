import {Observable, Subscription} from 'rxjs'

import {AppCacheRecord} from '../app/cache'
import {AppObserverSubscribe} from '../app/observer-manager'
import {
  PortfolioBalancePrimaryBreakdown,
  PortfolioTokenBalance,
} from './balance'
import {
  PortfolioEventBalanceManager,
  PortfolioEventSourceId,
  PortfolioEventTokenManager,
} from './event'
import {PortfolioTokenInfo} from './info'
import {PortfolioTokenId} from './token'

export type PortfolioManagerToken = Readonly<{
  hydrate: (params: PortfolioEventSourceId) => void
  sync: (
    params: Readonly<{
      secondaryTokenIds: ReadonlyArray<PortfolioTokenId>
    }> &
      PortfolioEventSourceId,
  ) => Promise<Map<PortfolioTokenId, AppCacheRecord<PortfolioTokenInfo> | null>>

  subscribe: AppObserverSubscribe<PortfolioEventTokenManager>
  unsubscribe: (sub: Subscription) => void
  observable: Observable<PortfolioEventTokenManager>

  destroy: () => void
}>

export type PortfolioManagerBalance = Readonly<{
  hydrate: () => void
  refresh: () => void
  sync: (
    params: Readonly<{
      primaryBalance: Readonly<Omit<PortfolioBalancePrimaryBreakdown, 'info'>>
      secondaryBalances: Readonly<
        | Map<PortfolioTokenId, Omit<PortfolioTokenBalance, 'info'>>
        | Map<PortfolioTokenId, PortfolioTokenBalance>
      >
    }>,
  ) => void

  subscribe: AppObserverSubscribe<PortfolioEventBalanceManager>
  unsubscribe: (sub: Subscription) => void
  observable: Observable<PortfolioEventBalanceManager>

  getPrimaryBreakdown: () => Readonly<PortfolioBalancePrimaryBreakdown>
  getBalances: () => Readonly<{
    all: ReadonlyArray<PortfolioTokenBalance>
    fts: ReadonlyArray<PortfolioTokenBalance>
    nfts: ReadonlyArray<PortfolioTokenBalance>
  }>
  destroy: () => void
}>
