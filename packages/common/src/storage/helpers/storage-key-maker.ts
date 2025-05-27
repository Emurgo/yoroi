import {App} from '@yoroi/types'
import {freeze} from 'immer'

export const storageKeyMaker =
  <IsAsync extends boolean = false, Key extends string = string>(
    storage: Readonly<App.ObservableStorage<IsAsync, Key>>,
  ) =>
  <Data>({
    key,
    parser,
  }: {
    key: Key
    parser: (data: unknown) => Data
  }): Readonly<App.StorageKeyManager<Data>> => {
    const save = (value: Data) => storage.setItem<Data>(key, value)
    const read = () => storage.getItem<Data>(key, parser) as Data
    const remove = () => storage.removeItem(key)
    const subscribe = (callback: () => void) =>
      storage.onChange([key], callback)

    return freeze({
      save,
      read,
      remove,
      subscribe,
      key,
    })
  }
