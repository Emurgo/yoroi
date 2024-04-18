import {z} from 'zod'
import {Portfolio} from '@yoroi/types'

import {TokenBalanceSchema} from './token-balance'

export const PrimaryBalanceBreakdownSchema = TokenBalanceSchema.extend({
  minRequiredByTokens: z.bigint(),
  records: z.array(
    z.object({
      quantity: z.bigint(),
      redeemableAfter: z.number(),
      source: z.string(),
    }),
  ),
})

export const isPrimaryBalanceBreakdown = (
  data: unknown,
): data is Portfolio.BalancePrimaryBreakdown =>
  PrimaryBalanceBreakdownSchema.safeParse(data).success

export const parsePrimaryBalanceBreakdown = (
  data: unknown,
): Portfolio.BalancePrimaryBreakdown | undefined => {
  return isPrimaryBalanceBreakdown(data) ? data : undefined
}
