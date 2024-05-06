import {Api} from '@yoroi/types'
import {z} from 'zod'

import {responseRecordWithCacheSchemaMaker} from './response-record-with-cache-schema-maker'

describe('responseRecordWithCacheSchemaMaker', () => {
  it('should return the correct schema for HttpStatusCode.Ok', () => {
    const recordSchema = z.object({
      id: z.string(),
      name: z.string(),
    })
    const schema = responseRecordWithCacheSchemaMaker(recordSchema)

    const validData = [
      Api.HttpStatusCode.Ok,
      {
        id: '1',
        name: 'John Doe',
      },
      'cacheKey',
      1000,
    ]

    expect(schema.safeParse(validData).success).toBe(true)
  })

  it('should return the correct schema for HttpStatusCode.NotModified', () => {
    const schema = responseRecordWithCacheSchemaMaker(z.number())

    const validData = [Api.HttpStatusCode.NotModified, 123]

    expect(schema.safeParse(validData).success).toBe(true)
  })

  it('should return an error for invalid data', () => {
    const recordSchema = z.object({
      id: z.string(),
      name: z.string(),
    })
    const schema = responseRecordWithCacheSchemaMaker(recordSchema)

    const invalidData = [
      Api.HttpStatusCode.Ok,
      {
        id: 1,
        name: 'John Doe',
      },
      'cacheKey',
      -1000,
    ]

    expect(schema.safeParse(invalidData).success).toBe(false)
  })
})
