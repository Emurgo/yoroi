import {App} from '@yoroi/types'

import {freeze} from 'immer'

export const storageKeyMaker =
  <IsAsync extends boolean = false, Key extends string = string>(
    storage: Readonly<App.ObservableStorage<IsAsync, Key>>,
  ) =>
  <Data, AtRest = Data>({
    key,
    parser,
  }: {
    key: Key
    parser: (data: unknown) => Data
  }): Readonly<App.StorageKeyManager<Data, AtRest, Key>> => {
    const save = (value: AtRest) => storage.setItem<AtRest>(key, value)
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
