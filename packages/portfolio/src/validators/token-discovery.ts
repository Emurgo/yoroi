import {Api, App, Portfolio} from '@yoroi/types'
import {z} from 'zod'

import {responseRecordWithCacheSchemaMaker} from './response-record-with-cache-schema-maker'
import {TokenSourceSchema} from './token-source'
import {TokenIdSchema} from './token-id'
import {cacheRecordSchemaMaker} from '@yoroi/common'

const DiscoverySourceSchema = z.object({
  name: TokenSourceSchema,
  decimals: TokenSourceSchema,
  ticker: TokenSourceSchema,
  symbol: TokenSourceSchema,
  originalImage: TokenSourceSchema,
  description: TokenSourceSchema,
})

const DiscoveryOriginalMetadataSchema = z.object({
  filteredMintMetadatum: z.record(z.unknown()).nullable(),
  referenceDatum: z.record(z.unknown()).nullable(),
  tokenRegistry: z.record(z.unknown()).nullable(),
})

export const TokenDiscoverySchema = z.object({
  id: TokenIdSchema,
  source: DiscoverySourceSchema,
  originalMetadata: DiscoveryOriginalMetadataSchema,
  supply: z.bigint(),
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
): data is Api.ResponseWithCache<Portfolio.Token.Discovery> =>
  TokenDiscoveryResponseWithCacheRecordSchema.safeParse(data).success

export const parseTokenDiscoveryResponseWithCacheRecord = (
  data: unknown,
): Api.ResponseWithCache<Portfolio.Token.Discovery> | undefined => {
  return isTokenDiscoveryResponseWithCacheRecord(data) ? data : undefined
}

export const TokenDiscoveryWithCacheRecordSchema =
  // zod doesn't work with string templates yet, check TokenIdSchema for more info
  cacheRecordSchemaMaker<Portfolio.Token.Discovery>(TokenDiscoverySchema as any)

export const isTokenDiscoveryWithCacheRecord = (
  data: unknown,
): data is App.CacheRecord<Portfolio.Token.Discovery> =>
  TokenDiscoveryWithCacheRecordSchema.safeParse(data).success

export const parseTokenDiscoveryWithCacheRecord = (
  data: unknown,
): App.CacheRecord<Portfolio.Token.Discovery> | undefined => {
  return isTokenDiscoveryWithCacheRecord(data) ? data : undefined
}
