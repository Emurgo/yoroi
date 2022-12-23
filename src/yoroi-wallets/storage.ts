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
  if (!isValidPath(path)) throw new Error('invalid path')
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
    toAbsolutePath: (filename: string) => toAbsolutePath(storage.path, path, filename),

    async getItem(filename: string) {
      if (!isValidFilename(filename)) throw new Error('invalid filename')
      const absolutePath = toAbsolutePath(storage.path, path, filename)
      return AsyncStorage.getItem(absolutePath)
    },
    async multiGet(filenames: string[]) {
      const absolutePaths = filenames.map((filename) => {
        if (!isValidFilename(filename)) throw new Error('invalid filename')
        return toAbsolutePath(storage.path, path, filename)
      })
      const items = await AsyncStorage.multiGet(absolutePaths)
      return items.map(([absolutePath, file]) => [toFilename(absolutePath), file])
    },

    async setItem(filename: string, file: string) {
      if (!isValidFilename(filename)) throw new Error('invalid filename')
      const absolutePath = toAbsolutePath(storage.path, path, filename)
      return AsyncStorage.setItem(absolutePath, file)
    },
    async multiSet(items: string[][]) {
      const absolutePathItems = items.map(([filename, file]) => {
        if (!isValidFilename(filename)) throw new Error('invalid filename')
        return [toAbsolutePath(storage.path, path, filename), file]
      })
      return AsyncStorage.multiSet(absolutePathItems)
    },

    async removeItem(filename: string) {
      if (!isValidFilename(filename)) throw new Error('invalid filename')
      const absolutePath = toAbsolutePath(storage.path, path, filename)
      return AsyncStorage.removeItem(absolutePath)
    },
    async multiRemove(filenames: string[]) {
      const absolutePaths = filenames.map((filename) => {
        if (!isValidFilename(filename)) throw new Error('invalid filename')
        return toAbsolutePath(storage.path, path, filename)
      })
      return AsyncStorage.multiRemove(absolutePaths)
    },
    async clear() {
      const allKeys = await this.getAllKeys()
      return this.multiRemove(allKeys)
    },

    async getAllKeys() {
      const allKeys = await AsyncStorage.getAllKeys()
      const regex = isRootStorage && isRootPath ? new RegExp(`^/[^/]*$`) : new RegExp(`^${storagePath}/[^/]*$`)

      return allKeys.filter((absolutePath) => absolutePath.match(regex)).map(toFilename)
    },
  }

  return prefixedStorage
}

export const isValidPath = (path: string) => {
  if (path.match(/[\\^$*+?.()|[\]{}]/g)) return false // contains escaping characters
  if (path === '/') return true
  if (path.includes('/')) return false
  if (path === '') return false
  return true
}

export const isValidFilename = (filename: string) => {
  if (filename.match(/[\\^$*+?.()|[\]{}]/g)) return false // contains escaping characters
  if (filename.includes('/')) return false
  if (filename === '') return false
  return true
}

export const toAbsolutePath = (storagePath: string, folderName: string, filename: string) => {
  const isRootStorage = storagePath === '/'
  const isRootFolder = folderName === '/'

  return isRootStorage && isRootFolder
    ? `/${filename}`
    : !isRootStorage && isRootFolder
    ? `${storagePath}/${filename}`
    : isRootStorage && !isRootFolder
    ? `${storagePath}${folderName}/${filename}`
    : `${storagePath}/${folderName}/${filename}`
}

export const toFilename = (absolutePath: string) => {
  const lastSlashIndex = absolutePath.lastIndexOf('/')
  return absolutePath.slice(lastSlashIndex + 1)
}
