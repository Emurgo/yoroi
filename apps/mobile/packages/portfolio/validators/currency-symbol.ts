import {Portfolio} from '@yoroi/types'

import {z} from 'zod'

export const CurrencySymbolSchema = z.union([
  z.literal('ADA'),
  z.literal('BRL'),
  z.literal('BTC'),
  z.literal('CNY'),
  z.literal('ETH'),
  z.literal('EUR'),
  z.literal('JPY'),
  z.literal('KRW'),
  z.literal('USD'),
])

export const isCurrencySymbol = (
  data: unknown,
): data is Portfolio.Currency.Symbol =>
  CurrencySymbolSchema.safeParse(data).success

export const parseCurrencySymbol = (
  data: unknown,
): Portfolio.Currency.Symbol | undefined => {
  return isCurrencySymbol(data) ? data : undefined
}
