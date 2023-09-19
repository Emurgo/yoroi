import {App, Portfolio} from '@yoroi/types'
import {Cardano, Observer} from '@yoroi/wallets'

import {RawUtxo} from '../types'

// @yoroi/types | @yoroi/portfolio
export type PortfolioManagerOptions<T extends Portfolio.Token> = Readonly<{
  storage: PortfolioManagerStorage<T>
  api: PortfolioManagerApi<T>
}>

export type PortfolioManagerState<T extends Portfolio.Token> = Readonly<{
  primary: Readonly<{
    locks: Readonly<Portfolio.TokenBalanceRecords<T>>
    balances: Readonly<Portfolio.TokenBalanceRecords<T>>
  }>
  secondary: Readonly<{
    balances: Readonly<Portfolio.TokenBalanceRecords<T>>
  }>
}>

export type PortfolioManager<T extends Portfolio.Token> = Readonly<{
  getTokens(
    ids: ReadonlyArray<Portfolio.TokenInfo['id']>,
    avoidCache?: boolean,
  ): Promise<Portfolio.TokenRecords<T> | undefined>
  hydrate(): Promise<void>
  clear(): Promise<void>
  updatePortfolio(utxos: ReadonlyArray<RawUtxo>, primaryToken: T): Promise<void>
  getPortfolio(): PortfolioManagerState<T>
  subscribe: Observer<PortfolioManagerState<T>>['subscribe']
  destroy: Observer<PortfolioManagerState<T>>['destroy']
}>

export type PortfolioManagerApi<T extends Portfolio.Token> = Readonly<{
  tokens(ids: ReadonlyArray<Portfolio.TokenInfo['id']>): Promise<Portfolio.TokenRecords<T>>
}>

export type PortfolioManagerStorage<T extends Portfolio.Token> = Readonly<{
  tokens: App.MultiStorage<T>
}>

// @yoroi/wallets
export type CardanoToken = Portfolio.Token<Cardano.Api.FutureToken>
