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
    multiGet: async (keys: Readonly<Array<string>>) => {
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
    multiRemove: (keys: Readonly<Array<string>>) => {
      return AsyncStorage.multiRemove(keys.map((key) => withPrefix(key)))
    },
    clear: async () => {
      const keys = await AsyncStorage.getAllKeys()
      const filteredKeys = keys.filter((key) => key.startsWith(prefix))

      return AsyncStorage.multiRemove(filteredKeys)
    },
  }
}
