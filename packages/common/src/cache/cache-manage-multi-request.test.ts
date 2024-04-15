import {Api, App} from '@yoroi/types'

import {cacheManageMultiRequest} from './cache-manage-multi-request'

describe('cacheManageMultiRequest', () => {
  let cachedInfosWithoutRecord = new Map<string, App.CacheInfo>()
  let ids = ['id1', 'id2', 'id3']
  const request = jest.fn()
  const persistance = {
    read: jest.fn(),
    save: jest.fn(),
  }
  const unknownRecordFactory = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    ids = ['id1', 'id2', 'id3']
    persistance.read.mockReturnValue([])
    request.mockResolvedValue([])
    cachedInfosWithoutRecord = new Map<string, App.CacheInfo>()
  })

  it('should fetch records from API and update cache with unknowns', async () => {
    const recordsFromApi = {
      id1: [200, {}, 'etag1', 3600],
      id2: [200, {}, 'etag2', 3600],
    }
    request.mockResolvedValueOnce({
      tag: 'right',
      value: {
        status: Api.HttpStatusCode.Ok,
        data: recordsFromApi,
      },
    })
    unknownRecordFactory.mockImplementation(() => ({
      hash: '',
      expires: 0,
      record: {},
    }))

    const result = await cacheManageMultiRequest({
      cachedInfosWithoutRecord,
      ids,
      request,
      persistance,
      unknownRecordFactory,
    })

    expect(request).toHaveBeenCalledWith([
      ['id1', ''],
      ['id2', ''],
      ['id3', ''],
    ])
    expect(persistance.read).toHaveBeenCalledWith(['id3'])
    expect(persistance.save).toHaveBeenCalledWith([
      [
        'id1',
        {
          hash: 'etag1',
          expires: expect.any(Number),
          record: {},
        },
      ],
      [
        'id2',
        {
          hash: 'etag2',
          expires: expect.any(Number),
          record: {},
        },
      ],
      [
        'id3',
        {
          hash: '',
          expires: 0,
          record: {},
        },
      ],
    ])
    expect(result.records.get('id1')).toEqual({
      hash: 'etag1',
      expires: expect.any(Number),
      record: {},
    })
    expect(result.records.get('id2')).toEqual({
      hash: 'etag2',
      expires: expect.any(Number),
      record: {},
    })
    expect(result.records.get('id3')).toEqual({
      hash: '',
      expires: 0,
      record: {},
    })
    expect(result.updatedIds).toEqual(['id1', 'id2'])
    expect(result.unknownIds).toEqual(['id3'])
    expect(result.revalidatedIds).toEqual([])
    expect(unknownRecordFactory).toHaveBeenCalledTimes(1)
    expect(unknownRecordFactory).toHaveBeenCalledWith('id3')
    expect(result.fromCacheIds).toEqual([])
    expect(result.isInvalidated).toBe(true)
  })

  it('should handle not-modified responses and revalidate cache', async () => {
    ids = ['id1', 'id2']
    cachedInfosWithoutRecord = new Map([
      [
        'id1',
        {
          hash: 'etag1-storage',
          expires: past,
        },
      ],
      [
        'id2',
        {
          hash: 'etag2-storage',
          expires: past,
        },
      ],
    ])
    const recordsFromApi = {
      id1: [Api.HttpStatusCode.NotModified, 3600],
      id2: [Api.HttpStatusCode.NotModified, 3600],
    }
    request.mockResolvedValueOnce({
      tag: 'right',
      value: {
        status: Api.HttpStatusCode.Ok,
        data: recordsFromApi,
      },
    })

    persistance.read.mockReturnValueOnce([
      [
        'id1',
        {
          hash: 'etag1-storage',
          expires: Date.now() - 3600 * 1000,
          record: {},
        },
      ],
      [
        'id2',
        {
          hash: 'etag2-storage',
          expires: Date.now() - 3600 * 1000,
          record: {},
        },
      ],
    ])

    const result = await cacheManageMultiRequest({
      cachedInfosWithoutRecord,
      ids,
      request,
      persistance,
      unknownRecordFactory,
    })

    expect(request).toHaveBeenCalledWith([
      ['id1', 'etag1-storage'],
      ['id2', 'etag2-storage'],
    ])
    expect(persistance.read).toHaveBeenCalledWith(['id1', 'id2'])
    expect(persistance.save).toHaveBeenCalledWith([
      [
        'id1',
        {
          hash: 'etag1-storage',
          expires: expect.any(Number),
          record: {},
        },
      ],
      [
        'id2',
        {
          hash: 'etag2-storage',
          expires: expect.any(Number),
          record: {},
        },
      ],
    ])
    expect(result.records.get('id1')).toEqual({
      hash: 'etag1-storage',
      expires: expect.any(Number),
      record: {},
    })
    expect(result.records.get('id2')).toEqual({
      hash: 'etag2-storage',
      expires: expect.any(Number),
      record: {},
    })
    expect(result.updatedIds).toEqual([])
    expect(result.unknownIds).toEqual([])
    expect(result.revalidatedIds).toEqual(['id1', 'id2'])
    expect(result.fromCacheIds).toEqual([])
    expect(result.isInvalidated).toBe(false)
  })

  it('should handle unknown records and save them to cache', async () => {
    ids = ['id1']
    request.mockResolvedValueOnce({
      tag: 'right',
      value: {
        status: Api.HttpStatusCode.Ok,
        data: {},
      },
    })

    persistance.read.mockReturnValueOnce([['id1', null]])

    unknownRecordFactory.mockReturnValueOnce({
      hash: '',
      expires: 0,
      record: {},
    })

    const result = await cacheManageMultiRequest({
      cachedInfosWithoutRecord,
      ids,
      request,
      persistance,
      unknownRecordFactory,
    })

    expect(request).toHaveBeenCalledWith([['id1', '']])
    expect(persistance.read).toHaveBeenCalledWith(['id1'])
    expect(persistance.save).toHaveBeenCalledWith([
      [
        'id1',
        {
          hash: '',
          expires: 0,
          record: {},
        },
      ],
    ])
    expect(result.records.get('id1')).toEqual({
      hash: '',
      expires: expect.any(Number),
      record: {},
    })
    expect(result.updatedIds).toEqual([])
    expect(result.unknownIds).toEqual(['id1'])
    expect(result.revalidatedIds).toEqual([])
    expect(result.fromCacheIds).toEqual([])
    expect(result.isInvalidated).toBe(true)
  })

  it('should handle unknown records and return the ids (no-factory)', async () => {
    ids = ['id1']
    request.mockResolvedValueOnce({
      tag: 'right',
      value: {
        status: Api.HttpStatusCode.Ok,
        data: {},
      },
    })

    persistance.read.mockReturnValueOnce([['id1', null]])

    const result = await cacheManageMultiRequest({
      cachedInfosWithoutRecord,
      ids,
      request,
      persistance,
    })

    expect(request).toHaveBeenCalledWith([['id1', '']])
    expect(persistance.read).toHaveBeenCalledWith(['id1'])
    expect(persistance.save).not.toHaveBeenCalled()
    expect(result.records.get('id1')).toBeNull()
    expect(result.updatedIds).toEqual([])
    expect(result.unknownIds).toEqual(['id1'])
    expect(result.revalidatedIds).toEqual([])
    expect(result.fromCacheIds).toEqual([])
    expect(result.isInvalidated).toBe(false)
  })

  it('should resolve as unkonwn if API fails', async () => {
    ids = ['id1']
    request.mockResolvedValueOnce({
      tag: 'left',
      value: {
        responseData: 'error',
        message: 'error',
      },
    })

    const result = await cacheManageMultiRequest({
      cachedInfosWithoutRecord,
      ids,
      request,
      persistance,
    })

    expect(request).toHaveBeenCalledWith([['id1', '']])
    expect(persistance.read).toHaveBeenCalledWith(['id1'])
    expect(persistance.save).not.toHaveBeenCalled()
    expect(result.records.get('id1')).toBeNull()

    expect(result.updatedIds).toEqual([])
    expect(result.unknownIds).toEqual(['id1'])
    expect(result.revalidatedIds).toEqual([])
    expect(result.fromCacheIds).toEqual([])
    expect(result.isInvalidated).toBe(false)
  })

  it('should return as unkonwn if is local record but in memory and API returns as not-modified', async () => {
    ids = ['id1']
    cachedInfosWithoutRecord = new Map([
      [
        'id1',
        {
          hash: 'etag1-storage',
          expires: past,
        },
      ],
    ])
    const recordsFromApi = {
      id1: [Api.HttpStatusCode.NotModified, 3600],
    }
    request.mockResolvedValueOnce({
      tag: 'right',
      value: {
        status: Api.HttpStatusCode.Ok,
        data: recordsFromApi,
      },
    })
    persistance.read.mockReturnValueOnce([[]])

    const result = await cacheManageMultiRequest({
      cachedInfosWithoutRecord,
      ids,
      request,
      persistance,
    })

    expect(request).toHaveBeenCalledWith([['id1', 'etag1-storage']])
    expect(persistance.read).toHaveBeenCalledWith(['id1'])
    expect(persistance.save).not.toHaveBeenCalled()
    expect(result.records.get('id1')).toBeNull()

    expect(result.updatedIds).toEqual([])
    expect(result.unknownIds).toEqual(['id1'])
    expect(result.revalidatedIds).toEqual([])
    expect(result.fromCacheIds).toEqual([])
    expect(result.isInvalidated).toBe(false)
  })

  it('should handle records to fetch when no cached data', async () => {
    ids = ['id1']
    request.mockResolvedValueOnce({
      tag: 'right',
      value: {
        status: Api.HttpStatusCode.Ok,
        data: {
          id1: [Api.HttpStatusCode.Ok, {}, 'etag1', 3600],
        },
      },
    })

    const result = await cacheManageMultiRequest({
      cachedInfosWithoutRecord,
      ids,
      request,
      persistance,
    })

    expect(request).toHaveBeenCalledWith([['id1', '']])
    expect(persistance.read).not.toHaveBeenCalled()
    expect(persistance.save).toHaveBeenCalledWith([
      [
        'id1',
        {
          hash: 'etag1',
          expires: expect.any(Number),
          record: {},
        },
      ],
    ])
    expect(result.records.get('id1')).toEqual({
      hash: 'etag1',
      expires: expect.any(Number),
      record: {},
    })
    expect(result.updatedIds).toEqual(['id1'])
    expect(result.unknownIds).toEqual([])
    expect(result.revalidatedIds).toEqual([])
    expect(result.fromCacheIds).toEqual([])
    expect(result.isInvalidated).toBe(true)
  })

  it('should not hit the API if local cache is valid', async () => {
    ids = ['id1']
    cachedInfosWithoutRecord = new Map([
      [
        'id1',
        {
          hash: 'etag1-storage',
          expires: future,
        },
      ],
    ])
    request.mockResolvedValueOnce({
      tag: 'left',
      value: {
        responseData: 'error',
        message: 'error',
      },
    })
    persistance.read.mockReturnValueOnce([
      [
        'id1',
        {
          hash: 'etag1-storage',
          expires: future,
          record: {},
        },
      ],
    ])

    const result = await cacheManageMultiRequest({
      cachedInfosWithoutRecord,
      ids,
      request,
      persistance,
    })

    expect(request).not.toHaveBeenCalled()
    expect(persistance.read).toHaveBeenCalledWith(['id1'])
    expect(persistance.save).not.toHaveBeenCalled()
    expect(result.records.get('id1')).toEqual({
      hash: 'etag1-storage',
      expires: future,
      record: {},
    })

    expect(result.updatedIds).toEqual([])
    expect(result.unknownIds).toEqual([])
    expect(result.revalidatedIds).toEqual([])
    expect(result.fromCacheIds).toEqual(['id1'])
    expect(result.isInvalidated).toBe(false)
  })
})

const past = Date.now() - 3_600 * 1_000
const future = Date.now() + 3_600 * 1_000
