import {AppCacheRecord} from '../app/cache'
import {
  PortfolioBalancePrimaryBreakdown,
  PortfolioTokenBalance,
} from './balance'
import {PortfolioTokenDiscovery} from './discovery'
import {PortfolioTokenInfo} from './info'
import {PortfolioTokenId} from './token'

export type PortfolioStorageBalance = Readonly<{
  primaryBalanceBreakdown: {
    save: (entry: PortfolioBalancePrimaryBreakdown) => void
    read: (key: PortfolioTokenId) => PortfolioBalancePrimaryBreakdown | null
    clear: () => void
  }
  balances: {
    save: (
      entries: ReadonlyArray<[PortfolioTokenId, PortfolioTokenBalance]>,
    ) => void
    read: (
      keys: ReadonlyArray<PortfolioTokenId>,
    ) => ReadonlyArray<[PortfolioTokenId, PortfolioTokenBalance | null]>
    all: () => ReadonlyArray<[PortfolioTokenId, PortfolioTokenBalance | null]>
    keys: () => ReadonlyArray<PortfolioTokenId>
    clear: () => void
  }
  clear: () => void
}>

export type PortfolioStorageToken = Readonly<{
  token: {
    infos: {
      save: (
        entries: ReadonlyArray<
          [PortfolioTokenId, AppCacheRecord<PortfolioTokenInfo>]
        >,
      ) => void
      read: (
        keys: ReadonlyArray<PortfolioTokenId>,
      ) => ReadonlyArray<
        [PortfolioTokenId, AppCacheRecord<PortfolioTokenInfo> | null]
      >
      all: () => ReadonlyArray<
        [PortfolioTokenId, AppCacheRecord<PortfolioTokenInfo> | null]
      >
      keys: () => ReadonlyArray<PortfolioTokenId>
      clear: () => void
    }
    discoveries: {
      save: (
        entries: ReadonlyArray<
          [PortfolioTokenId, AppCacheRecord<PortfolioTokenDiscovery>]
        >,
      ) => void
      read: (
        keys: ReadonlyArray<PortfolioTokenId>,
      ) => ReadonlyArray<
        [PortfolioTokenId, AppCacheRecord<PortfolioTokenDiscovery> | null]
      >
      all: () => ReadonlyArray<
        [PortfolioTokenId, AppCacheRecord<PortfolioTokenDiscovery> | null]
      >
      keys: () => ReadonlyArray<PortfolioTokenId>
      clear: () => void
    }
  }
  clear: () => void
}>
