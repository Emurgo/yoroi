import {AppStorage, AppStorageFolderName} from './storage'
import {Nullable} from '../helpers/types'

export interface AppMultiStorage<T> {
  keys: () => Promise<string[]>
  remove: () => Promise<void>
  save: (data: NonNullable<T>[]) => Promise<void>
  read: () => Promise<[string, Nullable<T>][]>
}

export type AppMultiStorageOptions<T> = {
  storage: AppStorage
  dataFolder: AppStorageFolderName
  keyExtractor: keyof T | ((data: NonNullable<T>) => string)
  serializer?: (data: NonNullable<T>) => string
  deserializer?: (data: string | null) => Nullable<T>
}
