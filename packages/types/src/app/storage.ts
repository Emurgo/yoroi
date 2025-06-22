import {Subscription} from 'rxjs'

import {MaybePromise} from '../helpers/types'

export type AppStorageFolderName = `${string}/`

export interface AppStorage<
  IsAsync extends boolean = true,
  Key extends string = string,
> {
  join: (folderName: AppStorageFolderName) => AppStorage<IsAsync, Key>
  getItem: <T = unknown, K extends string = Key>(
    key: K,
    parse?: (item: string | null) => T | null,
  ) => MaybePromise<T | null, IsAsync>
  multiGet: <T = unknown, K extends string = Key>(
    keys: ReadonlyArray<K>,
    parse?: (item: string | null) => T | null,
  ) => MaybePromise<ReadonlyArray<[K, T | null]>, IsAsync>
  setItem: <T = unknown, K extends string = Key>(
    key: K,
    value: T,
    stringify?: (data: T) => string,
  ) => MaybePromise<void, IsAsync>
  multiSet: <T = unknown, K extends string = Key>(
    tuples: ReadonlyArray<[key: K, value: T]>,
    stringify?: (data: T) => string,
  ) => MaybePromise<void, IsAsync>
  removeItem: <K extends string = Key>(key: K) => MaybePromise<void, IsAsync>
  removeFolder: (
    folderName: AppStorageFolderName,
  ) => MaybePromise<void, IsAsync>
  multiRemove: <K extends string = Key>(
    keys: ReadonlyArray<K>,
  ) => MaybePromise<void, IsAsync>
  getAllKeys: <K extends string = Key>() => MaybePromise<
    ReadonlyArray<K>,
    IsAsync
  >
  clear: () => MaybePromise<void, IsAsync>
}

export type AppStorageKeyManager<
  T = unknown,
  R = T,
  Key extends string = string,
> = {
  save: (value: R) => void
  read: () => T
  remove: () => void
  subscribe: (callback: () => void) => Subscription
  key: Key
}
