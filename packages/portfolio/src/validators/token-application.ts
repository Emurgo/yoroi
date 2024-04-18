import {createTypeGuardFromSchema} from '@yoroi/common'
import {Portfolio} from '@yoroi/types'
import {z} from 'zod'

export const TokenApplicationSchema = z.nativeEnum(Portfolio.Token.Application)

export const isTokenApplicaton = createTypeGuardFromSchema(
  TokenApplicationSchema,
)

export const parseTokenApplication = (
  data: unknown,
): Portfolio.Token.Application | undefined => {
  return isTokenApplicaton(data) ? data : undefined
}
