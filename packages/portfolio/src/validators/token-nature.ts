import {createTypeGuardFromSchema} from '@yoroi/common'
import {Portfolio} from '@yoroi/types'
import {z} from 'zod'

export const TokenNatureSchema = z.nativeEnum(Portfolio.Token.Nature)

export const isTokenNature = createTypeGuardFromSchema(TokenNatureSchema)

export const parseTokenNature = (
  data: unknown,
): Portfolio.Token.Nature | undefined => {
  return isTokenNature(data) ? data : undefined
}
