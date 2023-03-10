import AsyncStorage from '@react-native-async-storage/async-storage'

import {parseSafe} from '../utils/parsing'

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
    setItem: async <T = unknown>(key: string, value: T, stringify: (data: T) => string = JSON.stringify) => {
      const item = stringify(value)
      await AsyncStorage.setItem(withPath(key), item)
    },
    multiSet: async (
      tuples: Array<[key: string, value: unknown]>,
      stringify: (data: unknown) => string = JSON.stringify,
    ) => {
      const items: Array<[string, string]> = tuples.map(([key, value]) => [withPath(key), stringify(value)])
      await AsyncStorage.multiSet(items)
    },
    removeItem: async (key: string) => {
      await AsyncStorage.removeItem(withPath(key))
    },
    removeFolder: async (folderName: FolderName) => {
      const keys = await AsyncStorage.getAllKeys()
      const filteredKeys = keys.filter(
        (key) => key.startsWith(path) && withoutPath(key).startsWith(folderName) && isFolderKey({key, path}),
      )

      await AsyncStorage.multiRemove(filteredKeys)
    },
    multiRemove: async (keys: Array<string>) => {
      await AsyncStorage.multiRemove(keys.map((key) => withPath(key)))
    },
    getAllKeys: () => {
      return AsyncStorage.getAllKeys()
        .then((keys) => keys.filter((key) => key.startsWith(path) && isFileKey({key, path})))
        .then((filteredKeys) => filteredKeys.map(withoutPath))
    },
    clear: async () => {
      const keys = await AsyncStorage.getAllKeys()
      const filteredKeys = keys.filter((key) => key.startsWith(path))

      await AsyncStorage.multiRemove(filteredKeys)
    },
  } as const
}

const isFileKey = ({key, path}: {key: string; path: string}) => !key.slice(path.length).includes('/')
const isFolderKey = ({key, path}: {key: string; path: string}) => !isFileKey({key, path})

export const storage = mountStorage('/')
