export type BanxaOrderType = 'buy' | 'sell'

const supportedOrderTypes: Readonly<BanxaOrderType[]> = ['buy', 'sell'] as const

export function banxaIsOrderType(value: any): value is BanxaOrderType {
  return supportedOrderTypes.includes(value as BanxaOrderType)
}
