import {PendingTransaction, WalletInterface} from '../types'
import {PendingTxStore, StoreKey} from './store'

export class PendingTxService {
  static storeKey = StoreKey.PendingTx
  static version = 1
  private readonly _wallet: WalletInterface

  constructor(wallet) {
    this._wallet = wallet
  }

  private _readStore() {
    return this._wallet.store.read(PendingTxService.storeKey)
  }

  async readAll() {
    const store = await this._readStore()
    if (!store) return

    return store.data
  }

  async read(id: string) {
    const store = await this._readStore()
    if (!store) return

    return store.data.find((r) => r.id === id)
  }

  async remove(id: string) {
    const store = await this._readStore()
    if (!store) return

    store.data = store.data.filter((r) => r.id !== id)
    return this._wallet.store.write(PendingTxService.storeKey, store)
  }

  async save(record: Readonly<PendingTransaction>) {
    const store = await this._readStore()
    if (store) {
      const index = store.data.findIndex((r) => r.id === record.id)
      if (index >= 0) {
        store.data[index] = record
      } else {
        store.data.push(record)
      }
      return this._wallet.store.write(PendingTxService.storeKey, store)
    }
    const firstData: PendingTxStore = {
      version: PendingTxService.version,
      data: [record],
    }
    return this._wallet.store.write(PendingTxService.storeKey, firstData)
  }
}
