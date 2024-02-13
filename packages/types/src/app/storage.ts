import {MaybePromise} from '../helpers/types'

export type AppStorageFolderName = `${string}/`

export interface AppStorage<IsAsync extends boolean = true> {
  join: (folderName: AppStorageFolderName) => AppStorage<IsAsync>
  getItem: <T = unknown>(
    key: string,
    parse?: (item: string | null) => T,
  ) => MaybePromise<T, IsAsync>
  multiGet: <T = unknown>(
    keys: ReadonlyArray<string>,
    parse?: (item: string | null) => T,
  ) => MaybePromise<ReadonlyArray<[string, T]>, IsAsync>
  setItem: <T = unknown>(
    key: string,
    value: T,
    stringify?: (data: T) => string,
  ) => MaybePromise<void, IsAsync>
  multiSet: (
    tuples: ReadonlyArray<[key: string, value: unknown]>,
    stringify?: (data: unknown) => string,
  ) => MaybePromise<void, IsAsync>
  removeItem: (key: string) => MaybePromise<void, IsAsync>
  removeFolder: (
    folderName: AppStorageFolderName,
  ) => MaybePromise<void, IsAsync>
  multiRemove: (keys: ReadonlyArray<string>) => MaybePromise<void, IsAsync>
  getAllKeys: () => MaybePromise<ReadonlyArray<string>, IsAsync>
  clear: () => MaybePromise<void, IsAsync>
}
