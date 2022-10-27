import type {UtxoStorage} from '@emurgo/yoroi-lib'
import {UtxoModels} from '@emurgo/yoroi-lib'

import storageLegacy from '../../legacy/storage'

export type UtxoStorageItem = {
  utxoAtSafePoint: UtxoModels.UtxoAtSafePoint
  utxoDiffToBestBlock: UtxoModels.UtxoDiffToBestBlock[]
}

export const generateUtxoStorage = (storage: typeof storageLegacy, storagePath: string): UtxoStorage => {
  const getAllUtxosData = async (): Promise<UtxoStorageItem> => {
    const data = await storage.read<UtxoStorageItem>(storagePath)
    return data
  }

  const getUtxoDiffToBestBlock = async (): Promise<UtxoModels.UtxoDiffToBestBlock[]> => {
    const {utxoDiffToBestBlock} = await storage.read<UtxoStorageItem>(storagePath)

    if (!utxoDiffToBestBlock) return []

    return utxoDiffToBestBlock
  }

  const setUtxoDiffToBestBlock = async (utxoDiffToBestBlock: UtxoModels.UtxoDiffToBestBlock[]): Promise<void> => {
    const data = await getAllUtxosData()
    const newData = {
      ...data,
      utxoDiffToBestBlock,
    }

    await storage.write(storagePath, newData)
  }

  const getUtxoAtSafePoint = async (): Promise<UtxoModels.UtxoAtSafePoint | undefined> => {
    const {utxoAtSafePoint} = await storage.read<UtxoStorageItem>(storagePath)

    return utxoAtSafePoint
  }

  const setUtxoAtSafePoint = async (utxoAtSafePoint: UtxoModels.UtxoAtSafePoint): Promise<void> => {
    const data = await getAllUtxosData()
    const newData = {
      ...data,
      utxoAtSafePoint,
    }

    await storage.write(storagePath, newData)
  }

  const replaceUtxoAtSafePoint = async (utxos: UtxoModels.Utxo[], safeBlockHash: string): Promise<void> => {
    const utxoAtSafePoint: UtxoModels.UtxoAtSafePoint = {
      lastSafeBlockHash: safeBlockHash,
      utxos,
    }

    await setUtxoAtSafePoint(utxoAtSafePoint)
  }

  const clearUtxoState = async (): Promise<void> => {
    return storage.remove(storagePath)
  }

  const appendUtxoDiffToBestBlock = async (diff: UtxoModels.UtxoDiffToBestBlock): Promise<void> => {
    const currentDiffs = await getUtxoDiffToBestBlock()

    if (!currentDiffs.find((d) => d.lastBestBlockHash === diff.lastBestBlockHash)) {
      currentDiffs.push(diff)

      await setUtxoDiffToBestBlock(currentDiffs)
    }
  }

  const removeDiffWithBestBlock = async (blockHash: string): Promise<void> => {
    const currentDiffs = await getUtxoDiffToBestBlock()
    const diffToRemove = currentDiffs.find((d) => d.lastBestBlockHash === blockHash) as UtxoModels.UtxoDiffToBestBlock

    const index = currentDiffs.indexOf(diffToRemove)
    if (index > -1) {
      currentDiffs.splice(index, 1)
    }

    await setUtxoDiffToBestBlock(currentDiffs)
  }

  return {
    getUtxoAtSafePoint,
    getUtxoDiffToBestBlock,
    replaceUtxoAtSafePoint,
    clearUtxoState,
    appendUtxoDiffToBestBlock,
    removeDiffWithBestBlock,
  }
}
