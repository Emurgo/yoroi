import {AppMultiStorage} from './multi-storage'
import {AppStorage} from './storage'

export type AppObservableStorage<
  IsAsync extends boolean = true,
  K extends string = string,
> = AppStorage<IsAsync, K> & {
  onUpdate: (
    keysToObserve: ReadonlyArray<K>,
    callback: (keys: ReadonlyArray<K> | null) => void,
  ) => () => void
}

export type AppObservableMultiStorage<
  T,
  IsAsync extends boolean = true,
  K extends string = string,
> = AppMultiStorage<T, IsAsync, K> & {
  onUpdate: (callback: () => void) => () => void
}
