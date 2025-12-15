export type AppCacheInfo = {
  expires: number
  hash: string
}

export type AppCacheRecord<T> = AppCacheInfo & {
  record: T
}

export type AppCacheRow<T, K extends string = string> = AppCacheRecord<T> & {
  key: K
}
