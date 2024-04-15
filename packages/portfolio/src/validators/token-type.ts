import {createTypeGuardFromSchema} from '@yoroi/common'
import {Portfolio} from '@yoroi/types'
import {z} from 'zod'

export const TokenTypeSchema = z.nativeEnum(Portfolio.Token.Type)

export const isTokenType = createTypeGuardFromSchema(TokenTypeSchema)

export const parseTokenType = (
  data: unknown,
): Portfolio.Token.Type | undefined => {
  return isTokenType(data) ? data : undefined
}
