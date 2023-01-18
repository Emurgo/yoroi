import {Storage} from '../storage'

export const makeTransactionManager = ({storage}: {storage: Storage}) => {
  const memo = makeMemoStorage(storage.join('memos/'))

  return {
    memo,
  }
}

export const makeMemoStorage = (storage: Storage) => {
  return {
    save: (txId: string, memo: string) => storage.setItem(txId, memo),
    read: (txId: string) => storage.getItem(txId),
    remove: (txId: string) => storage.removeItem(txId),
    clear: () => storage.clear(),
  }
}
