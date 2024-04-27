import {Observable, Subscription} from 'rxjs'

import {AppCacheRecord} from '../app/cache'
import {AppObserverSubscribe} from '../app/observer-manager'
import {
  PortfolioEventBalanceManager,
  PortfolioEventSourceId,
  PortfolioEventTokenManager,
} from './event'
import {PortfolioTokenInfo} from './info'
import {PortfolioTokenId} from './token'
import {PortfolioPrimaryBreakdown, PortfolioTokenAmount} from './amount'

export type PortfolioManagerToken = Readonly<{
  hydrate(params: PortfolioEventSourceId): void
  sync(
    params: Readonly<{
      secondaryTokenIds: ReadonlyArray<PortfolioTokenId>
    }> &
      PortfolioEventSourceId,
  ): Promise<Map<PortfolioTokenId, AppCacheRecord<PortfolioTokenInfo> | null>>

  subscribe: AppObserverSubscribe<PortfolioEventTokenManager>
  unsubscribe(subscription: Subscription): void
  observable$: Observable<PortfolioEventTokenManager>

  destroy(): void
  clear(): void
}>

export type PortfolioManagerBalance = Readonly<{
  hydrate(): void
  refresh(): void

  updatePrimaryStated(
    params: Readonly<
      Pick<PortfolioPrimaryBreakdown, 'totalFromTxs' | 'lockedAsStorageCost'>
    >,
  ): void
  updatePrimaryDerived(
    params: Readonly<Pick<PortfolioPrimaryBreakdown, 'availableRewards'>>,
  ): void
  syncBalances(
    params: Readonly<{
      primaryStated: Readonly<
        Pick<PortfolioPrimaryBreakdown, 'totalFromTxs' | 'lockedAsStorageCost'>
      >
      secondaryBalances: Readonly<
        Map<PortfolioTokenId, Pick<PortfolioTokenAmount, 'quantity'>>
      >
    }>,
  ): void

  subscribe: AppObserverSubscribe<PortfolioEventBalanceManager>
  unsubscribe(subscription: Subscription): void
  observable$: Observable<PortfolioEventBalanceManager>

  getPrimaryBreakdown(): Readonly<PortfolioPrimaryBreakdown>
  getPrimaryBalance(): Readonly<PortfolioTokenAmount>
  getBalances(): Readonly<{
    all: ReadonlyArray<PortfolioTokenAmount>
    fts: ReadonlyArray<PortfolioTokenAmount>
    nfts: ReadonlyArray<PortfolioTokenAmount>
  }>

  destroy(): void
  clear(): void
}>
