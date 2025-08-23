export type AppCacheInfo = {
  expires: number
  hash: string
}

export interface AppCacheRecord<T> extends AppCacheInfo {
  record: T
}

export interface AppCacheRow<T, K extends string = string>
  extends AppCacheRecord<T> {
  key: K
}
