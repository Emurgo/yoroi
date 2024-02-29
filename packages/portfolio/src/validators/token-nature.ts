import {Portfolio} from '@yoroi/types'
import {z} from 'zod'

export const TokenNatureSchema = z.nativeEnum(Portfolio.Token.Nature)

export const isTokenNature = (
  data: unknown,
): data is Portfolio.Token.Nature => {
  return TokenNatureSchema.safeParse(data).success
}

export const parseTokenNature = (
  data: unknown,
): Portfolio.Token.Nature | undefined => {
  return isTokenNature(data) ? data : undefined
}
