import {isStringLiteral} from '@yoroi/common'
import {Exchange} from '@yoroi/types'

const supportedCoinTypes: Readonly<Exchange.Coin[]> = ['ADA'] as const

export function isCoinType(value: unknown): value is Exchange.Coin {
  return isStringLiteral(supportedCoinTypes, value)
}
