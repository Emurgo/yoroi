import type {App} from '@yoroi/types'

import AsyncStorage from '@react-native-async-storage/async-storage'

import {parseSafe} from '../../utils/parsers'
import {isFileKey} from '../helpers/is-file-key'
import {isFolderKey} from '../helpers/is-folder-key'

export const mountAsyncStorage = ({
  path,
}: {
  path: App.StorageFolderName
}): App.Storage => {
  const withPath = (key: string) =>
    `${path}${key}` as `${App.StorageFolderName}${string}`
  const withoutPath = (value: string) => value.slice(path.length)

  function getItem<T>(
    key: string,
    parse: (item: string | null) => T,
  ): Promise<T>
  function getItem<T = unknown>(key: string): Promise<T>
  async function getItem<T = unknown>(
    key: string,
    parse: (item: string | null) => T = parseSafe as (item: string | null) => T,
  ): Promise<T> {
    const item = await AsyncStorage.getItem(withPath(key))
    return parse(item)
  }

  function multiGet<T>(
    keys: ReadonlyArray<string>,
    parse: (item: string | null) => T,
  ): Promise<Array<[string, T]>>
  function multiGet<T = unknown>(
    keys: ReadonlyArray<string>,
  ): Promise<Array<[string, T]>>
  async function multiGet<T = unknown>(
    keys: ReadonlyArray<string>,
    parse: (item: string | null) => T = parseSafe as (item: string | null) => T,
  ): Promise<Array<[string, T]>> {
    const absolutePaths = keys.map((key) => withPath(key))
    const items = await AsyncStorage.multiGet(absolutePaths)
    return items.map(
      ([key, value]) => [withoutPath(key), parse(value)] as [string, T],
    )
  }

  return {
    join: (folderName: App.StorageFolderName) =>
      mountAsyncStorage({path: `${path}${folderName}`}),

    getItem,
    multiGet,
    setItem: async <T = unknown>(
      key: string,
      value: T,
      stringify: (data: T) => string = JSON.stringify,
    ) => {
      const item = stringify(value)
      await AsyncStorage.setItem(withPath(key), item)
    },
    multiSet: async <T = unknown>(
      tuples: ReadonlyArray<[key: string, value: T]>,
      stringify: (data: T) => string = JSON.stringify,
    ) => {
      const items: Array<[string, string]> = tuples.map(([key, value]) => [
        withPath(key),
        stringify(value),
      ])
      await AsyncStorage.multiSet(items)
    },
    removeItem: async (key: string) => {
      await AsyncStorage.removeItem(withPath(key))
    },
    removeFolder: async (folderName: App.StorageFolderName) => {
      const keys = await AsyncStorage.getAllKeys()
      const filteredKeys = keys.filter(
        (key) =>
          key.startsWith(path) &&
          withoutPath(key).startsWith(folderName) &&
          isFolderKey({key, path}),
      )

      await AsyncStorage.multiRemove(filteredKeys)
    },
    multiRemove: async (keys: ReadonlyArray<string>) => {
      await AsyncStorage.multiRemove(keys.map((key) => withPath(key)))
    },
    getAllKeys: <K extends string = string>() => {
      return AsyncStorage.getAllKeys()
        .then((keys) =>
          keys.filter((key) => key.startsWith(path) && isFileKey({key, path})),
        )
        .then(
          (filteredKeys) =>
            filteredKeys.map(withoutPath) as unknown as ReadonlyArray<K>,
        )
    },
    clear: async () => {
      const keys = await AsyncStorage.getAllKeys()
      const filteredKeys = keys.filter((key) => key.startsWith(path))

      await AsyncStorage.multiRemove(filteredKeys)
    },
  } as const
}

export const mountAsyncMultiStorage = <T = unknown>(
  options: App.MultiStorageOptions<T>,
): Readonly<App.MultiStorage<T>> => {
  const {
    storage,
    dataFolder,
    keyExtractor,
    serializer = JSON.stringify,
    deserializer = parseSafe as (item: string | null) => T | null,
  } = options
  const dataStorage = storage.join(dataFolder)
  const {getAllKeys: getAllKeysStorage, multiSet, multiGet} = dataStorage

  const clear = () => storage.removeFolder(dataFolder)
  const saveMany = (items: ReadonlyArray<NonNullable<T>>) => {
    const entries: [string, T][] = items.map((item) => {
      if (typeof keyExtractor === 'function') {
        return [keyExtractor(item), item]
      }
      return [
        String((item as Record<string, unknown>)[keyExtractor as string]),
        item,
      ]
    })
    const entriesWithKeys = entries.filter(([key]) => key != null && key !== '')
    return multiSet(entriesWithKeys, serializer as (item: unknown) => string)
  }
  const readAll = () =>
    getAllKeysStorage<string>().then((keysToRead: ReadonlyArray<string>) =>
      multiGet<T | null>(keysToRead, deserializer),
    )
  const readMany = (keysToRead: ReadonlyArray<string>) =>
    dataStorage.multiGet<T | null>(keysToRead, deserializer)
  const removeMany = (keysToRead: ReadonlyArray<string>) =>
    dataStorage.multiRemove(keysToRead)
  const getAllKeys = <K extends string = string>() =>
    getAllKeysStorage<K>().then((keys: ReadonlyArray<K>) => keys)

  return {
    getAllKeys,
    clear,
    readAll,
    saveMany,
    readMany,
    removeMany,
  } as const
}
