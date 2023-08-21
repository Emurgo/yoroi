export type AppStorageFolderName = `${string}/`

export interface AppStorage {
  join: (folderName: AppStorageFolderName) => AppStorage
  getItem: <T = unknown>(
    key: string,
    parse?: (item: string | null) => T,
  ) => Promise<T>
  multiGet: <T = unknown>(
    keys: Array<string>,
    parse?: (item: string | null) => T,
  ) => Promise<Array<[string, T]>>
  setItem: <T = unknown>(
    key: string,
    value: T,
    stringify?: (data: T) => string,
  ) => Promise<void>
  multiSet: (
    tuples: Array<[key: string, value: unknown]>,
    stringify?: (data: unknown) => string,
  ) => Promise<void>
  removeItem: (key: string) => Promise<void>
  removeFolder: (folderName: AppStorageFolderName) => Promise<void>
  multiRemove: (keys: Array<string>) => Promise<void>
  getAllKeys: () => Promise<Array<string>>
  clear: () => Promise<void>
}
