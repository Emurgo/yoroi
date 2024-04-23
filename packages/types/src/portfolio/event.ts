import {PortfolioTokenId} from './token'

export type PortfolioEventSourceId = Readonly<{
  sourceId: string
}>

export enum PortfolioEventManagerOn {
  Sync = 'sync',
  Hydrate = 'hydrate',
  Refresh = 'refresh',
}

export type PortfolioEventTokenManager =
  | PortfolioEventTokenManagerSync
  | PortfolioEventTokenManagerHydrate

export type PortfolioEventTokenManagerSync = PortfolioEventSourceId &
  Readonly<{
    on: PortfolioEventManagerOn.Sync
    ids: ReadonlyArray<PortfolioTokenId>
  }>

export type PortfolioEventTokenManagerHydrate = PortfolioEventSourceId &
  Readonly<{
    on: PortfolioEventManagerOn.Hydrate
  }>

export type PortfolioEventBalanceManager =
  | PortfolioEventBalanceManagerSync
  | PortfolioEventBalanceManagerHydrate
  | PortfolioEventBalanceManagerRefresh

export type PortfolioEventBalanceManagerSync = PortfolioEventSourceId &
  Readonly<{
    on: PortfolioEventManagerOn.Sync
    mode: 'all' | 'primary-derived' | 'primary-stated'
  }>

export type PortfolioEventBalanceManagerHydrate = PortfolioEventSourceId &
  Readonly<{
    on: PortfolioEventManagerOn.Hydrate
  }>

export type PortfolioEventBalanceManagerRefresh = PortfolioEventSourceId &
  Readonly<{
    on: PortfolioEventManagerOn.Refresh
  }>
