import {Storage} from '../storage'

export const makeTransactionManager = (storage: Storage) => {
  const memosStorage = storage.join('memos/')

  return {
    saveMemo: (txId: string, memo: string): Promise<void> => memosStorage.setItem(txId, memo),
    readMemo: (txId: string): Promise<string> => memosStorage.getItem(txId),
  } as const
}

export type TransactionManager = ReturnType<typeof makeTransactionManager>
