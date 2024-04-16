import {Api, App} from '@yoroi/types'

import {recordWithETag} from './record-with-etag'
import {isExpired} from './is-expired'

export const cacheResolveRecordsSource = <T>({
  ids,
  cachedInfosWithoutRecord,
}: {
  ids: ReadonlyArray<T>
  cachedInfosWithoutRecord: Readonly<Map<T, App.CacheInfo | null | undefined>>
}) => {
  const toFetch: Array<Api.RequestWithCache<T>> = []
  const fromCache: Array<T> = []
  ids.forEach((id) => {
    const cachedRecord = cachedInfosWithoutRecord.get(id)
    if (cachedRecord) {
      if (isExpired(cachedRecord)) {
        toFetch.push(recordWithETag(id, cachedRecord.hash))
      } else {
        fromCache.push(id)
      }
    } else {
      toFetch.push(recordWithETag(id))
    }
  })
  return {toFetch, fromCache}
}
