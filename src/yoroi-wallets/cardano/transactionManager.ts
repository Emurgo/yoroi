import {Storage} from '../storage'

export const makeTransactionManager = ({storage}: {storage: Storage}) => {
  const memosStorage = storage.join('memos/')

  return {
    saveMemo: (txId: string, memo: string) => memosStorage.setItem(txId, memo),
    readMemo: (txId: string) => memosStorage.getItem(txId),
  }
}
