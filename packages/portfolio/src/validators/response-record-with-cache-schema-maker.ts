import {Api} from '@yoroi/types'

import z, {ZodType} from 'zod'

export const responseRecordWithCacheSchemaMaker = <T>(
  recordSchema: ZodType<T>,
): ZodType<Api.ResponseWithCache<T>> => {
  return z.union([
    z.tuple([
      z.literal(Api.HttpStatusCode.Ok),
      recordSchema,
      z.string(),
      z.number().nonnegative(),
    ]),
    z.tuple([
      z.literal(Api.HttpStatusCode.NotModified),
      z.number().nonnegative(),
    ]),
    z.tuple([
      z.literal(Api.HttpStatusCode.InternalServerError),
      z.string(),
      z.number().nonnegative(),
    ]),
  ])
}
