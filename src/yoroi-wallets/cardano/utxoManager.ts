import {UtxoModels, UtxoStorage} from '@emurgo/yoroi-lib'
import {initUtxo} from '@emurgo/yoroi-lib'
import {Utxo, UtxoAtSafePoint, UtxoDiffToBestBlock} from '@emurgo/yoroi-lib/dist/utxo/models'
import {parseInt} from 'lodash'

import legacyStorage from '../../legacy/storage'
import {makeStorageWithPrefix} from '../storage'
import {RawUtxo} from '../types'

type Storage = typeof legacyStorage
export type UtxoStorageItem = {
  utxoAtSafePoint: UtxoAtSafePoint
  utxoDiffToBestBlock: UtxoDiffToBestBlock[]
}

export const makeUtxoStorage = (storage: Storage, storagePath: string) => {
  const getAllUtxosData = () => storage.read<UtxoStorageItem>(storagePath)

  const setUtxoDiffToBestBlock = async (utxoDiffToBestBlock: UtxoDiffToBestBlock[]) => {
    const data = await getAllUtxosData()

    return storage.write(storagePath, {
      ...data,
      utxoDiffToBestBlock,
    })
  }

  const setUtxoAtSafePoint = async (utxoAtSafePoint: UtxoAtSafePoint) => {
    const data = await getAllUtxosData()

    return storage.write(storagePath, {
      ...data,
      utxoAtSafePoint,
    })
  }

  const utxoStorage: UtxoStorage = {
    getUtxoAtSafePoint: async () => {
      const data = await storage.read<UtxoStorageItem>(storagePath)

      return data?.utxoAtSafePoint
    },
    replaceUtxoAtSafePoint: async (utxos: Utxo[], safeBlockHash: string) => {
      const utxoAtSafePoint = {
        lastSafeBlockHash: safeBlockHash,
        utxos,
      }

      return setUtxoAtSafePoint(utxoAtSafePoint)
    },

    getUtxoDiffToBestBlock: async () => {
      const data = await storage.read<UtxoStorageItem>(storagePath)

      return data?.utxoDiffToBestBlock || []
    },
    appendUtxoDiffToBestBlock: async (diff: UtxoDiffToBestBlock) => {
      const currentDiffs = await utxoStorage.getUtxoDiffToBestBlock()

      if (!currentDiffs.find((d) => d.lastBestBlockHash === diff.lastBestBlockHash)) {
        currentDiffs.push(diff)

        return setUtxoDiffToBestBlock(currentDiffs)
      }
    },
    removeDiffWithBestBlock: async (blockHash: string) => {
      const currentDiffs = await utxoStorage.getUtxoDiffToBestBlock()
      const diffToRemove = currentDiffs.find((d) => d.lastBestBlockHash === blockHash) as UtxoDiffToBestBlock

      const index = currentDiffs.indexOf(diffToRemove)
      if (index > -1) currentDiffs.splice(index, 1)

      return setUtxoDiffToBestBlock(currentDiffs)
    },

    clearUtxoState: async () => {
      await storage.remove(storagePath)
    },
  }

  return utxoStorage
}

const makeUtxoManagerStorage = (prefix: string) => {
  const storage = makeStorageWithPrefix(prefix)
  const addrCounterKey = `addrCounter`
  return {
    addrCounter: {
      save: (addrCounter: number) => storage.setItem(addrCounterKey, addrCounter.toString()),
      clear: async () => {
        await storage.removeItem(addrCounterKey)
      },
      read: async () => storage.getItem(addrCounterKey).then((counter) => (counter != null ? parseInt(counter) : 0)),
    },
  } as const
}

export const makeUtxoManager = async (id: string, apiUrl: string, storage: Storage) => {
  const managerStorage = makeUtxoManagerStorage(`/wallet/${id}/utxosManager/`)
  const serviceStorage = makeUtxoStorage(storage, `/wallet/${id}/utxos`)
  const service = initUtxo(serviceStorage, `${apiUrl}/`)

  let addrCounter = await managerStorage.addrCounter.read()

  const getCachedUtxos = () => service.getAvailableUtxos().then((utxos) => utxos.map(serializer))
  const initialUtxos = await getCachedUtxos()

  // utxo state is related to the addresses used, if it changes a reset is needed
  const sync = async (addresses: Array<string>) => {
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

const serializer = (utxo: UtxoModels.Utxo): RawUtxo => ({
  utxo_id: utxo.utxoId,
  tx_hash: utxo.txHash,
  tx_index: utxo.txIndex,
  amount: utxo.amount.toString(),
  receiver: utxo.receiver,
  assets: utxo.assets,
})

export type UtxoManager = Awaited<ReturnType<typeof makeUtxoManager>>
