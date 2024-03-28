import {MMKV} from 'react-native-mmkv'
import {App, Nullable} from '@yoroi/types'

import {parseSafe} from '../../helpers/parsers'
import {isFolderKey} from '../helpers/is-folder-key'
import {isFileKey} from '../helpers/is-file-key'

// -------
// FACTORY
export const mountMMKVStorage = (
  path: App.StorageFolderName,
  id: string = 'default.mmkv',
  instance?: MMKV,
): App.Storage<false> => {
  // mmkv uses id as file and the path is irrelevant if sharing content amongst app (iOS)
  // therefore the client needs to know all the ids to delete all data
  // which means that it works differently than AsyncStorage
  // think of the id as the volume
  const storage = instance ?? new MMKV({id})

  const withPath = (key: string) =>
    `${path}${key}` as `${App.StorageFolderName}${string}`
  const withoutPath = (absolutePath: string) => absolutePath.slice(path.length)

  function join(folderToJoin: App.StorageFolderName) {
    return mountMMKVStorage(`${path}${folderToJoin}`, id, storage)
  }

  function getItem<T>(key: string, parse: (item: string | null) => T): T
  function getItem<T = unknown>(key: string): T
  function getItem(key: string, parse = parseSafe) {
    const item = storage.getString(withPath(key)) ?? null
    return parse(item)
  }

  function multiGet<T>(
    keys: ReadonlyArray<string>,
    parse: (item: string | null) => T,
  ): ReadonlyArray<[string, T]>
  function multiGet<T = unknown>(
    keys: ReadonlyArray<string>,
  ): ReadonlyArray<[string, T]>
  function multiGet(keys: ReadonlyArray<string>, parse = parseSafe) {
    const absolutePaths = keys.map((key) => withPath(key))
    return Object.freeze(
      absolutePaths.map((key) => [
        withoutPath(key),
        parse(storage.getString(key) ?? null),
      ]),
    )
  }

  function setItem<T = unknown>(key: string, value: T): void
  function setItem<T = unknown>(
    key: string,
    value: T,
    stringify: (data: T) => string,
  ): void
  function setItem<T = unknown>(
    key: string,
    value: T,
    stringify: (data: T) => string = JSON.stringify,
  ) {
    const item = stringify(value)
    storage.set(withPath(key), item)
  }

  function multiSet(tuples: ReadonlyArray<[key: string, value: unknown]>): void
  function multiSet(
    tuples: ReadonlyArray<[key: string, value: unknown]>,
    stringify: (data: unknown) => string,
  ): void
  function multiSet(
    tuples: ReadonlyArray<[key: string, value: unknown]>,
    stringify: (data: unknown) => string = JSON.stringify,
  ) {
    tuples.forEach(([key, value]) =>
      storage.set(withPath(key), stringify(value)),
    )
  }

  function removeItem(key: string) {
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

  function multiRemove(keys: ReadonlyArray<string>) {
    const absolutePaths = keys.map((key) => withPath(key))
    absolutePaths.forEach((key) => storage.delete(key))
  }

  function getAllKeys() {
    return Object.freeze(
      storage
        .getAllKeys()
        .filter((key) => key.startsWith(path) && isFileKey({key, path}))
        .map(withoutPath),
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

export const mountMMKVMultiStorage = <T = unknown>(
  options: App.MultiStorageOptions<T, false>,
): Readonly<App.MultiStorage<T, false>> => {
  const {
    storage,
    dataFolder,
    keyExtractor,
    serializer = JSON.stringify,
    deserializer = parseSafe as (item: string | null) => Nullable<T>,
  } = options
  const dataStorage = storage.join(dataFolder)
  const {getAllKeys, multiSet, multiGet} = dataStorage

  const clear = () => storage.removeFolder(dataFolder)
  const saveMany = (items: ReadonlyArray<NonNullable<T>>) => {
    const entries: [string, T][] = items.map((item) => {
      if (typeof keyExtractor === 'function') {
        return [keyExtractor(item), item]
      }
      return [String(item[keyExtractor]), item]
    })
    const entriesWithKeys = entries.filter(([key]) => key != null && key !== '')
    return multiSet(entriesWithKeys, serializer as (item: unknown) => string)
  }
  const readAll = () => multiGet<Nullable<T>>(getAllKeys(), deserializer)
  const readMany = (keys: ReadonlyArray<string>) =>
    multiGet<Nullable<T>>(keys, deserializer)
  const removeMany = (keys: ReadonlyArray<string>) =>
    dataStorage.multiRemove(keys)

  return {
    getAllKeys,
    clear,
    readAll,
    saveMany,
    readMany,
    removeMany,
  } as const
}
