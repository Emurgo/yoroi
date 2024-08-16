import {ApiHttpStatusCode} from './status-code'

export type ApiResponseRecordWithCache<T> =
  | [StatusCode: ApiHttpStatusCode.Ok, Record: T, ETag: string, MaxAge: number]
  | [StatusCode: ApiHttpStatusCode.NotModified, MaxAge: number]
  | [
      StatusCode: ApiHttpStatusCode.InternalServerError,
      Reason: string,
      MaxAge: number,
    ]

export type ApiRequestRecordWithCache<T> = [Record: T, ETag: string]
