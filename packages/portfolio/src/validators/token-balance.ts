import {Portfolio} from '@yoroi/types'
import {z} from 'zod'

import {TokenInfoSchema} from './token-info'

export const TokenBalanceSchema = z.object({
  info: TokenInfoSchema,
  balance: z.bigint(),
})

export const isTokenBalance = (
  data: unknown,
): data is Portfolio.Token.Balance => {
  return TokenBalanceSchema.safeParse(data).success
}

export const parseTokenBalance = (
  data: unknown,
): Portfolio.Token.Balance | undefined => {
  return isTokenBalance(data) ? data : undefined
}
