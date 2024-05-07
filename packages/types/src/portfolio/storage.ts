import {AppCacheRecord} from '../app/cache'
import {PortfolioPrimaryBreakdown, PortfolioTokenAmount} from './amount'
import {PortfolioTokenInfo} from './info'
import {PortfolioTokenId} from './token'

export type PortfolioStorageBalance = Readonly<{
  primaryBreakdown: {
    save: (breakdown: Readonly<PortfolioPrimaryBreakdown>) => void
    read: () => Readonly<PortfolioPrimaryBreakdown> | null
    clear: () => void
  }
  balances: {
    save: (
      entries: ReadonlyArray<[PortfolioTokenId, PortfolioTokenAmount]>,
    ) => void
    read: (
      keys: ReadonlyArray<PortfolioTokenId>,
    ) => ReadonlyArray<[PortfolioTokenId, PortfolioTokenAmount | null]>
    all: () => ReadonlyArray<[PortfolioTokenId, PortfolioTokenAmount | null]>
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
  }
  clear: () => void
}>
