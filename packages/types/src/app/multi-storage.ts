import {AppStorage, AppStorageFolderName} from './storage'
import {Nullable} from '../helpers/types'

export interface AppMultiStorage<T> {
  getAllKeys: () => Promise<ReadonlyArray<string>>
  clear: () => Promise<void>
  saveMany: (items: NonNullable<T>[]) => Promise<void>
  readAll: () => Promise<[string, Nullable<T>][]>
  readMany: (keys: string[]) => Promise<[string, Nullable<T>][]>
}

export type AppMultiStorageOptions<T> = {
  storage: AppStorage
  dataFolder: AppStorageFolderName
  keyExtractor: keyof T | ((item: NonNullable<T>) => string)
  serializer?: (item: NonNullable<T>) => string
  deserializer?: (item: string | null) => Nullable<T>
}
