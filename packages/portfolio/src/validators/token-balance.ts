import {Portfolio} from '@yoroi/types'
import {z} from 'zod'

import {TokenIdSchema} from './token-id'

export const TokenBalanceSchema = z.object({
  id: TokenIdSchema,
  balance: z.bigint(),
  lockedInBuiltTx: z.bigint(),
})

export const isTokenBalance = (
  data: unknown,
): data is Portfolio.Token.Balance => {
  return TokenBalanceSchema.safeParse(data).success
}

export const parseAmount = (
  data: unknown,
): Portfolio.Token.Balance | undefined => {
  return isTokenBalance(data) ? data : undefined
}
