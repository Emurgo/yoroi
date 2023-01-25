import {UtxoModels, UtxoStorage} from '@emurgo/yoroi-lib'
import {initUtxo} from '@emurgo/yoroi-lib'
import {Utxo, UtxoAtSafePoint, UtxoDiffToBestBlock} from '@emurgo/yoroi-lib/dist/utxo/models'
import {parseInt} from 'lodash'

import {Storage} from '../storage'
import {RawUtxo} from '../types'
import {parseSafe} from '../utils/parsing'

export const makeUtxoManager = async ({storage, apiUrl}: {storage: Storage; apiUrl: string}) => {
  const managerStorage = makeUtxoManagerStorage(storage)
  const serviceStorage = makeUtxoStorage(storage.join('utxos/'))
  const service = initUtxo(serviceStorage, `${apiUrl}/`)

  let addrCounter = await managerStorage.addrCounter.read()

  const getCachedUtxos = () => service.getAvailableUtxos().then((utxos) => utxos.map(serializer))
  const initialUtxos = await getCachedUtxos()

  // utxo state is related to the addresses used, if it changes a reset is needed
  const sync = (addresses: Array<string>) => {
    if (addresses.length === addrCounter) return service.syncUtxoState(addresses)

    return serviceStorage
      .clearUtxoState()
      .then(() => service.syncUtxoState(addresses))
      .then(() => managerStorage.addrCounter.save(addresses.length))
      .then(() => {
        addrCounter = addresses.length
      })
  }

  return {
    clear: async () => {
      await serviceStorage.clearUtxoState()
      await managerStorage.addrCounter.clear()
    },
    initialUtxos,
    getCachedUtxos,
    sync,
  } as const
}

export const makeUtxoManagerStorage = (storage: Storage) => {
  const addrCounterKey = 'addrCounter'

  return {
    addrCounter: {
      save: (count: number) => storage.setItem(addrCounterKey, count),
      clear: () => storage.removeItem(addrCounterKey),
      read: () => storage.getItem(addrCounterKey, (count) => (count != null ? parseInt(count) : 0)),
    },
  } as const
}

const serializer = (utxo: UtxoModels.Utxo): RawUtxo => ({
  utxo_id: utxo.utxoId,
  tx_hash: utxo.txHash,
  tx_index: utxo.txIndex,
  amount: utxo.amount.toString(),
  receiver: utxo.receiver,
  assets: utxo.assets,
})

export type UtxoManager = Awaited<ReturnType<typeof makeUtxoManager>>

const diffPath = 'diff'
const safePointPath = 'safe-point'

export const makeUtxoStorage = (storage: Storage) => {
  const getUtxoDiffToBestBlock = () => storage.getItem(diffPath, parseDiff).then((diff) => diff ?? [])
  const setUtxoDiffToBestBlock = (utxoDiffToBestBlock: UtxoDiffToBestBlock[]) =>
    storage.setItem(diffPath, utxoDiffToBestBlock)

  const getUtxoAtSafePoint = () => storage.getItem(safePointPath, parseSafePoint)
  const setUtxoAtSafePoint = (utxoAtSafePoint: UtxoAtSafePoint) => storage.setItem(safePointPath, utxoAtSafePoint)

  const utxoStorage: UtxoStorage = {
    getUtxoAtSafePoint,
    replaceUtxoAtSafePoint: (utxos: Utxo[], lastSafeBlockHash: string) =>
      setUtxoAtSafePoint({lastSafeBlockHash, utxos}),

    getUtxoDiffToBestBlock,
    appendUtxoDiffToBestBlock: async (diff: UtxoDiffToBestBlock) => {
      const currentDiffs = await getUtxoDiffToBestBlock()
      if (currentDiffs.find((d) => d.lastBestBlockHash === diff.lastBestBlockHash)) return
      return setUtxoDiffToBestBlock([...currentDiffs, diff])
    },
    removeDiffWithBestBlock: async (blockHash: string) => {
      const currentDiffs = await getUtxoDiffToBestBlock()
      return setUtxoDiffToBestBlock(currentDiffs.filter((d) => d.lastBestBlockHash !== blockHash))
    },

    clearUtxoState: () =>
      Promise.all([storage.removeItem(safePointPath), storage.removeItem(diffPath)]).then(() => undefined),
  }

  return utxoStorage
}

const parseSafePoint = (data: unknown) => {
  const parsed = parseSafe(data)
  return isSafePoint(parsed) ? parsed : undefined
}
const isSafePoint = (data: unknown): data is UtxoAtSafePoint => {
  const candidate = data as UtxoAtSafePoint
  return !!candidate && !!candidate.lastSafeBlockHash && Array.isArray(candidate.utxos)
}

const parseDiff = (data: unknown) => {
  const parsed = parseSafe(data)
  return isDiff(parsed) ? parsed : undefined
}
const isDiff = (data: unknown): data is UtxoDiffToBestBlock[] => {
  const candidate = data as UtxoDiffToBestBlock[]
  return Array.isArray(candidate)
}
