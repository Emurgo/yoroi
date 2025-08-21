import {isStringLiteral} from '@yoroi/common'
import {Exchange} from '@yoroi/types'

const supportedOrderTypes: Readonly<Exchange.OrderType[]> = [
  'buy',
  'sell',
] as const

export function isOrderType(value: unknown): value is Exchange.OrderType {
  return isStringLiteral(supportedOrderTypes, value)
}
