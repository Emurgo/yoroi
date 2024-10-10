import {MMKV} from 'react-native-mmkv'
import {App} from '@yoroi/types'

import {parseSafe} from '../../utils/parsers'
import {isFolderKey} from '../helpers/is-folder-key'
import {isFileKey} from '../helpers/is-file-key'

export const mountMMKVStorage = <Key extends string = string>(
  {
    path,
    id = 'default.mmkv',
  }: {
    path: App.StorageFolderName
    id?: string
  },
  {instance}: {instance?: MMKV} = {},
): App.Storage<false, Key> => {
  // think of the id as the filename and the path as filter
  const storage = instance ?? new MMKV({id})

  const withPath = (key: string) =>
    `${path}${key}` as `${App.StorageFolderName}${string}`
  const withoutPath = <K extends string = Key>(absolutePath: string): K =>
    absolutePath.slice(path.length) as K

  function join(folderToJoin: App.StorageFolderName) {
    return mountMMKVStorage<Key>(
      {path: `${path}${folderToJoin}`, id},
      {instance: storage},
    )
  }

  function getItem<T, K extends string = Key>(
    key: K,
    deserializer: (item: string | null) => T | null,
  ): T | null
  function getItem<T = unknown, K extends string = Key>(key: K): T | null
  function getItem<K extends string = Key>(key: K, deserializer = parseSafe) {
    const item = storage.getString(withPath(key)) ?? null
    return deserializer(item)
  }

  function multiGet<T, K extends string = Key>(
    keys: ReadonlyArray<K>,
    deserializer: (item: string | null) => T | null,
  ): ReadonlyArray<[K, T | null]>
  function multiGet<T = unknown, K extends string = Key>(
    keys: ReadonlyArray<K>,
  ): ReadonlyArray<[K, T | null]>
  function multiGet<K extends string = Key>(
    keys: ReadonlyArray<K>,
    deserializer = parseSafe,
  ) {
    const absolutePaths = keys.map((key) => withPath(key))
    return Object.freeze(
      absolutePaths.map((key) => [
        withoutPath<K>(key),
        deserializer(storage.getString(key) ?? null),
      ]),
    )
  }

  function setItem<T = unknown, K extends string = Key>(key: K, value: T): void
  function setItem<T = unknown, K extends string = Key>(
    key: K,
    value: T,
    serializer: (data: T) => string,
  ): void
  function setItem<T = unknown, K extends string = Key>(
    key: K,
    value: T,
    serializer: (data: T) => string = JSON.stringify,
  ) {
    const item = serializer(value)
    storage.set(withPath(key), item)
  }

  function multiSet<T = unknown, K extends string = Key>(
    tuples: ReadonlyArray<[key: K, value: T]>,
  ): void
  function multiSet<T = unknown, K extends string = Key>(
    tuples: ReadonlyArray<[key: K, value: T]>,
    serializer: (data: T) => string,
  ): void
  function multiSet<T = unknown, K extends string = Key>(
    tuples: ReadonlyArray<[key: K, value: T]>,
    serializer: (data: T) => string = JSON.stringify,
  ) {
    tuples.forEach(([key, value]) =>
      storage.set(withPath(key), serializer(value)),
    )
  }

  function removeItem<K extends string = Key>(key: K) {
    storage.delete(withPath(key))
  }

  function removeFolder(folderName: App.StorageFolderName) {
    const keys = storage.getAllKeys()
    const filteredKeys = keys.filter(
      (key) =>
        key.startsWith(path) &&
        withoutPath(key).startsWith(folderName) &&
        isFolderKey({key, path}),
    )
    filteredKeys.forEach((key) => storage.delete(key))
  }

  function multiRemove<K extends string = Key>(keys: ReadonlyArray<K>) {
    const absolutePaths = keys.map((key) => withPath(key))
    absolutePaths.forEach((key) => storage.delete(key))
  }

  function getAllKeys<K extends string = Key>() {
    return Object.freeze(
      storage
        .getAllKeys()
        .filter((key) => key.startsWith(path) && isFileKey({key, path}))
        .map(withoutPath<K>),
    )
  }

  function clear() {
    const keys = storage.getAllKeys()
    const filteredKeys = keys.filter((key) => key.startsWith(path))

    filteredKeys.forEach((key) => storage.delete(key))
  }

  return {
    join,
    getItem,
    multiGet,
    setItem,
    multiSet,
    removeItem,
    removeFolder,
    multiRemove,
    getAllKeys,
    clear,
  } as const
}
export const mountMMKVMultiStorage = <T = unknown, K extends string = string>(
  options: App.MultiStorageOptions<T, false, K>,
): Readonly<App.MultiStorage<T, false, K>> => {
  const {
    storage,
    dataFolder,
    keyExtractor,
    serializer = JSON.stringify,
    deserializer = parseSafe as (item: unknown) => T | null,
  } = options
  const dataStorage = storage.join(dataFolder)
  const {getAllKeys, multiSet, multiGet} = dataStorage

  const clear = () => storage.removeFolder(dataFolder)
  const saveMany = (items: ReadonlyArray<NonNullable<T>>) => {
    const entries: [K, T][] = items.map((item) => {
      if (typeof keyExtractor === 'function') {
        return [keyExtractor(item) as K, item]
      }
      return [String(item[keyExtractor]) as K, item]
    })
    const entriesWithKeys = entries.filter(([key]) => key != null && key !== '')
    return multiSet(entriesWithKeys, serializer as (item: unknown) => string)
  }
  const readAll = () => multiGet(getAllKeys(), deserializer)
  const readMany = (keys: ReadonlyArray<K>) => multiGet(keys, deserializer)
  const removeMany = (keys: ReadonlyArray<K>) => dataStorage.multiRemove(keys)

  return {
    getAllKeys,
    clear,
    readAll,
    saveMany,
    readMany,
    removeMany,
  } as const
}
