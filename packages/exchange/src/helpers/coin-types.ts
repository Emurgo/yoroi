import {Exchange} from '@yoroi/types'

const supportedCoinTypes: Readonly<Exchange.Coin[]> = ['ADA'] as const

export function isCoinType(value: any): value is Exchange.Coin {
  return supportedCoinTypes.includes(value as Exchange.Coin)
}
