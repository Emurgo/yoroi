import {Portfolio} from '@yoroi/types'
import {z} from 'zod'

export const TraitSchema = z.object({
  type: z.string(),
  value: z.string(),
  rarity: z.string(),
})

const TraitsSchema = z.object({
  totalItems: z.number().nonnegative(),
  traits: z.array(TraitSchema),
  // useful only if client doen't have the info
  // collection: z.string().optional(),
  // name: z.string().optional(),
})

export const isTokenTraits = (data: unknown): data is Portfolio.Token.Traits =>
  TraitsSchema.safeParse(data).success

export const parseTokenTraits = (
  data: unknown,
): Portfolio.Token.Traits | undefined => {
  return isTokenTraits(data) ? data : undefined
}
