import {UtxoStorage} from '@emurgo/yoroi-lib'
import {Utxo, UtxoAtSafePoint, UtxoDiffToBestBlock} from '@emurgo/yoroi-lib/dist/utxo/models'

import storageLegacy from '../../legacy/storage'

export type UtxoStorageItem = {
  utxoAtSafePoint: UtxoAtSafePoint
  utxoDiffToBestBlock: UtxoDiffToBestBlock[]
}

export const generateUtxoStorage = (storage: typeof storageLegacy, storagePath: string) => {
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

    clearUtxoState: () => storage.remove(storagePath),
  }

  return utxoStorage
}
