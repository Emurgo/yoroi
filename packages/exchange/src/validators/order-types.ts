import {Exchange} from '@yoroi/types'
import {isStringLiteral} from '@yoroi/common'

const supportedOrderTypes: Readonly<Exchange.OrderType[]> = [
  'buy',
  'sell',
] as const

export function isOrderType(value: unknown): value is Exchange.OrderType {
  return isStringLiteral(supportedOrderTypes, value)
}
