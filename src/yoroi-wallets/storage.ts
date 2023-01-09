import AsyncStorage from '@react-native-async-storage/async-storage'

import {parseSafe} from './utils/parsing'

export type Storage = ReturnType<typeof mountStorage>

export type Prefix = `${string}/`

export const mountStorage = (prefix: Prefix) => {
  const withPrefix = (key: string) => `${prefix}${key}` as `${Prefix}${string}`
  const withoutPrefix = (value: string) => value.slice(prefix.length)

  function getItem<T>(key: string, parse: (item: string | null) => T): Promise<T>
  function getItem<T = unknown>(key: string): Promise<T>
  async function getItem(key: string, parse = parseSafe) {
    const item = await AsyncStorage.getItem(withPrefix(key))
    return parse(item)
  }

  function multiGet<T>(keys: Array<string>, parse: (item: string | null) => T): Promise<Array<[string, T]>>
  function multiGet<T = unknown>(keys: Array<string>): Promise<Array<[string, T]>>
  async function multiGet(keys: Array<string>, parse = parseSafe) {
    const prefixedKeys = keys.map((key) => withPrefix(key))
    const items = await AsyncStorage.multiGet(prefixedKeys)
    return items.map(([key, value]) => [withoutPrefix(key), parse(value)] as const)
  }

  return {
    getItem,
    multiGet,
    setItem: (key: string, value: unknown) => {
      const item = JSON.stringify(value)
      return AsyncStorage.setItem(withPrefix(key), item)
    },
    multiSet: (tuples: Array<[key: string, value: unknown]>) => {
      const items = tuples.map(([key, value]) => [withPrefix(key), JSON.stringify(value)])
      return AsyncStorage.multiSet(items)
    },
    removeItem: (key: string) => {
      return AsyncStorage.removeItem(withPrefix(key))
    },
    multiRemove: (keys: Array<string>) => {
      return AsyncStorage.multiRemove(keys.map((key) => withPrefix(key)))
    },
    getAllKeys: () => {
      return AsyncStorage.getAllKeys()
        .then((keys) => keys.filter((key) => key.startsWith(prefix)))
        .then((filteredKeys) => filteredKeys.map(withoutPrefix))
    },
    clear: async () => {
      const keys = await AsyncStorage.getAllKeys()
      const filteredKeys = keys.filter((key) => key.startsWith(prefix))

      return AsyncStorage.multiRemove(filteredKeys)
    },
  }
}
