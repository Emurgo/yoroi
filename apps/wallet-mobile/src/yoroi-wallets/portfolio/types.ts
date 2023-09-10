import {App, Balance} from '@yoroi/types'
import {Cardano} from '@yoroi/wallets'

export type PortfolioManagerOptions = Readonly<{
  storage: PortfolioManagerStorage
  api: PortfolioManagerApi
}>

export type PortfolioManagerApi = Readonly<{
  tokens(ids: Readonly<Array<Balance.Token['info']['id']>>): Promise<Readonly<Balance.TokenRecords>>
}>

export type PortfolioManagerStorage = Readonly<{
  tokens: App.MultiStorage<Balance.Token>
}>

export type CardanoToken = Balance.Token<Cardano.Api.FutureToken>
export type CardanoTokens = Balance.TokenRecords<Cardano.Api.FutureToken>
