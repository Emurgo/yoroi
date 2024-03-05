import {Exchange} from '@yoroi/types'

const supportedOrderTypes: Readonly<Exchange.OrderType[]> = [
  'buy',
  'sell',
] as const

export function isOrderType(value: any): value is Exchange.OrderType {
  return supportedOrderTypes.includes(value as Exchange.OrderType)
}
