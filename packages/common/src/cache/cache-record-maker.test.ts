import {cacheRecordMaker} from './cache-record-maker'
import {App} from '@yoroi/types'

describe('cacheRecordMaker', () => {
  it('should create a cache record with the provided information', () => {
    const cacheInfo: App.CacheInfo = {
      expires: 1234567890,
      hash: 'abc123',
    }
    const record = {data: 'test'}

    const expectedCacheRecord: App.CacheRecord<typeof record> = {
      record,
      expires: cacheInfo.expires,
      hash: cacheInfo.hash,
    }

    const result = cacheRecordMaker(cacheInfo, record)

    expect(result).toEqual(expectedCacheRecord)
  })
})
