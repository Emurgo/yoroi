import AsyncStorage, {AsyncStorageStatic} from '@react-native-async-storage/async-storage'
import {Subject} from 'rxjs'

import {PendingTransactions} from '../types/transactions'

export enum StoreKey {
  PendingTx = 'pendingTx',
}

export type VersionableData<T> = {
  version: number
  data: T
}

export type PendingTxStore = VersionableData<PendingTransactions>

export type StoreData<T> = T extends StoreKey.PendingTx ? PendingTxStore : never

export enum StoreMethod {
  Write,
  Remove,
}

export type StoreEvent = {
  key: StoreKey
} & (
  | {
      value: StoreData<StoreKey>
      method: StoreMethod.Write
    }
  | {method: StoreMethod.Remove}
)

export class StoreService {
  private readonly _storage: AsyncStorageStatic
  private readonly _prefix: string
  private readonly _emitter$: Subject<StoreEvent>

  get publisher$() {
    return this._emitter$
  }

  constructor(prefix: string) {
    this._storage = AsyncStorage
    this._prefix = prefix
    this._emitter$ = new Subject<StoreEvent>()
  }

  private _storageKey(key: string) {
    return `${this._prefix}/${key}`
  }

  public async write(key: StoreKey, value: StoreData<typeof key>): Promise<void> {
    const storageKey = this._storageKey(key)

    await this._storage.setItem(storageKey, JSON.stringify(value))

    this._emitter$.next({
      key,
      value,
      method: StoreMethod.Write,
    })
  }

  public async read(key: StoreKey): Promise<StoreData<typeof key> | undefined> {
    const storageKey = this._storageKey(key)

    const value = await this._storage.getItem(storageKey)

    if (value) {
      return JSON.parse(value)
    }
  }

  public async remove(key: StoreKey): Promise<void> {
    const storageKey = this._storageKey(key)

    await this._storage.removeItem(storageKey)

    this._emitter$.next({
      key,
      method: StoreMethod.Remove,
    })
  }

  public destroy() {
    // not unsbuscribing due the chance to throw errors just stop emmiting
    // i.e some screen rerendering
    this._emitter$.complete()
  }
}
