import {Storage} from '../storage'
import {BackendConfig} from '../types'
import {TransactionCache} from './shelley'

export const makeTransactionManager = async (storage: Storage) => {
  const transactionCache = await TransactionCache.create(storage.join('txs/'))
  const memosManager = await makeMemosManager(storage.join('memos/'))
  await memosManager.updateMemos()

  return {
    // transactionCache api
    get transactions() {
      const txs = {...transactionCache.transactions}
      memosManager.memos.forEach(([address, memo]) => {
        txs[address].memo = memo
      })
      return txs
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


const makeMemosManager = async (storage: Storage) => {
  const getMemos = async () => (await storage.getAllKeys().then(storage.multiGet)) as unknown as Array<[string, string]>
  let memos: Array<[string, string]> = []

  const updateMemos = async () => {
    memos = await getMemos()
  }

  await updateMemos()

  const saveMemo = async (txId: string, memo: string): Promise<void> => {
    await storage.setItem(txId, memo)
    await updateMemos()
  }

  return {
    get memos() {
      return memos
    },
    updateMemos,
    saveMemo,
  }
}
