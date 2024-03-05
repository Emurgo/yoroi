import {Exchange} from '@yoroi/types'

const supportedFiatTypes: Readonly<Exchange.Fiat[]> = ['USD', 'EUR'] as const

export function isFiatType(value: any): value is Exchange.Fiat {
  return supportedFiatTypes.includes(value as Exchange.Fiat)
}
