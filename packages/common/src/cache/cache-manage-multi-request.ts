import {Api, App} from '@yoroi/types'
import {freeze} from 'immer'

import {cacheResolveRecordsSource} from './cache-resolve-records-source'
import {isRight} from '../utils/monads'
import {hasEntryValue} from '../utils/predicates'

type CacheMultiRequestParams<K extends string, V> = {
  // current cache info
  cachedInfosWithoutRecord: Readonly<Map<K, App.CacheInfo>>
  // new ids to be resolved -> api or persistance
  ids: ReadonlyArray<K>
  // api request to fetch the records
  request: (
    ids: ReadonlyArray<Api.RequestWithCache<K>>,
  ) => Promise<Readonly<Api.Response<{[key in K]: Api.ResponseWithCache<V>}>>>
  // cache persistance
  persistance: {
    read: (
      ids: ReadonlyArray<K>,
    ) => ReadonlyArray<[K, App.CacheRecord<V> | null]>
    save: (records: ReadonlyArray<[K, App.CacheRecord<V>]>) => void
  }
  // factory to create unknown records when not provided return null for records not found
  unknownRecordFactory?: (id: K) => Readonly<App.CacheRecord<V>>
}

export const cacheManageMultiRequest = async <K extends string, V>({
  cachedInfosWithoutRecord,
  ids,
  request,
  persistance,
  unknownRecordFactory,
}: CacheMultiRequestParams<K, V>) => {
  // resolve the ids to be fetched and the ones that should be read from cache
  const {toFetch, fromCache} = cacheResolveRecordsSource({
    ids,
    cachedInfosWithoutRecord,
  })
  let updatedIds: Array<K> = []

  let toSaveRevalidatingCache: Map<K, App.CacheRecord<V>> = new Map()
  let toRevalidateCache: Map<K, number> = new Map()
  let toResolveLocally = new Set<K>(fromCache)
  let cachedRecords: Map<K, App.CacheRecord<V> | null> = new Map()

  let unknownIds: Array<K> = []
  let unknownEmptyRecords: Array<[K, null]> = []
  let toSaveNewUnknownRecord: Map<K, App.CacheRecord<V>> = new Map()

  let toSaveNewFromApi: Map<K, App.CacheRecord<V>> = new Map()
  let recordsFromApi: Record<K, Api.ResponseWithCache<V>> = {} as Record<
    K,
    Api.ResponseWithCache<V>
  >

  if (toFetch.length > 0) {
    const apiResponse = await request(toFetch)
    // if the request fails, we will show unknown tokens and wont block the user
    if (isRight(apiResponse)) recordsFromApi = apiResponse.value.data
  }
  // to make same request time for all records, to avoid ms of difference
  const baseDate = Date.now()

  toFetch.forEach(([id]) => {
    const recordFromApi = recordsFromApi[id]
    if (!recordFromApi) {
      toResolveLocally.add(id)
      return
    }

    const [statusCode] = recordFromApi

    // when not-modified add to revalidate cache by updating expires
    if (statusCode === Api.HttpStatusCode.NotModified) {
      const [, maxAge] = recordFromApi
      toRevalidateCache.set(id, baseDate + maxAge * 1_000)
      return
    }

    // when internal server error, it skips the record
    if (statusCode === Api.HttpStatusCode.InternalServerError) {
      toResolveLocally.add(id)
      return
    }

    const [, record, eTag, maxAge] = recordFromApi
    toSaveNewFromApi.set(id, {
      hash: eTag,
      expires: baseDate + maxAge * 1_000,
      record,
    })
  })
  updatedIds = [...toSaveNewFromApi.keys()]

  // if there are empties (not-found) by the api and to refresh cache (not-modified)
  if (toResolveLocally.size > 0 || toRevalidateCache.size > 0) {
    const idsToReadFromPersistance = [
      ...toResolveLocally.keys(),
      ...toRevalidateCache.keys(),
    ]
    // WARN: should be the only reading operation
    cachedRecords = new Map(
      persistance.read(idsToReadFromPersistance).filter(hasEntryValue),
    )

    toRevalidateCache.forEach((expires, id) => {
      const recordFromApi = cachedRecords.get(id)
      if (recordFromApi != null)
        toSaveRevalidatingCache.set(id, {...recordFromApi, expires})
    })

    // ids not found at this point should create an unknown record if factory is provided
    unknownIds = idsToReadFromPersistance.filter((id) => !cachedRecords.has(id))
    if (unknownRecordFactory) {
      unknownIds
        .map((id): [K, Readonly<App.CacheRecord<V>>] => [
          id,
          unknownRecordFactory(id),
        ])
        .forEach(([id, record]) => toSaveNewUnknownRecord.set(id, record))
    } else {
      unknownEmptyRecords = unknownIds.map((id) => [id, null])
    }
  }

  // WARN: should be the only writing operation
  const toSave = [
    ...toSaveNewFromApi.entries(),
    ...toSaveRevalidatingCache.entries(),
    ...toSaveNewUnknownRecord.entries(),
  ]
  if (toSave.length > 0) persistance.save(toSave)

  const result = freeze({
    records: new Map([
      ...cachedRecords.entries(),
      ...toSave,
      ...unknownEmptyRecords,
    ]),
    updatedIds,
    unknownIds,
    revalidatedIds: [...toSaveRevalidatingCache.keys()],
    fromCacheIds: fromCache.filter((id) => cachedRecords.has(id)),
    isInvalidated: updatedIds.length > 0 || toSaveNewUnknownRecord.size > 0,
  })

  return result
}
