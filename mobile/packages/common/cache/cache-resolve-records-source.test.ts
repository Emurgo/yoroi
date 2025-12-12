import {App, Branded, Portfolio, TokenId} from '@yoroi/types'

import {cacheResolveRecordsSource} from './cache-resolve-records-source'

describe('cacheResolveRecordsSource', () => {
  it('should return an empty array when ids is empty', () => {
    const ids: Portfolio.Token.Id[] = []
    const cachedInfosWithoutRecord = new Map<TokenId, App.CacheInfo>([
      [Branded.asTokenId('id.1'), {expires: 1635724800000, hash: 'hash1'}],
    ])

    const {toFetch, fromCache} = cacheResolveRecordsSource({
      ids,
      cachedInfosWithoutRecord,
    })

    expect(toFetch).toEqual([])
    expect(fromCache).toEqual([])
  })

  it('should return an array of records to fetch when ids are not cached', () => {
    const ids: Portfolio.Token.Id[] = [
      Branded.asTokenId('id.1'),
      Branded.asTokenId('id.2'),
    ]
    const cachedInfosWithoutRecord = new Map<TokenId, App.CacheInfo>()

    const {toFetch, fromCache} = cacheResolveRecordsSource({
      ids,
      cachedInfosWithoutRecord,
    })

    expect(toFetch).toEqual([
      [Branded.asTokenId('id.1'), ''],
      [Branded.asTokenId('id.2'), ''],
    ])
    expect(fromCache).toEqual([])
  })

  it('should return an array of records to fetch when ids are expired', () => {
    const ids: Portfolio.Token.Id[] = [
      Branded.asTokenId('id.1'),
      Branded.asTokenId('id.2'),
    ]
    const past = Date.now() - 1000000
    const future = Date.now() + 1000000
    const cachedInfosWithoutRecord = new Map<TokenId, App.CacheInfo>([
      [Branded.asTokenId('id.1'), {expires: past, hash: 'hash1'}],
      [Branded.asTokenId('id.2'), {expires: future, hash: 'hash2'}],
    ])

    const {toFetch, fromCache} = cacheResolveRecordsSource({
      ids,
      cachedInfosWithoutRecord,
    })

    expect(toFetch).toEqual([[Branded.asTokenId('id.1'), 'hash1']])
    expect(fromCache).toEqual([Branded.asTokenId('id.2')])
  })

  it('should return an empty array when all ids are not expired', () => {
    const ids: Portfolio.Token.Id[] = [
      Branded.asTokenId('id.1'),
      Branded.asTokenId('id.2'),
    ]
    const future = Date.now() + 1000000
    const cachedInfosWithoutRecord = new Map<TokenId, App.CacheInfo>([
      [Branded.asTokenId('id.1'), {expires: future, hash: 'hash1'}],
      [Branded.asTokenId('id.2'), {expires: future, hash: 'hash2'}],
    ])

    const {toFetch, fromCache} = cacheResolveRecordsSource({
      ids,
      cachedInfosWithoutRecord,
    })

    expect(toFetch).toEqual([])
    expect(fromCache).toEqual([
      Branded.asTokenId('id.1'),
      Branded.asTokenId('id.2'),
    ])
  })
})
