import {App, Balance} from '@yoroi/types'
import {Cardano, Observer} from '@yoroi/wallets'

import {RawUtxo} from '../types'

export type PortfolioManagerOptions = Readonly<{
  storage: PortfolioManagerStorage
  api: PortfolioManagerApi
}>

export type PortfolioManagerState = Readonly<{
  primary: Readonly<{
    fts: Readonly<Balance.Amounts>
    locked: Readonly<Balance.Amounts>
    tokens: Readonly<Balance.TokenRecords>
  }>
  secondary: Readonly<{
    fts: Readonly<Balance.Amounts>
    nfts: Readonly<Balance.Amounts>
    tokens: Readonly<Balance.TokenRecords>
  }>
  all: Readonly<{
    fts: Readonly<Balance.Amounts>
    nfts: Readonly<Balance.Amounts>
    tokens: Readonly<Balance.TokenRecords>
  }>
}>

export type PortfolioManager = Readonly<{
  getTokens(
    ids: ReadonlyArray<Balance.Token['info']['id']>,
    avoidCache?: boolean,
  ): Promise<Readonly<Balance.TokenRecords> | undefined>
  hydrate(): Promise<void>
  clear(): Promise<void>
  updatePortfolio(utxos: ReadonlyArray<RawUtxo>, primaryToken: Readonly<Balance.Token>): Promise<void>
  getPortfolio(): Readonly<PortfolioManagerState>
  subscribe: Observer<PortfolioManagerState>['subscribe']
  destroy: Observer<PortfolioManagerState>['destroy']
}>

export type PortfolioManagerApi = Readonly<{
  tokens(ids: Readonly<Array<Balance.Token['info']['id']>>): Promise<Readonly<Balance.TokenRecords>>
}>

export type PortfolioManagerStorage = Readonly<{
  tokens: App.MultiStorage<Balance.Token>
}>

export type CardanoToken = Balance.Token<Cardano.Api.FutureToken>
export type CardanoTokens = Balance.TokenRecords<Cardano.Api.FutureToken>
