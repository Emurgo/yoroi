import {Chain} from '@yoroi/types'
import {freeze} from 'immer'

import {isDev} from './env'
import {LoggerLevel} from './logger/types'

export const governaceAfterBlock = freeze({
  [Chain.Network.Sancho]: 0,

  // TODO: Add block number once known
  [Chain.Network.Mainnet]: Infinity,
  [Chain.Network.Preprod]: Infinity,
})

export const agreementDate = 1691967600000

export const loggerLevel: LoggerLevel = isDev ? LoggerLevel.Debug : LoggerLevel.Warn
