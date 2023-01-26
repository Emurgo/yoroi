import {Storage} from '../storage'
import {BackendConfig} from '../types'
import {TransactionCache} from './shelley'

export const makeTransactionManager = async (storage: Storage) => {
  const transactionCache = await TransactionCache.create(storage.join('txs/'))
  const memosManager = await makeMemosManager(storage.join('memos/'))

  return {
    // transactionCache api
    get transactions() {
      const {memos} = memosManager
      return Object.keys(transactionCache.transactions).reduce(
        (result, current) => ({
          ...result,
          [current]: {
            ...transactionCache.transactions[current],
            memo: memos[current],
          },
        }),
        {},
      )
    },
    get perRewardAddressCertificates() {
      return transactionCache.perRewardAddressCertificates
    },
    get perAddressTxs() {
      return transactionCache.perAddressTxs
    },
    get confirmationCounts() {
      return transactionCache.confirmationCounts
    },
    clear: () => transactionCache.clear(),
    resetState: () => transactionCache.resetState(),
    subscribe: (handler) => transactionCache.subscribe(handler),
    doSync: async (addressesByChunks: Array<Array<string>>, backendConfig: BackendConfig) =>
      transactionCache.doSync(addressesByChunks, backendConfig),

    // memo api
    saveMemo: (txId: string, memo: string): Promise<void> => memosManager.saveMemo(txId, memo),
  } as const
}

export type TransactionManager = Awaited<ReturnType<typeof makeTransactionManager>>

export const makeMemosManager = async (storage: Storage) => {
  const getMemos = async () => storage.getAllKeys().then(storage.multiGet).then(Object.fromEntries)
  let memos = await getMemos()

  const saveMemo = async (txId: string, memo: string): Promise<void> => {
    await storage.setItem(txId, memo)
    memos = await getMemos()
  }

  return {
    get memos() {
      // to get the updated memos
      return memos
    },
    saveMemo,
  }
}
