import {App, Chain} from '@yoroi/types'
import {freeze} from 'immer'

import {isDev} from './env'

export const governaceAfterBlock = freeze({
  [Chain.Network.Sancho]: 0,

  // TODO: Add block number once known
  [Chain.Network.Mainnet]: Infinity,
  [Chain.Network.Preprod]: Infinity,
  [Chain.Network.Preview]: Infinity,
})

export const agreementDate = 1691967600000

export const loggerLevel: App.Logger.Level = isDev ? App.Logger.Level.Debug : App.Logger.Level.Warn
