import {createTypeGuardFromSchema} from '@yoroi/common'
import {Portfolio} from '@yoroi/types'
import {z} from 'zod'

export const TokenSourceSchema = z.nativeEnum(Portfolio.Token.Source)

export const isTokenSource = createTypeGuardFromSchema(TokenSourceSchema)

export const parseTokenSource = (
  data: unknown,
): Portfolio.Token.Source | undefined => {
  return isTokenSource(data) ? data : undefined
}
