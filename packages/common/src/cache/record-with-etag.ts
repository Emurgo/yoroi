import {Api} from '@yoroi/types'

export const recordWithETag = <T>(
  value: T,
  etag: string = '',
): Api.RequestWithCache<T> => [value, etag]
