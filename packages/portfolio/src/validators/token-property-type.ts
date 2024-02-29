import {Portfolio} from '@yoroi/types'
import {z} from 'zod'

export const TokenPropertyTypeSchema = z.nativeEnum(
  Portfolio.Token.PropertyType,
)

export const isTokenPropertyType = (
  data: unknown,
): data is Portfolio.Token.PropertyType => {
  return TokenPropertyTypeSchema.safeParse(data).success
}

export const parseTokenPropertyType = (
  data: unknown,
): Portfolio.Token.PropertyType | undefined => {
  return isTokenPropertyType(data) ? data : undefined
}
