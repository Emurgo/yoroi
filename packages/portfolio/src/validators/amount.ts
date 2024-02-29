import {Portfolio} from '@yoroi/types'
import {z} from 'zod'

import {TokenIdSchema} from './token-id'

export const AmountSchema = z.object({
  id: TokenIdSchema,
  quantity: z.bigint(),
})

export const isAmount = (data: unknown): data is Portfolio.Amount => {
  return AmountSchema.safeParse(data).success
}

export const parseAmount = (data: unknown): Portfolio.Amount | undefined => {
  return isAmount(data) ? data : undefined
}
