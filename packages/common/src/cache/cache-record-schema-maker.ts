import {App} from '@yoroi/types'
import z, {ZodType} from 'zod'

export const cacheRecordSchemaMaker = <T>(
  recordSchema: ZodType<T>,
): ZodType<App.CacheRecord<T>> => {
  return z.object({
    record: recordSchema,
    expires: z.number().nonnegative(),
    hash: z.string(),
    // Zod is not infering the type correctly when using interface
  }) as unknown as ZodType<App.CacheRecord<T>>
}

export const isCacheRecord = <T>(
  recordSchema: ZodType<T>,
  data: unknown,
): data is App.CacheRecord<T> => {
  return cacheRecordSchemaMaker<T>(recordSchema).safeParse(data).success
}

export const parseCacheRecord = <T>(
  recordSchema: ZodType<T>,
  data: unknown,
): App.CacheRecord<T> | undefined => {
  return isCacheRecord<T>(recordSchema, data) ? data : undefined
}
