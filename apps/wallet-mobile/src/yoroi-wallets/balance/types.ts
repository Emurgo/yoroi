import {App, Balance} from '@yoroi/types'

export type BalanceTokenManagerOptions = Readonly<{
  storage: BalanceStorage
  api: BalanceTokenApi
}>

export type BalanceTokenApi = Readonly<{
  tokens(ids: Readonly<Array<Balance.Token['info']['id']>>): Promise<ReadonlyArray<Balance.Token>>
}>

export type BalanceStorage = Readonly<{
  tokens: App.MultiStorage<Balance.Token>
}>
