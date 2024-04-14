import {Subscription} from 'rxjs'

import {AppMultiStorage} from './multi-storage'
import {AppStorage} from './storage'

export type AppObservableStorage<
  IsAsync extends boolean = true,
  K extends string = string,
> = AppStorage<IsAsync, K> & {
  onChange: (
    keysToObserve: ReadonlyArray<K>,
    callback: (keys: ReadonlyArray<K> | null) => void,
  ) => Subscription
}

export type AppObservableMultiStorage<
  T,
  IsAsync extends boolean = true,
  K extends string = string,
> = AppMultiStorage<T, IsAsync, K> & {
  onChange: (callback: () => void) => Subscription
}
