import AsyncStorage, {AsyncStorageStatic} from '@react-native-async-storage/async-storage'

export type Storage = {
  getItem: AsyncStorageStatic['getItem']
  multiGet: AsyncStorageStatic['multiGet']
  setItem: AsyncStorageStatic['setItem']
  multiSet: AsyncStorageStatic['multiSet']
  removeItem: AsyncStorageStatic['removeItem']
  multiRemove: AsyncStorageStatic['multiRemove']
}

export const makeStorageWithPrefix = (prefix: string): Storage => {
  const withPrefix = (key: string) => `${prefix}/${key}`

  return {
    getItem: (key: string) => {
      return AsyncStorage.getItem(withPrefix(key))
    },
    multiGet: (keys: Array<string>) => {
      return AsyncStorage.multiGet(keys.map((key) => withPrefix(key)))
    },
    setItem: (key: string, value: string) => {
      return AsyncStorage.setItem(withPrefix(key), value)
    },
    multiSet: (items: Array<[string, string]>) => {
      return AsyncStorage.multiSet(items.map(([key, value]) => [withPrefix(key), value]))
    },
    removeItem: (key: string) => {
      return AsyncStorage.removeItem(withPrefix(key))
    },
    multiRemove: (keys: Array<string>) => {
      return AsyncStorage.multiRemove(keys.map((key) => withPrefix(key)))
    },
  }
}
