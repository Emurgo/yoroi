import {Portfolio} from '@yoroi/types'
import {z} from 'zod'

import {TokenInfoSchema} from './token-info'

export const TokenAmountSchema = z.object({
  info: TokenInfoSchema,
  quantity: z.bigint(),
})

export const isTokenAmount = (
  data: unknown,
): data is Portfolio.Token.Amount => {
  return TokenAmountSchema.safeParse(data).success
}

export const parseTokenAmount = (
  data: unknown,
): Portfolio.Token.Amount | undefined => {
  return isTokenAmount(data) ? data : undefined
}
