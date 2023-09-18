import {App, Portfolio} from '@yoroi/types'
import {Cardano, Observer} from '@yoroi/wallets'

import {RawUtxo} from '../types'

export type PortfolioManagerOptions = Readonly<{
  storage: PortfolioManagerStorage
  api: PortfolioManagerApi
}>

export type PortfolioManagerState = Readonly<{
  primary: Readonly<{
    fts: Readonly<Portfolio.Amounts>
    locked: Readonly<Portfolio.Amounts>
    tokens: Readonly<Portfolio.TokenRecords>
  }>
  secondary: Readonly<{
    fts: Readonly<Portfolio.Amounts>
    nfts: Readonly<Portfolio.Amounts>
    tokens: Readonly<Portfolio.TokenRecords>
  }>
}>

export type PortfolioManager = Readonly<{
  getTokens(
    ids: ReadonlyArray<Portfolio.Token['info']['id']>,
    avoidCache?: boolean,
  ): Promise<Readonly<Portfolio.TokenRecords> | undefined>
  hydrate(): Promise<void>
  clear(): Promise<void>
  updatePortfolio(utxos: ReadonlyArray<RawUtxo>, primaryToken: Readonly<Portfolio.Token>): Promise<void>
  getPortfolio(): Readonly<PortfolioManagerState>
  subscribe: Observer<PortfolioManagerState>['subscribe']
  destroy: Observer<PortfolioManagerState>['destroy']
}>

export type PortfolioManagerApi = Readonly<{
  tokens(ids: Readonly<Array<Portfolio.Token['info']['id']>>): Promise<Readonly<Portfolio.TokenRecords>>
}>

export type PortfolioManagerStorage = Readonly<{
  tokens: App.MultiStorage<Portfolio.Token>
}>

export type CardanoToken = Portfolio.Token<Cardano.Api.FutureToken>
export type CardanoTokens = Portfolio.TokenRecords<Cardano.Api.FutureToken>
