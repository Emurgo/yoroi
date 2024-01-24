import {AppStorage, AppStorageFolderName} from './storage'
import {Nullable} from '../helpers/types'

export interface AppMultiStorage<T> {
  getAllKeys: () => Promise<ReadonlyArray<string>>
  clear: () => Promise<void>
  saveMany: (data: ReadonlyArray<NonNullable<T>>) => Promise<void>
  readAll: () => Promise<ReadonlyArray<[string, Nullable<T>]>>
  readMany: (
    keys: ReadonlyArray<string>,
  ) => Promise<ReadonlyArray<[string, Nullable<T>]>>
}

export type AppMultiStorageOptions<T> = {
  storage: AppStorage
  dataFolder: AppStorageFolderName
  keyExtractor: keyof T | ((data: NonNullable<T>) => string)
  serializer?: (data: NonNullable<T>) => string
  deserializer?: (data: string | null) => Nullable<T>
}
