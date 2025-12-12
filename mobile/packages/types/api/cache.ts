import {ApiHttpStatusCode} from './status-code'

export type ApiResponseRecordWithCache<T> =
  | [
      StatusCode: typeof ApiHttpStatusCode.Ok,
      Record: T,
      ETag: string,
      MaxAge: number,
    ]
  | [StatusCode: typeof ApiHttpStatusCode.NotModified, MaxAge: number]
  | [
      StatusCode: typeof ApiHttpStatusCode.InternalServerError,
      Reason: string,
      MaxAge: number,
    ]

export type ApiRequestRecordWithCache<T> = [Record: T, ETag: string]
