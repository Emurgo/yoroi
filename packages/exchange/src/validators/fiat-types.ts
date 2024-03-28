import {isStringLiteral} from '@yoroi/common'
import {Exchange} from '@yoroi/types'

const supportedFiatTypes: Readonly<Exchange.Fiat[]> = ['USD', 'EUR'] as const

export function isFiatType(value: unknown): value is Exchange.Fiat {
  return isStringLiteral(supportedFiatTypes, value)
}
