import {AppStorage, AppStorageFolderName} from './storage'
import {MaybePromise, Maybe} from '../helpers/types'

export interface AppMultiStorage<
  T,
  IsAsync extends boolean = true,
  K extends string = string,
> {
  getAllKeys: () => MaybePromise<ReadonlyArray<K>, IsAsync>
  clear: () => MaybePromise<void, IsAsync>
  saveMany: (data: ReadonlyArray<NonNullable<T>>) => MaybePromise<void, IsAsync>
  readAll: () => MaybePromise<ReadonlyArray<[K, Maybe<T>]>, IsAsync>
  readMany: (
    keys: ReadonlyArray<K>,
  ) => MaybePromise<ReadonlyArray<[K, Maybe<T>]>, IsAsync>
  removeMany: (keys: ReadonlyArray<K>) => MaybePromise<void, IsAsync>
}

export type AppMultiStorageOptions<
  T,
  IsAsync extends boolean = true,
  K extends string = string,
> = {
  storage: AppStorage<IsAsync>
  dataFolder: AppStorageFolderName
  keyExtractor: keyof T | ((data: NonNullable<T>) => K)
  serializer?: (data: NonNullable<T>) => string
  deserializer?: (data: string | null) => Maybe<T>
}
