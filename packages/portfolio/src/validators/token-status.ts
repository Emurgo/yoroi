import {Portfolio} from '@yoroi/types'
import {z} from 'zod'

export const TokenStatusSchema = z.nativeEnum(Portfolio.Token.Status)

export const isTokenStatus = (
  data: unknown,
): data is Portfolio.Token.Status => {
  return TokenStatusSchema.safeParse(data).success
}

export const parseTokenStatus = (
  data: unknown,
): Portfolio.Token.Status | undefined => {
  return isTokenStatus(data) ? data : undefined
}
