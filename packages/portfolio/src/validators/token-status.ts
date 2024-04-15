import {createTypeGuardFromSchema} from '@yoroi/common'
import {Portfolio} from '@yoroi/types'
import {z} from 'zod'

export const TokenStatusSchema = z.nativeEnum(Portfolio.Token.Status)

export const isTokenStatus = createTypeGuardFromSchema(TokenStatusSchema)

export const parseTokenStatus = (
  data: unknown,
): Portfolio.Token.Status | undefined => {
  return isTokenStatus(data) ? data : undefined
}
