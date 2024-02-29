import {Portfolio} from '@yoroi/types'
import {z} from 'zod'

export const TokenSourceSchema = z.nativeEnum(Portfolio.Token.Source)

export const isTokenSource = (
  data: unknown,
): data is Portfolio.Token.Source => {
  return TokenSourceSchema.safeParse(data).success
}

export const parseTokenSource = (
  data: unknown,
): Portfolio.Token.Source | undefined => {
  return isTokenSource(data) ? data : undefined
}
