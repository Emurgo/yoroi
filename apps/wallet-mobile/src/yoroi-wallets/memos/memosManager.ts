import {isString, parseString} from '@yoroi/common'
import {App} from '@yoroi/types'

export const makeMemosManager = async (storage: App.Storage) => {
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

const filterCorruptEntries = (tuples: ReadonlyArray<[string, string | undefined | null]>) => {
  return tuples.filter((tuple): tuple is [string, string] => isString(tuple[1]))
}

export type MemosManager = Awaited<ReturnType<typeof makeMemosManager>>
