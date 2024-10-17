import {App, Chain} from '@yoroi/types'
import {freeze} from 'immer'

import {isDev} from './env'

export const governaceAfterBlock = freeze({
  [Chain.Network.Mainnet]: 10782931,
  [Chain.Network.Preprod]: 2639667,
  [Chain.Network.Preview]: Infinity,
})

export const agreementDate = 1691967600000

export const loggerLevel: App.Logger.Level = isDev ? App.Logger.Level.Debug : App.Logger.Level.Warn
