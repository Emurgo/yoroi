import {createTypeGuardFromSchema} from '@yoroi/common'
import {Portfolio} from '@yoroi/types'
import {z} from 'zod'

export const TokenPropertyTypeSchema = z.nativeEnum(
  Portfolio.Token.PropertyType,
)

export const isTokenPropertyType = createTypeGuardFromSchema(
  TokenPropertyTypeSchema,
)

export const parseTokenPropertyType = (
  data: unknown,
): Portfolio.Token.PropertyType | undefined => {
  return isTokenPropertyType(data) ? data : undefined
}
