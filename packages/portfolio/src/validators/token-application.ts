import {Portfolio} from '@yoroi/types'
import {z} from 'zod'

export const TokenApplicationSchema = z.nativeEnum(Portfolio.Token.Application)

export const isTokenApplicaton = (
  data: unknown,
): data is Portfolio.Token.Application => {
  return TokenApplicationSchema.safeParse(data).success
}

export const parseTokenApplication = (
  data: unknown,
): Portfolio.Token.Application | undefined => {
  return isTokenApplicaton(data) ? data : undefined
}
