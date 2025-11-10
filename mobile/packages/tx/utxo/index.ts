import {
  groupBy,
  removeItemFromArray,
  sliceArrayUntilItem,
  flatten
} from '@yoroi/common'
import {UtxoApiContract} from './api'
import {BatchedEmurgoUtxoApi, EmurgoUtxoApi} from './emurgo-api'
import {
  DiffType,
  TipStatusReference,
  Utxo,
  UtxoApiResult,
  UtxoAtSafePoint,
  UtxoDiff,
  UtxoDiffItemOutput,
  UtxoDiffToBestBlock
} from './models'

export interface UtxoStorage {
  getUtxoAtSafePoint(): Promise<UtxoAtSafePoint | undefined>
  getUtxoDiffToBestBlock(): Promise<UtxoDiffToBestBlock[]>
  replaceUtxoAtSafePoint(utxos: Utxo[], safeBlockHash: string): Promise<void>
  clearUtxoState(): Promise<void>
  appendUtxoDiffToBestBlock(diff: UtxoDiffToBestBlock): Promise<void>
  removeDiffWithBestBlock(blockHash: string): Promise<void>
}

/*
  safe block:
    is a block arbitrarily considered to be safe,
    meaning we consider the chance of rollbacks that would invalidate this block
    to be extremely low.

  best block:
    current block on tip of the chain

  lastFoundBestBlock:
    used for us to remove diff items which got invalidated.
    lets say we have a diff like: [{..., block: A}, {..., block: B}, {..., block: C}]
    if the lastFoundBestBlock returned in a given request is `B`, it means the diff with the block `C` got invalidated
    and therefore needs to be removed

  lastFoundSafeBlock:
    used for us to merge the diff items we have locally which are now considered to be safe.
    lets say we have a diff like: [{..., block: A}, {..., block: B}, {..., block: C}]
    if the lastFoundSafeBlock returned in a given request is `B`, it means that anything from block `B` and before is now considered safe
    and therefore should be merged into the safe set
 */

export class UtxoService {
  private _api: UtxoApiContract
  private _utxoStorage: UtxoStorage

  constructor(api: UtxoApiContract, utxoStorage: UtxoStorage) {
    this._api = api
    this._utxoStorage = utxoStorage
  }

  async getAvailableUtxos(): Promise<Utxo[]> {
    const utxoSafePoint = await this._utxoStorage.getUtxoAtSafePoint()
    const safeUtxos = utxoSafePoint ? utxoSafePoint.utxos : []

    const diffs = await this._utxoStorage.getUtxoDiffToBestBlock()
    const utxos = safeUtxos.concat(flatten(diffs.map((d) => d.newUtxos)))

    const allSpentUtxoId = flatten(diffs.map((d) => d.spentUtxoIds))
    for (const spendUtxoId of allSpentUtxoId) {
      const utxoToRemove = utxos.find((u) => u.utxoId === spendUtxoId)
      if (utxoToRemove) {
        removeItemFromArray(utxos, utxoToRemove)
      }
    }

    return utxos
  }

  async syncUtxoState(addresses: string[]): Promise<void> {
    const {safeUtxos, diff, bestBlock, localDiff, tipStatus} =
      await this.syncSafeStateAndGetDiff(addresses)

    const groups = groupBy(diff.diffItems, (i) => i.type)

    const diffToBestBlock: UtxoDiffToBestBlock = {
      lastBestBlockHash: bestBlock,
      spentUtxoIds: groups[DiffType.INPUT]
        ? groups[DiffType.INPUT].map((d) => d.id)
        : [],
      newUtxos: groups[DiffType.OUTPUT]
        ? (groups[DiffType.OUTPUT] as UtxoDiffItemOutput[]).map((d) => d.utxo)
        : []
    }

    if (localDiff && localDiff.length > 0) {
      const diffFromBestBlock = localDiff.find(
        (d) => d.lastBestBlockHash === tipStatus.reference.lastFoundBestBlock
      )

      let indexOfDiffFromBestBlock
      if (diffFromBestBlock) {
        indexOfDiffFromBestBlock = localDiff.indexOf(diffFromBestBlock) + 1
      } else {
        // `tipStatus.reference.lastFoundBestBlock` is not in `localDiff`
        // the only possibility is that all txs in `localDiff` are reverted
        // and `tipStatus.reference.lastFoundBestBlock` is current safe block hash
        indexOfDiffFromBestBlock = 0
      }

      for (let i = indexOfDiffFromBestBlock; i < localDiff.length; i++) {
        const diffToRemove = localDiff[i]
        if (!diffToRemove) continue
        await this._utxoStorage.removeDiffWithBestBlock(
          diffToRemove.lastBestBlockHash
        )
      }

      if (diffFromBestBlock) {
        const diffWhichIsNowSafe = localDiff.find(
          (d) => d.lastBestBlockHash === tipStatus.reference.lastFoundSafeBlock
        )

        if (diffWhichIsNowSafe) {
          await this.mergeDiffsIntoSafeUtxoSet(
            safeUtxos,
            localDiff,
            diffWhichIsNowSafe,
            tipStatus.reference.lastFoundSafeBlock
          )
        }
      } // else no need to merge
    }

    await this._utxoStorage.appendUtxoDiffToBestBlock(diffToBestBlock)
  }

  private async syncSafeStateAndGetDiff(addresses: string[]): Promise<{
    safeBlockHash: string
    safeUtxos: Utxo[]
    diff: UtxoDiff
    bestBlock: string
    localDiff: UtxoDiffToBestBlock[]
    tipStatus: TipStatusReference
  }> {
    const {safeBlockHash, safeUtxos} = await this.getUtxoSafePoint(addresses)

    let referenceBlocks = [safeBlockHash]
    const localDiff = await this._utxoStorage.getUtxoDiffToBestBlock()
    if (localDiff && localDiff.length > 0) {
      referenceBlocks = referenceBlocks.concat(
        localDiff.map((d) => d.lastBestBlockHash)
      )
    }

    const tipStatusResponse = await this._api.getTipStatusWithReference(
      referenceBlocks
    )
    if (tipStatusResponse.result === UtxoApiResult.SAFEBLOCK_ROLLBACK) {
      await this._utxoStorage.clearUtxoState()
      return this.syncSafeStateAndGetDiff(addresses)
    }
    const tipStatus = tipStatusResponse.value as TipStatusReference

    const {safeBlockRollback, value} = await this.getUtxoDiffSincePoint(
      addresses,
      referenceBlocks
    )
    if (safeBlockRollback) {
      await this._utxoStorage.clearUtxoState()
      return this.syncSafeStateAndGetDiff(addresses)
    } else {
      if (!value)
        throw new Error(
          'value should not be falsy if safeBlockRollback is false'
        )
      const {diff, bestBlock} = value
      return {
        safeBlockHash,
        safeUtxos,
        diff,
        bestBlock,
        localDiff,
        tipStatus: {
          reference: {
            lastFoundBestBlock: value.diff.reference.lastFoundBestBlock,
            lastFoundSafeBlock:
              value.diff.reference.lastFoundSafeBlock ||
              tipStatus.reference.lastFoundSafeBlock
          }
        }
      }
    }
  }

  private async getUtxoDiffSincePoint(
    addresses: string[],
    afterBestBlocks: string[]
  ): Promise<{
    safeBlockRollback: boolean
    value?: {
      diff: UtxoDiff
      bestBlock: string
    }
  }> {
    const bestBlock = await this._api.getBestBlock()
    const diffResult = await this._api.getUtxoDiffSincePoint({
      addresses: addresses,
      afterBestBlocks: afterBestBlocks,
      untilBlockHash: bestBlock
    })

    if (diffResult.result === UtxoApiResult.BESTBLOCK_ROLLBACK) {
      return this.getUtxoDiffSincePoint(addresses, afterBestBlocks)
    } else if (diffResult.result === UtxoApiResult.SAFEBLOCK_ROLLBACK) {
      return {
        safeBlockRollback: true
      }
    } else {
      if (!diffResult.value)
        throw new Error('value should be defined when result is SUCCESS')
      return {
        safeBlockRollback: false,
        value: {
          diff: diffResult.value,
          bestBlock: bestBlock
        }
      }
    }
  }

  private async mergeDiffsIntoSafeUtxoSet(
    safeUtxos: Utxo[],
    localDiff: UtxoDiffToBestBlock[],
    diffWhichIsNowSafe: UtxoDiffToBestBlock,
    lastFoundSafeBlock: string
  ): Promise<void> {
    // create a map for fetching UTxOs by ID in O(1) complexity
    const utxoMap = safeUtxos.reduce((prev, curr) => {
      prev[curr.utxoId] = curr
      return prev
    }, {} as {[key: string]: Utxo})

    const diffsToMerge = sliceArrayUntilItem(localDiff, diffWhichIsNowSafe)
    for (const diffToMerge of diffsToMerge) {
      for (const newUtxo of diffToMerge.newUtxos) {
        utxoMap[newUtxo.utxoId] = newUtxo
      }

      for (const spentUtxoId of diffToMerge.spentUtxoIds) {
        delete utxoMap[spentUtxoId]
      }

      await this._utxoStorage.removeDiffWithBestBlock(
        diffToMerge.lastBestBlockHash
      )
    }

    const newSafeUtxos = Object.keys(utxoMap)
      .map((k) => utxoMap[k])
      .filter((utxo): utxo is Utxo => utxo !== undefined)
    await this._utxoStorage.replaceUtxoAtSafePoint(
      newSafeUtxos,
      lastFoundSafeBlock
    )
  }

  private async getUtxoSafePoint(addresses: string[]): Promise<{
    safeBlockHash: string
    safeUtxos: Utxo[]
  }> {
    const localSafePoint = await this._utxoStorage.getUtxoAtSafePoint()
    if (!localSafePoint) {
      const {safeBlockHash, utxos} = await this.getUtxoAtSafePointFromApi(
        addresses
      )
      this._utxoStorage.replaceUtxoAtSafePoint(utxos, safeBlockHash)

      return {
        safeBlockHash: safeBlockHash,
        safeUtxos: utxos
      }
    } else {
      return {
        safeBlockHash: localSafePoint.lastSafeBlockHash,
        safeUtxos: localSafePoint.utxos
      }
    }
  }

  private async getUtxoAtSafePointFromApi(addresses: string[]): Promise<{
    safeBlockHash: string
    utxos: Utxo[]
  }> {
    const safeBlock = await this._api.getSafeBlock()
    const utxosResponse = await this._api.getUtxoAtPoint({
      addresses: addresses,
      referenceBlockHash: safeBlock
    })

    if (utxosResponse.result === UtxoApiResult.SAFEBLOCK_ROLLBACK) {
      return await this.getUtxoAtSafePointFromApi(addresses)
    } else {
      if (!utxosResponse.value)
        throw new Error('value should be defined when result is SUCCESS')
      return {
        safeBlockHash: safeBlock,
        utxos: utxosResponse.value
      }
    }
  }
}

/**
 * It builds the UtxoService
 *
 * @param {UtxoStorage} utxoStorage An instance of the UtxoStorage
 * @param {string} apiUrl A base endpoint URL ending with `/`
 * @param {number} [pageSize=50] It caps the number of the records per response
 * @param {number} [maxAddresses=500] It caps the number of addresses per request
 *
 * @returns {UtxoService}
 *
 * @example init(utxoService, 'https://cardano-api.emurgo.com/')
 * @example init(utxoService, 'https://cardano-api.emurgo.com/', 200, 200)
 */
export const init = (
  utxoStorage: UtxoStorage,
  apiUrl: string,
  pageSize = 50,
  maxAddresses = 500
): UtxoService => {
  const utxoApi = new EmurgoUtxoApi(apiUrl, true, pageSize)
  const batchedUtxoApi = new BatchedEmurgoUtxoApi(utxoApi, maxAddresses)
  return new UtxoService(batchedUtxoApi, utxoStorage)
}

