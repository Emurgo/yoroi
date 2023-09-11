import {AppStorage, AppStorageFolderName} from './storage'
import {Nullable} from '../helpers/types'

export interface AppMultiStorage<T> {
  getAllKeys: () => Promise<ReadonlyArray<string>>
  clear: () => Promise<void>
  saveMany: (items: ReadonlyArray<NonNullable<T>>) => Promise<void>
  readAll: () => Promise<ReadonlyArray<[string, Nullable<T>]>>
  readMany: (
    keys: ReadonlyArray<string>,
  ) => Promise<ReadonlyArray<[string, Nullable<T>]>>
}

export type AppMultiStorageOptions<T> = {
  storage: AppStorage
  dataFolder: AppStorageFolderName
  keyExtractor: keyof T | ((item: Readonly<NonNullable<T>>) => string)
  serializer?: (item: Readonly<NonNullable<T>>) => string
  deserializer?: (item: string | null) => Readonly<Nullable<T>>
}
