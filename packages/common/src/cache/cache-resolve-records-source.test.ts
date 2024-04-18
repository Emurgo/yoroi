import {Portfolio, App} from '@yoroi/types'

import {cacheResolveRecordsSource} from './cache-resolve-records-source'

describe('cacheResolveRecordsSource', () => {
  it('should return an empty array when ids is empty', () => {
    const ids: Portfolio.Token.Id[] = []
    const cachedInfosWithoutRecord = new Map<Portfolio.Token.Id, App.CacheInfo>(
      [['id.1', {expires: 1635724800000, hash: 'hash1'}]],
    )

    const {toFetch, fromCache} = cacheResolveRecordsSource({
      ids,
      cachedInfosWithoutRecord,
    })

    expect(toFetch).toEqual([])
    expect(fromCache).toEqual([])
  })

  it('should return an array of records to fetch when ids are not cached', () => {
    const ids: Portfolio.Token.Id[] = ['id.1', 'id.2']
    const cachedInfosWithoutRecord = new Map<
      Portfolio.Token.Id,
      App.CacheInfo
    >()

    const {toFetch, fromCache} = cacheResolveRecordsSource({
      ids,
      cachedInfosWithoutRecord,
    })

    expect(toFetch).toEqual([
      ['id.1', ''],
      ['id.2', ''],
    ])
    expect(fromCache).toEqual([])
  })

  it('should return an array of records to fetch when ids are expired', () => {
    const ids: Portfolio.Token.Id[] = ['id.1', 'id.2']
    const past = Date.now() - 1000000
    const future = Date.now() + 1000000
    const cachedInfosWithoutRecord = new Map<Portfolio.Token.Id, App.CacheInfo>(
      [
        ['id.1', {expires: past, hash: 'hash1'}],
        ['id.2', {expires: future, hash: 'hash2'}],
      ],
    )

    const {toFetch, fromCache} = cacheResolveRecordsSource({
      ids,
      cachedInfosWithoutRecord,
    })

    expect(toFetch).toEqual([['id.1', 'hash1']])
    expect(fromCache).toEqual(['id.2'])
  })

  it('should return an empty array when all ids are not expired', () => {
    const ids: Portfolio.Token.Id[] = ['id.1', 'id.2']
    const future = Date.now() + 1000000
    const cachedInfosWithoutRecord = new Map<Portfolio.Token.Id, App.CacheInfo>(
      [
        ['id.1', {expires: future, hash: 'hash1'}],
        ['id.2', {expires: future, hash: 'hash2'}],
      ],
    )

    const {toFetch, fromCache} = cacheResolveRecordsSource({
      ids,
      cachedInfosWithoutRecord,
    })

    expect(toFetch).toEqual([])
    expect(fromCache).toEqual(['id.1', 'id.2'])
  })
})
