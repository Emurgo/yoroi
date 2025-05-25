import {Observable, Subscription} from 'rxjs'

import {AppMultiStorage} from './multi-storage'
import {AppStorage} from './storage'

export type AppObservableStorage<
  IsAsync extends boolean = true,
  Key extends string = string,
> = AppStorage<IsAsync, Key> & {
  onChange: (
    keysToObserve: ReadonlyArray<Key>,
    callback: (keys: ReadonlyArray<Key> | null) => void,
  ) => Subscription
  observable: Observable<Array<Key> | null>
}

export type AppObservableMultiStorage<
  T,
  IsAsync extends boolean = true,
  Key extends string = string,
> = AppMultiStorage<T, IsAsync, Key> & {
  onChange: (callback: () => void) => Subscription
  observable: Observable<Array<Key> | null>
}
