import {AppApiRequestRecordWithCache} from '../types'

export const recordWithETag = <T>(
  value: T,
  etag: string = '',
): AppApiRequestRecordWithCache<T> => [value, etag]
