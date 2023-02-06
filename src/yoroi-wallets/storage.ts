import AsyncStorage from '@react-native-async-storage/async-storage'

import {parseSafe} from './utils/parsing'

export type YoroiStorage = ReturnType<typeof mountStorage>
export type FolderName = `${string}/`

const mountStorage = (path: FolderName) => {
  const withPath = (key: string) => `${path}${key}` as `${FolderName}${string}`
  const withoutPath = (value: string) => value.slice(path.length)

  function getItem<T>(key: string, parse: (item: string | null) => T): Promise<T>
  function getItem<T = unknown>(key: string): Promise<T>
  async function getItem(key: string, parse = parseSafe) {
    const item = await AsyncStorage.getItem(withPath(key))
    return parse(item)
  }

  function multiGet<T>(keys: Array<string>, parse: (item: string | null) => T): Promise<Array<[string, T]>>
  function multiGet<T = unknown>(keys: Array<string>): Promise<Array<[string, T]>>
  async function multiGet(keys: Array<string>, parse = parseSafe) {
    const absolutePaths = keys.map((key) => withPath(key))
    const items = await AsyncStorage.multiGet(absolutePaths)
    return items.map(([key, value]) => [withoutPath(key), parse(value)] as const)
  }

  return {
    join: (folderName: FolderName) => mountStorage(`${path}${folderName}`),

    getItem,
    multiGet,
    setItem: <T = unknown>(key: string, value: T, stringify: (data: T) => string = JSON.stringify) => {
      const item = stringify(value)
      return AsyncStorage.setItem(withPath(key), item)
    },
    multiSet: (tuples: Array<[key: string, value: unknown]>, stringify: (data: unknown) => string = JSON.stringify) => {
      const items = tuples.map(([key, value]) => [withPath(key), stringify(value)])
      return AsyncStorage.multiSet(items)
    },
    removeItem: (key: string) => {
      return AsyncStorage.removeItem(withPath(key))
    },
    removeFolder: async (folderName: FolderName) => {
      const keys = await AsyncStorage.getAllKeys().then((keys) =>
        keys.filter((key) => {
          return key.startsWith(path) && withoutPath(key).startsWith(folderName) && isFolderKey({key, path})
        }),
      )

      return AsyncStorage.multiRemove(keys)
    },
    multiRemove: (keys: Array<string>) => {
      return AsyncStorage.multiRemove(keys.map((key) => withPath(key)))
    },
    getAllKeys: () => {
      return AsyncStorage.getAllKeys()
        .then((keys) => keys.filter((key) => key.startsWith(path) && isFileKey({key, path})))
        .then((filteredKeys) => filteredKeys.map(withoutPath))
    },
    clear: async () => {
      const keys = await AsyncStorage.getAllKeys()
      const filteredKeys = keys.filter((key) => key.startsWith(path))

      return AsyncStorage.multiRemove(filteredKeys)
    },
  } as const
}

const isFileKey = ({key, path}: {key: string; path: string}) => !key.slice(path.length).includes('/')
const isFolderKey = ({key, path}: {key: string; path: string}) => !isFileKey({key, path})

export const storage = mountStorage('/')
