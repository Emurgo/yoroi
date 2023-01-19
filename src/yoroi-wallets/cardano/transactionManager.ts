import {Storage} from '../storage'
import {BackendConfig} from '../types'
import {TransactionCache} from './shelley'

export const makeTransactionManager = async (storage: Storage) => {
  const memosStorage = storage.join('memos/')
  const transactionCache = await TransactionCache.create(storage.join('txs/'), memosStorage)

  return {
    // transactionCache api
    get transactions() {
      return transactionCache.transactions
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
    saveMemo: (txId: string, memo: string): Promise<void> => memosStorage.setItem(txId, memo),
  } as const
}

export type TransactionManager = Awaited<ReturnType<typeof makeTransactionManager>>
