import {YoroiStorage} from './storage'
import * as parsing from './utils/parsing'

export const makeMemosManager = async (storage: YoroiStorage) => {
  const getMemos = () =>
    storage
      .getAllKeys()
      .then((keys) => storage.multiGet(keys, parsing.parseString))
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
  return tuples.filter((tuple): tuple is [string, string] => parsing.isString(tuple[1]))
}

export type MemosManager = Awaited<ReturnType<typeof makeMemosManager>>
