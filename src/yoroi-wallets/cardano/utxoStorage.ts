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

export class UtxoStorage implements UtxoStorage {
  #storage: typeof storageLegacy
  #storagePath: string

  constructor(storage: typeof storageLegacy, storagePath: string) {
    this.#storage = storage
    this.#storagePath = storagePath
  }

  async getUtxoAtSafePoint(): Promise<UtxoAtSafePoint | undefined> {
    const data = await this.#storage.read<UtxoStorageItem>(this.#storagePath)

    if (!data?.utxoAtSafePoint) return undefined

    return data.utxoAtSafePoint
  }

  async setUtxoAtSafePoint(utxoAtSafePoint: UtxoAtSafePoint): Promise<void> {
    const data = (await this.getAllUtxosData()) ?? {}
    const newData = {
      ...data,
      utxoAtSafePoint,
    }

    await this.#storage.write(this.#storagePath, newData)
  }

  async getUtxoDiffToBestBlock(): Promise<UtxoDiffToBestBlock[]> {
    const data = await this.#storage.read<UtxoStorageItem>(this.#storagePath)

    if (!data?.utxoDiffToBestBlock) return []

    return data.utxoDiffToBestBlock
  }

  async setUtxoDiffToBestBlock(utxoDiffToBestBlock: UtxoDiffToBestBlock[]): Promise<void> {
    const data = (await this.getAllUtxosData()) ?? {}
    const newData = {
      ...data,
      utxoDiffToBestBlock,
    }

    await this.#storage.write(this.#storagePath, newData)
  }

  async getAllUtxosData(): Promise<UtxoStorageItem> {
    const utxos = await this.#storage.read<UtxoStorageItem>(this.#storagePath)
    return utxos
  }

  async replaceUtxoAtSafePoint(utxos: Utxo[], safeBlockHash: string): Promise<void> {
    const utxoAtSafePoint: UtxoAtSafePoint = {
      lastSafeBlockHash: safeBlockHash,
      utxos,
    }

    await this.setUtxoAtSafePoint(utxoAtSafePoint)
  }

  async clearUtxoState(): Promise<void> {
    return this.#storage.remove(this.#storagePath)
  }

  async appendUtxoDiffToBestBlock(diff: UtxoDiffToBestBlock): Promise<void> {
    const currentDiffs = await this.getUtxoDiffToBestBlock()

    if (!currentDiffs.find((d) => d.lastBestBlockHash === diff.lastBestBlockHash)) {
      currentDiffs.push(diff)

      await this.setUtxoDiffToBestBlock(currentDiffs)
    }
  }

  async removeDiffWithBestBlock(blockHash: string): Promise<void> {
    const currentDiffs = await this.getUtxoDiffToBestBlock()
    const diffToRemove = currentDiffs.find((d) => d.lastBestBlockHash === blockHash) as UtxoDiffToBestBlock

    const index = currentDiffs.indexOf(diffToRemove)
    if (index > -1) {
      currentDiffs.splice(index, 1)
    }

    await this.setUtxoDiffToBestBlock(currentDiffs)
  }
}
