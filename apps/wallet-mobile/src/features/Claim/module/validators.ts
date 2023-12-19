import {z} from 'zod'

const QuantitySchema = z.string().regex(/^\d+$/, {
  message: 'Expected a string containing only numeric characters (0-9)',
})

const AmountsSchema = z.record(QuantitySchema)

const BaseClaimTokensSchema = z.object({
  lovelaces: QuantitySchema,
  tokens: AmountsSchema,
})

const ClaimTokensAcceptedSchema = z.object({
  status: z.literal('accepted'),
  queue_position: z.number(),
})

const ClaimTokensQueuedSchema = z.object({
  status: z.literal('queued'),
  queue_position: z.number(),
})

const ClaimTokensClaimedSchema = z.object({
  status: z.literal('claimed'),
  tx_hash: z.string(),
})

export const ClaimTokensApiResponseSchema = z.union([
  BaseClaimTokensSchema.merge(ClaimTokensAcceptedSchema),
  BaseClaimTokensSchema.merge(ClaimTokensClaimedSchema),
  BaseClaimTokensSchema.merge(ClaimTokensQueuedSchema),
])
