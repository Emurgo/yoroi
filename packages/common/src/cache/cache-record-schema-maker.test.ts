import {App} from '@yoroi/types'
import z from 'zod'

import {
  cacheRecordSchemaMaker,
  isCacheRecord,
  parseCacheRecord,
} from './cache-record-schema-maker'

describe('cacheRecordSchemaMaker', () => {
  it('should validate a valid cache record', () => {
    const recordSchema = z.object({
      id: z.string(),
      name: z.string(),
    })

    const cacheRecordSchema = cacheRecordSchemaMaker(recordSchema)

    const validCacheRecord: App.CacheRecord<{id: string; name: string}> = {
      record: {
        id: '123',
        name: 'Test',
      },
      expires: 1000,
      hash: 'hash123',
    }

    const result = cacheRecordSchema.safeParse(validCacheRecord)

    expect(result.success).toBe(true)
  })

  it('should not validate an invalid cache record', () => {
    const recordSchema = z.object({
      id: z.string(),
      name: z.string(),
    })

    const cacheRecordSchema = cacheRecordSchemaMaker(recordSchema)

    const invalidCacheRecord: App.CacheRecord<{id: string; name: string}> = {
      record: {
        id: '123',
        name: 123 as any,
      },
      expires: -100,
      hash: 'hash123',
    }

    const result = cacheRecordSchema.safeParse(invalidCacheRecord)

    expect(result.success).toBe(false)
  })
})
describe('isCacheRecord', () => {
  it('should return true for a valid cache record', () => {
    const recordSchema = z.object({
      id: z.string(),
      name: z.string(),
    })

    const validCacheRecord: App.CacheRecord<{id: string; name: string}> = {
      record: {
        id: '123',
        name: 'Test',
      },
      expires: 1000,
      hash: 'hash123',
    }

    const result = isCacheRecord(recordSchema, validCacheRecord)

    expect(result).toBe(true)
  })

  it('should return false for an invalid cache record', () => {
    const recordSchema = z.object({
      id: z.string(),
      name: z.string(),
    })

    const invalidCacheRecord: App.CacheRecord<{id: string; name: string}> = {
      record: {
        id: '123',
        name: 123 as any,
      },
      expires: -100,
      hash: 'hash123',
    }

    const result = isCacheRecord(recordSchema, invalidCacheRecord)

    expect(result).toBe(false)
  })
})

describe('parseCacheRecord', () => {
  it('should return the cache record for a valid cache record', () => {
    const recordSchema = z.object({
      id: z.string(),
      name: z.string(),
    })

    const validCacheRecord: App.CacheRecord<{id: string; name: string}> = {
      record: {
        id: '123',
        name: 'Test',
      },
      expires: 1000,
      hash: 'hash123',
    }

    const result = parseCacheRecord(recordSchema, validCacheRecord)

    expect(result).toEqual(validCacheRecord)
  })

  it('should return undefined for an invalid cache record', () => {
    const recordSchema = z.object({
      id: z.string(),
      name: z.string(),
    })

    const invalidCacheRecord: App.CacheRecord<{id: string; name: string}> = {
      record: {
        id: '123',
        name: 123 as any,
      },
      expires: -100,
      hash: 'hash123',
    }

    const result = parseCacheRecord(recordSchema, invalidCacheRecord)

    expect(result).toBeUndefined()
  })
})
