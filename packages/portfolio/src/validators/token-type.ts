import {Portfolio} from '@yoroi/types'
import {z} from 'zod'

export const TokenTypeSchema = z.nativeEnum(Portfolio.Token.Type)

export const isTokenType = (data: unknown): data is Portfolio.Token.Type => {
  return TokenTypeSchema.safeParse(data).success
}

export const parseTokenType = (
  data: unknown,
): Portfolio.Token.Type | undefined => {
  return isTokenType(data) ? data : undefined
}
