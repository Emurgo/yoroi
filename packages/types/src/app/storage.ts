export type AppStorageFolderName = `${string}/`

export interface AppStorage {
  join: (folderName: AppStorageFolderName) => AppStorage
  getItem: <T = unknown>(
    key: string,
    parse?: (item: string | null) => T,
  ) => Promise<T>
  multiGet: <T = unknown>(
    keys: ReadonlyArray<string>,
    parse?: (item: string | null) => T,
  ) => Promise<ReadonlyArray<[string, T]>>
  setItem: <T = unknown>(
    key: string,
    value: T,
    stringify?: (data: T) => string,
  ) => Promise<void>
  multiSet: (
    tuples: ReadonlyArray<[key: string, value: unknown]>,
    stringify?: (data: unknown) => string,
  ) => Promise<void>
  removeItem: (key: string) => Promise<void>
  removeFolder: (folderName: AppStorageFolderName) => Promise<void>
  multiRemove: (keys: ReadonlyArray<string>) => Promise<void>
  getAllKeys: () => Promise<ReadonlyArray<string>>
  clear: () => Promise<void>
}
