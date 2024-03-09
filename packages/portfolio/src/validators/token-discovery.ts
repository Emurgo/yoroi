import {Portfolio} from '@yoroi/types'
import {z} from 'zod'

import {responseRecordWithCacheSchemaMaker} from './response-record-with-cache-schema-maker'
import {TokenSourceSchema} from './token-source'
import {TokenPropertyTypeSchema} from './token-property-type'
import {TokenIdSchema} from './token-id'
import {AppApiResponseRecordWithCache} from '../types'

const DiscoverySourceSchema = z.object({
  name: TokenSourceSchema,
  decimals: TokenSourceSchema,
  ticker: TokenSourceSchema,
  symbol: TokenSourceSchema,
  image: TokenSourceSchema,
})

const DiscoveryOriginalMetadataSchema = z.object({
  filteredMintMetadatum: z.record(z.unknown()).nullable(),
  referenceDatum: z.record(z.unknown()).nullable(),
  tokenRegistry: z.record(z.unknown()).nullable(),
})

const DiscoveryCountersSchema = z.object({
  supply: z.bigint(),
  items: z.number(),
  totalItems: z.number(),
})

const DiscoveryPropertiesSchema = z.record(
  z
    .object({
      rarity: z.number(),
      detectedType: TokenPropertyTypeSchema,
      value: z.unknown(),
    })
    .optional(),
)

export const TokenDiscoverySchema = z.object({
  id: TokenIdSchema,
  source: DiscoverySourceSchema,
  originalMetadata: DiscoveryOriginalMetadataSchema,
  counters: DiscoveryCountersSchema,
  properties: DiscoveryPropertiesSchema,
})

export const isTokenDiscovery = (data: unknown): data is Portfolio.Token.Info =>
  TokenDiscoverySchema.safeParse(data).success

export const parseTokenDiscovery = (
  data: unknown,
): Portfolio.Token.Info | undefined => {
  return isTokenDiscovery(data) ? data : undefined
}

export const TokenDiscoveryResponseWithCacheRecordSchema =
  responseRecordWithCacheSchemaMaker(TokenDiscoverySchema)

export const isTokenDiscoveryResponseWithCacheRecord = (
  data: unknown,
): data is AppApiResponseRecordWithCache<Portfolio.Token.Discovery> =>
  TokenDiscoveryResponseWithCacheRecordSchema.safeParse(data).success

export const parseTokenInfoResponseWithCacheRecord = (
  data: unknown,
): AppApiResponseRecordWithCache<Portfolio.Token.Discovery> | undefined => {
  return isTokenDiscoveryResponseWithCacheRecord(data) ? data : undefined
}
