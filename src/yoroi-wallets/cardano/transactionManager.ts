import {YoroiStorage} from '../storage'
import {BackendConfig, Transactions} from '../types'
import {isString, parseString} from '../utils/parsing'
import {TransactionCache} from './shelley'

export const makeTransactionManager = async (storage: YoroiStorage, backendConfig: BackendConfig) => {
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
      // to get the updates
      return transactionCache.perRewardAddressCertificates
    },
    getPerAddressTxs() {
      // to get the updates
      return transactionCache.perAddressTxs
    },
    getConfirmationCounts() {
      // to get the updates
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

export const makeMemosManager = async (storage: YoroiStorage) => {
  const getMemos = () =>
    storage
      .getAllKeys()
      .then((keys) => storage.multiGet(keys, parseString))
      .then(filterCorruptEntries)
      .then((tuples) => Object.fromEntries(tuples))

  let memos = await getMemos()

  const updateMemos = (txId: string, memo: string) => (memos = {...memos, [txId]: memo})

  const saveMemo = async (txId: string, memo: string): Promise<void> => {
    await storage.setItem(txId, memo)
    updateMemos(txId, memo)
  }

  const clear = async () => {
    await storage.getAllKeys().then(storage.multiRemove)
    memos = {}
  }

  return {
    getMemos() {
      // to get the updates
      return memos
    },
    saveMemo,
    clear,
  } as const
}

const filterCorruptEntries = (tuples: [string, string | undefined][]) => {
  return tuples.filter((tuple): tuple is [string, string] => isString(tuple[1]))
}
