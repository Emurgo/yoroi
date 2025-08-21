import {App} from '@yoroi/types'

export const extractEntryCacheInfo = <
  T extends App.CacheInfo | null | undefined,
  K extends string,
>([key, value]: [K, T]): [K, App.CacheInfo | null] =>
  value != null
    ? [key, {expires: value.expires, hash: value.hash}]
    : [key, null]
