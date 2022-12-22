import AsyncStorage, {AsyncStorageStatic} from '@react-native-async-storage/async-storage'

export type Storage = {
  getItem: AsyncStorageStatic['getItem']
  multiGet: AsyncStorageStatic['multiGet']
  setItem: AsyncStorageStatic['setItem']
  multiSet: AsyncStorageStatic['multiSet']
  removeItem: AsyncStorageStatic['removeItem']
  multiRemove: AsyncStorageStatic['multiRemove']
  clear: AsyncStorageStatic['clear']
}

export const makeStorageWithPrefix = (prefix: string): Storage => {
  const withPrefix = (key: string) => `${prefix}${key}`
  const withoutPrefix = (value: string) => value.slice(prefix.length)

  return {
    getItem: (key: string) => {
      return AsyncStorage.getItem(withPrefix(key))
    },
    multiGet: async (keys: Array<string>) => {
      const prefixedKeys = keys.map((key) => withPrefix(key))
      const items = await AsyncStorage.multiGet(prefixedKeys)

      return items.map(([key, value]) => [withoutPrefix(key), value])
    },
    setItem: (key: string, value: string) => {
      return AsyncStorage.setItem(withPrefix(key), value)
    },
    multiSet: (items: Array<[key: string, value: string]>) => {
      return AsyncStorage.multiSet(items.map(([key, value]) => [withPrefix(key), value]))
    },
    removeItem: (key: string) => {
      return AsyncStorage.removeItem(withPrefix(key))
    },
    multiRemove: (keys: Array<string>) => {
      return AsyncStorage.multiRemove(keys.map((key) => withPrefix(key)))
    },
    clear: async () => {
      const keys = await AsyncStorage.getAllKeys()
      const filteredKeys = keys.filter((key) => key.startsWith(prefix))

      return AsyncStorage.multiRemove(filteredKeys)
    },
  }
}

interface PrefixedStorage extends Omit<AsyncStorageStatic, 'multiMerge' | 'mergeItem'> {
  path: string
  toAbsolutePath: (key: string) => string
}

export const makeRootStorage = (storage: AsyncStorageStatic = AsyncStorage) => {
  return {
    ...storage,
    path: '/',
    toAbsolutePath: (key: string) => `/${key}`,
  }
}

export const debug = async () => {
  const keys = await AsyncStorage.getAllKeys()
  const items = await AsyncStorage.multiGet(keys)

  const data = Object.fromEntries(items)

  return data
}

export const createPrefixedStorage = (options?: {storage?: PrefixedStorage; path?: string}) => {
  const {storage = makeRootStorage(), path = '/'} = options || {}
  if (!validatePath(path)) throw new Error("invalid path: paths may not contain '/'")
  const isRootStorage = storage.path === '/'
  const isRootPath = path === '/'

  const storagePath =
    isRootStorage && isRootPath
      ? '/'
      : !isRootStorage && isRootPath
      ? storage.path
      : isRootStorage && !isRootPath
      ? `${storage.path}${path}`
      : `${storage.path}/${path}`

  const prefixedStorage: PrefixedStorage = {
    path: storagePath,
    toAbsolutePath: (fileName: string) => toAbsolutePath(storage.path, path, fileName),
    async getItem(fileName: string) {
      const absolutePath = toAbsolutePath(storage.path, path, fileName)
      return AsyncStorage.getItem(absolutePath)
    },
    async multiGet(fileNames: string[]) {
      const absolutePaths = fileNames.map((fileName) => toAbsolutePath(storage.path, path, fileName))
      const items = await AsyncStorage.multiGet(absolutePaths)
      return items.map(([absolutePath, file]) => [toFileName(absolutePath), file])
    },

    async setItem(fileName: string, file: string) {
      const absolutePath = toAbsolutePath(storage.path, path, fileName)
      return AsyncStorage.setItem(absolutePath, file)
    },
    async multiSet(items: string[][]) {
      const absolutePathItems = items.map(([fileName, file]) => [toAbsolutePath(storage.path, path, fileName), file])
      return AsyncStorage.multiSet(absolutePathItems)
    },

    async removeItem(fileName: string) {
      const absolutePath = toAbsolutePath(storage.path, path, fileName)
      return AsyncStorage.removeItem(absolutePath)
    },
    async multiRemove(fileNames: string[]) {
      const absolutePaths = fileNames.map((fileName) => toAbsolutePath(storage.path, path, fileName))
      return AsyncStorage.multiRemove(absolutePaths)
    },
    async clear() {
      const allKeys = await this.getAllKeys()
      return this.multiRemove(allKeys)
    },

    async getAllKeys() {
      const allKeys = await AsyncStorage.getAllKeys()
      const regex = isRootStorage && isRootPath ? new RegExp(`^/[^/]*$`) : new RegExp(`^${storagePath}/[^/]*$`)

      return allKeys.filter((absolutePath) => absolutePath.match(regex)).map(toFileName)
    },
  }

  return prefixedStorage
}

export const validatePath = (path: string) => {
  if (path === '/') return true
  if (path.includes('/')) return false
  if (path === '') return false
  return true
}

export const toAbsolutePath = (storagePath: string, folderName: string, fileName: string) => {
  const isRootStorage = storagePath === '/'
  const isRootFolder = folderName === '/'

  return isRootStorage && isRootFolder
    ? `/${fileName}`
    : !isRootStorage && isRootFolder
    ? `${storagePath}/${fileName}`
    : isRootStorage && !isRootFolder
    ? `${storagePath}${folderName}/${fileName}`
    : `${storagePath}/${folderName}/${fileName}`
}

export const toFileName = (absolutePath: string) => {
  const lastSlashIndex = absolutePath.lastIndexOf('/')
  return absolutePath.slice(lastSlashIndex + 1)
}
