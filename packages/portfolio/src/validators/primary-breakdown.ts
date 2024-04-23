import {z} from 'zod'
import {Portfolio} from '@yoroi/types'

export const PrimaryBreakdownSchema = z.object({
  availableRewards: z.bigint(),
  totalFromTxs: z.bigint(),
  lockedAsStorageCost: z.bigint(),
})

export const isPrimaryBreakdown = (
  data: unknown,
): data is Portfolio.PrimaryBreakdown =>
  PrimaryBreakdownSchema.safeParse(data).success

export const parsePrimaryBreakdown = (
  data: unknown,
): Portfolio.PrimaryBreakdown | undefined => {
  return isPrimaryBreakdown(data) ? data : undefined
}
