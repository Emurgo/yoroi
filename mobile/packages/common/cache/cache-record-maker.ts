import {App} from '@yoroi/types'

export const cacheRecordMaker = <T>(
  {expires, hash}: App.CacheInfo,
  record: T,
): App.CacheRecord<T> => {
  return {
    record,
    expires,
    hash,
  }
}
