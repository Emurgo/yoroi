import {Api, App, Portfolio} from '@yoroi/types'
import {cacheRecordSchemaMaker} from '@yoroi/common'
import {z} from 'zod'

import {TokenStatusSchema} from './token-status'
import {TokenApplicationSchema} from './token-application'
import {TokenIdSchema} from './token-id'
import {TokenTypeSchema} from './token-type'
import {responseRecordWithCacheSchemaMaker} from './response-record-with-cache-schema-maker'

export const CommonTokenInfoSchema = z.object({
  decimals: z.number().nonnegative(),
  ticker: z.string(),
  name: z.string(),
  symbol: z.string(),
  status: TokenStatusSchema,
  application: TokenApplicationSchema,
  tag: z.string(),
  reference: z.string(),
  fingerprint: z.string(),
  website: z.string(),
  originalImage: z.string(),
  description: z.string().optional(),
  icon: z.string().optional(),
  mediaType: z.string().optional(),
})

export const PrimaryTokenInfoSchema = CommonTokenInfoSchema.merge(
  z.object({
    id: z.literal<Portfolio.Token.Id>('.'),
    nature: z.literal(Portfolio.Token.Nature.Primary),
    type: z.literal(Portfolio.Token.Type.FT),
  }),
)

export const SecondaryTokenInfoSchema = CommonTokenInfoSchema.merge(
  z.object({
    id: TokenIdSchema,
    nature: z.literal(Portfolio.Token.Nature.Secondary),
    type: TokenTypeSchema,
  }),
)

export const SecondaryTokenInfoApiResponseSchema = CommonTokenInfoSchema.merge(
  z.object({
    id: TokenIdSchema,
    nature: z.literal(Portfolio.Token.Nature.Secondary).optional(),
    type: TokenTypeSchema,
  }),
)

export const TokenInfoSchema = z.union([
  PrimaryTokenInfoSchema,
  SecondaryTokenInfoSchema,
])

export const isPrimaryTokenInfo = (
  data: unknown,
): data is Portfolio.Token.Info =>
  PrimaryTokenInfoSchema.safeParse(data).success

export const isSecondaryTokenInfo = (
  data: unknown,
): data is Portfolio.Token.Info =>
  SecondaryTokenInfoSchema.safeParse(data).success

export const isTokenInfo = (data: unknown): data is Portfolio.Token.Info =>
  isPrimaryTokenInfo(data) || isSecondaryTokenInfo(data)

export const parseTokenInfo = (
  data: unknown,
): Portfolio.Token.Info | undefined => {
  return isTokenInfo(data) ? data : undefined
}

export const SecondaryTokenInfoApiResponseWithCacheRecordSchema =
  responseRecordWithCacheSchemaMaker(SecondaryTokenInfoApiResponseSchema)

export const isSecondaryTokenInfoWithCacheRecord = (
  data: unknown,
): data is Api.ResponseWithCache<Portfolio.Token.Info> =>
  SecondaryTokenInfoApiResponseWithCacheRecordSchema.safeParse(data).success

export const parseSecondaryTokenInfoWithCacheRecord = (
  data: unknown,
): Api.ResponseWithCache<Portfolio.Token.Info> | undefined => {
  return isSecondaryTokenInfoWithCacheRecord(data) ? data : undefined
}

export const TokenInfoWithCacheRecordSchema =
  cacheRecordSchemaMaker(TokenInfoSchema)

export const isTokenInfoWithCacheRecord = (
  data: unknown,
): data is App.CacheRecord<Portfolio.Token.Info> =>
  TokenInfoWithCacheRecordSchema.safeParse(data).success

export const parseTokenInfoWithCacheRecord = (
  data: unknown,
): App.CacheRecord<Portfolio.Token.Info> | undefined => {
  return isTokenInfoWithCacheRecord(data) ? data : undefined
}
