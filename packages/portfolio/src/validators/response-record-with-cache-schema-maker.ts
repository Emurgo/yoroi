import z, {ZodType} from 'zod'

import {AppApiResponseRecordWithCache, HttpStatusCode} from '../types'

export const responseRecordWithCacheSchemaMaker = <T>(
  recordSchema: ZodType<T>,
): ZodType<AppApiResponseRecordWithCache<T>> => {
  return z.union([
    z.tuple([
      z.literal(HttpStatusCode.Ok),
      recordSchema,
      z.string(),
      z.number().nonnegative(),
    ]),
    z.tuple([z.literal(HttpStatusCode.NotModified), z.number().positive()]),
  ])
}
