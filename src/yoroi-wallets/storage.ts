import AsyncStorage from '@react-native-async-storage/async-storage'

import {parseSafe} from './utils/parsing'

export type Storage = ReturnType<typeof mountStorage>
export type Path = `${string}/`

export const mountStorage = (path: Path) => {
  const withPath = (key: string) => `${path}${key}` as `${Path}${string}`
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
    join: (folderName: Path) => mountStorage(`${path}${folderName}`),

    getItem,
    multiGet,
    setItem: (key: string, value: unknown) => {
      const item = JSON.stringify(value)
      return AsyncStorage.setItem(withPath(key), item)
    },
    multiSet: (tuples: Array<[key: string, value: unknown]>) => {
      const items = tuples.map(([key, value]) => [withPath(key), JSON.stringify(value)])
      return AsyncStorage.multiSet(items)
    },
    removeItem: (key: string) => {
      return AsyncStorage.removeItem(withPath(key))
    },
    multiRemove: (keys: Array<string>) => {
      return AsyncStorage.multiRemove(keys.map((key) => withPath(key)))
    },
    getAllKeys: () => {
      return AsyncStorage.getAllKeys()
        .then((keys) => keys.filter((key) => key.startsWith(path) && isLeafKey({key, path})))
        .then((filteredKeys) => filteredKeys.map(withoutPath))
    },
    clear: async () => {
      const keys = await AsyncStorage.getAllKeys()
      const filteredKeys = keys.filter((key) => key.startsWith(path))

      return AsyncStorage.multiRemove(filteredKeys)
    },
  }
}

const isLeafKey = ({key, path}: {key: string; path: string}) => !key.slice(path.length).includes('/')
