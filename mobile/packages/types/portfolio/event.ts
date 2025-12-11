import {PortfolioTokenId} from './token'

export type PortfolioEventSourceId = Readonly<{
  sourceId: string
}>

export const PortfolioEventManagerOn = {
  Sync: 'sync',
  Hydrate: 'hydrate',
  Refresh: 'refresh',
  Clear: 'clear',
} as const

export type PortfolioEventManagerOn =
  (typeof PortfolioEventManagerOn)[keyof typeof PortfolioEventManagerOn]

export type PortfolioEventTokenManagerSync = PortfolioEventSourceId &
  Readonly<{
    on: typeof PortfolioEventManagerOn.Sync
    ids: ReadonlyArray<PortfolioTokenId>
  }>

export type PortfolioEventTokenManagerHydrate = PortfolioEventSourceId &
  Readonly<{
    on: typeof PortfolioEventManagerOn.Hydrate
  }>

export type PortfolioEventTokenManagerClear = PortfolioEventSourceId &
  Readonly<{
    on: typeof PortfolioEventManagerOn.Clear
  }>

export type PortfolioEventTokenManager =
  | PortfolioEventTokenManagerSync
  | PortfolioEventTokenManagerHydrate
  | PortfolioEventTokenManagerClear

export type PortfolioEventBalanceManagerSync = PortfolioEventSourceId &
  Readonly<{
    on: typeof PortfolioEventManagerOn.Sync
    mode: 'all' | 'primary-derived' | 'primary-stated'
  }>

export type PortfolioEventBalanceManagerHydrate = PortfolioEventSourceId &
  Readonly<{
    on: typeof PortfolioEventManagerOn.Hydrate
  }>

export type PortfolioEventBalanceManagerRefresh = PortfolioEventSourceId &
  Readonly<{
    on: typeof PortfolioEventManagerOn.Refresh
  }>

export type PortfolioEventBalanceManagerClear = PortfolioEventSourceId &
  Readonly<{
    on: typeof PortfolioEventManagerOn.Clear
  }>

export type PortfolioEventBalanceManager =
  | PortfolioEventBalanceManagerSync
  | PortfolioEventBalanceManagerHydrate
  | PortfolioEventBalanceManagerRefresh
  | PortfolioEventBalanceManagerClear
