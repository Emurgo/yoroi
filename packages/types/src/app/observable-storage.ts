import {AppMultiStorage} from './multi-storage'
import {AppStorage} from './storage'

export type AppObservableStorage<IsAsync extends boolean = true> =
  AppStorage<IsAsync> & {
    onUpdate: (
      keysToObserve: ReadonlyArray<string>,
      callback: (keys: ReadonlyArray<string> | null) => void,
    ) => () => void
  }

export type AppObservableMultiStorage<
  T,
  IsAsync extends boolean = true,
> = AppMultiStorage<T, IsAsync> & {
  onUpdate: (callback: () => void) => () => void
}
