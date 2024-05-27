import {Portfolio} from '@yoroi/types'
import {z} from 'zod'

export const TraitSchema = z.object({
  type: z.string(),
  value: z.string(),
  rarity: z.string(),
})

const TraitsSchema = z.object({
  // is part of the token id, it's not used by Portfolio
  // collection: z.string().optional(),
  // name: z.string().optional(),
  totalItems: z.number(),
  traits: z.array(TraitSchema),
})

export const isTokenTraits = (data: unknown): data is Portfolio.Token.Traits =>
  TraitsSchema.safeParse(data).success

export const parseTokenTraits = (
  data: unknown,
): Portfolio.Token.Traits | undefined => {
  return isTokenTraits(data) ? data : undefined
}
