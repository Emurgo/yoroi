import {App, Balance} from '@yoroi/types'
import {Cardano} from '@yoroi/wallets'

export type BalanceTokenManagerOptions = Readonly<{
  storage: BalanceStorage
  api: BalanceTokenApi
}>

export type BalanceTokenApi = Readonly<{
  tokens(ids: Readonly<Array<Balance.Token['info']['id']>>): Promise<Readonly<Balance.TokenRecords>>
}>

export type BalanceStorage = Readonly<{
  tokens: App.MultiStorage<Balance.Token>
}>

export type CardanoToken = Balance.Token<Cardano.Api.FutureToken>
export type CardanoTokens = Balance.TokenRecords<Cardano.Api.FutureToken>
