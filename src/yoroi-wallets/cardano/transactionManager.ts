import {Storage} from '../storage'
import {BackendConfig, Transactions} from '../types'
import {PerAddressCertificatesDict, TransactionCache} from './shelley'

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
            memo: memos[txId],
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
    saveMemo: (txId: string, memo: string): Promise<void> => memosManager.saveMemo(txId, memo),
    clearMemos: (): Promise<void> => memosManager.clear(),
  } as const
}

export type TransactionManager = Awaited<ReturnType<typeof makeTransactionManager>>

export const makeMemosManager = async (storage: Storage) => {
  const getMemos = () => storage.getAllKeys().then(storage.multiGet).then(Object.fromEntries) ?? {}
  let memos = await getMemos()

  const saveMemo = async (txId: string, memo: string): Promise<void> => {
    await storage.setItem(txId, memo)
    memos = await getMemos()
  }

  const clear = async () => {
    await storage.getAllKeys().then(storage.multiRemove)
    memos = {}
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
