import {AppStorage, AppStorageFolderName} from './storage'
import {MaybePromise, Nullable} from '../helpers/types'

export interface AppMultiStorage<T, IsAsync extends boolean = true> {
  getAllKeys: () => MaybePromise<ReadonlyArray<string>, IsAsync>
  clear: () => MaybePromise<void, IsAsync>
  saveMany: (data: ReadonlyArray<NonNullable<T>>) => MaybePromise<void, IsAsync>
  readAll: () => MaybePromise<ReadonlyArray<[string, Nullable<T>]>, IsAsync>
  readMany: (
    keys: ReadonlyArray<string>,
  ) => MaybePromise<ReadonlyArray<[string, Nullable<T>]>, IsAsync>
  removeMany: (keys: ReadonlyArray<string>) => MaybePromise<void, IsAsync>
}

export type AppMultiStorageOptions<T, IsAsync extends boolean = true> = {
  storage: AppStorage<IsAsync>
  dataFolder: AppStorageFolderName
  keyExtractor: keyof T | ((data: NonNullable<T>) => string)
  serializer?: (data: NonNullable<T>) => string
  deserializer?: (data: string | null) => Nullable<T>
}
