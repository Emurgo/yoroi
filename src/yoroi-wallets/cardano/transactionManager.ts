import {Storage} from '../storage'
import {BackendConfig, Transactions} from '../types'
import {TransactionCache} from './shelley'

export const makeTransactionManager = async (storage: Storage, backendConfig: BackendConfig) => {
  const transactionCache = await TransactionCache.create(storage.join('txs/'))
  const memosManager = await makeMemosManager(storage.join('memos/'))

  return {
    // transactionCache api
    getTransactions() {
      const memos = memosManager.getMemos()
      return Object.entries(transactionCache.transactions).reduce(
        (result, [txId, tx]) => ({
          ...result,
          [txId]: {
            ...tx,
            memo: memos[txId] ?? null,
          },
        }),
        {} as Transactions,
      )
    },
    getPerRewardAddressCertificates() {
      return transactionCache.perRewardAddressCertificates
    },
    getPerAddressTxs() {
      return transactionCache.perAddressTxs
    },
    getConfirmationCounts() {
      return transactionCache.confirmationCounts
    },
    clear: () => transactionCache.clear(),
    resetState: () => transactionCache.resetState(),
    subscribe: (handler) => transactionCache.subscribe(handler),
    doSync: async (addressesByChunks: Array<Array<string>>) =>
      transactionCache.doSync(addressesByChunks, backendConfig),

    // memo api
    saveMemo: (txId: string, memo: string) => memosManager.saveMemo(txId, memo),
    clearMemos: () => memosManager.clear(),
  } as const
}

export type TransactionManager = Awaited<ReturnType<typeof makeTransactionManager>>

type Memos = {
  [txId: number]: string
}

export const makeMemosManager = async (storage: Storage) => {
  const getMemos = () => storage.getAllKeys().then(storage.multiGet).then(Object.fromEntries) ?? {}
  let memos: Readonly<Memos> = await getMemos()

  const updateMemos = (txId: string, memo: string) => (memos = {...memos, [txId]: memo})

  const saveMemo = async (txId: string, memo: string): Promise<void> => {
    updateMemos(txId, memo)
    await storage.setItem(txId, memo)
  }

  const clear = async () => {
    memos = {}
    await storage.getAllKeys().then(storage.multiRemove)
  }

  return {
    getMemos() {
      // to get the updated memos
      return memos
    },
    saveMemo,
    clear,
  } as const
}
