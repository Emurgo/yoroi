import BigNumber from 'bignumber.js'

import storageLegacy from '../../legacy/storage'

// yoroi-lib copy
export type Asset = {
  assetId: string
  policyId: string
  name: string
  amount: string
}

// yoroi-lib copy
export type Utxo = {
  utxoId: string
  txHash: string
  txIndex: number
  receiver: string
  amount: BigNumber
  assets: Asset[]
  blockNum: number
}

// yoroi-lib copy
export type UtxoAtSafePoint = {
  lastSafeBlockHash: string
  utxos: Utxo[]
}

// yoroi-lib copy
export type UtxoDiffToBestBlock = {
  lastBestBlockHash: string
  spentUtxoIds: string[]
  newUtxos: Utxo[]
}

// yoroi-lib copy
export interface UtxoStorage {
  getUtxoAtSafePoint(): Promise<UtxoAtSafePoint | undefined>
  getUtxoDiffToBestBlock(): Promise<UtxoDiffToBestBlock[]>
  replaceUtxoAtSafePoint(utxos: Utxo[], safeBlockHash: string): Promise<void>
  clearUtxoState(): Promise<void>
  appendUtxoDiffToBestBlock(diff: UtxoDiffToBestBlock): Promise<void>
  removeDiffWithBestBlock(blockHash: string): Promise<void>
}

export type UtxoStorageItem = {
  utxoAtSafePoint: UtxoAtSafePoint
  utxoDiffToBestBlock: UtxoDiffToBestBlock[]
}

export const generateUtxoStorage = (storage: typeof storageLegacy, storagePath: string): UtxoStorage => {
  const getAllUtxosData = async (): Promise<UtxoStorageItem> => {
    const utxos = await storage.read<UtxoStorageItem>(storagePath)
    return utxos
  }

  const getUtxoDiffToBestBlock = async (): Promise<UtxoDiffToBestBlock[]> => {
    const data = await storage.read<UtxoStorageItem>(storagePath)

    if (!data?.utxoDiffToBestBlock) return []

    return data.utxoDiffToBestBlock
  }

  const setUtxoDiffToBestBlock = async (utxoDiffToBestBlock: UtxoDiffToBestBlock[]): Promise<void> => {
    const data = await getAllUtxosData()
    const newData = {
      ...data,
      utxoDiffToBestBlock,
    }

    await storage.write(storagePath, newData)
  }

  const getUtxoAtSafePoint = async (): Promise<UtxoAtSafePoint | undefined> => {
    const data = await storage.read<UtxoStorageItem>(storagePath)

    if (!data?.utxoAtSafePoint) return undefined

    return data.utxoAtSafePoint
  }

  const setUtxoAtSafePoint = async (utxoAtSafePoint: UtxoAtSafePoint): Promise<void> => {
    const data = await getAllUtxosData()
    const newData = {
      ...data,
      utxoAtSafePoint,
    }

    await storage.write(storagePath, newData)
  }

  const replaceUtxoAtSafePoint = async (utxos: Utxo[], safeBlockHash: string): Promise<void> => {
    const utxoAtSafePoint: UtxoAtSafePoint = {
      lastSafeBlockHash: safeBlockHash,
      utxos,
    }

    await setUtxoAtSafePoint(utxoAtSafePoint)
  }

  const clearUtxoState = async (): Promise<void> => {
    return storage.remove(storagePath)
  }

  const appendUtxoDiffToBestBlock = async (diff: UtxoDiffToBestBlock): Promise<void> => {
    const currentDiffs = await getUtxoDiffToBestBlock()

    if (!currentDiffs.find((d) => d.lastBestBlockHash === diff.lastBestBlockHash)) {
      currentDiffs.push(diff)

      await setUtxoDiffToBestBlock(currentDiffs)
    }
  }

  const removeDiffWithBestBlock = async (blockHash: string): Promise<void> => {
    const currentDiffs = await getUtxoDiffToBestBlock()
    const diffToRemove = currentDiffs.find((d) => d.lastBestBlockHash === blockHash) as UtxoDiffToBestBlock

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
