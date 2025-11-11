import {
  groupBy,
  removeItemFromArray,
  sliceArrayUntilItem,
  flatten
} from '@yoroi/common'
import {UtxoApiContract} from './api'
import {createBatchedEmurgoUtxoApi, createEmurgoUtxoApi} from './emurgo-api'
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

// Internal helper functions
async function getUtxoAtSafePointFromApi(
  api: UtxoApiContract,
  addresses: string[],
): Promise<{
  safeBlockHash: string
  utxos: Utxo[]
}> {
  const safeBlock = await api.getSafeBlock()
  const utxosResponse = await api.getUtxoAtPoint({
    addresses: addresses,
    referenceBlockHash: safeBlock,
  })

  if (utxosResponse.result === UtxoApiResult.SAFEBLOCK_ROLLBACK) {
    return await getUtxoAtSafePointFromApi(api, addresses)
  } else {
    if (!utxosResponse.value)
      throw new Error('value should be defined when result is SUCCESS')
    return {
      safeBlockHash: safeBlock,
      utxos: utxosResponse.value,
    }
  }
}

async function getUtxoSafePoint(
  api: UtxoApiContract,
  utxoStorage: UtxoStorage,
  addresses: string[],
): Promise<{
  safeBlockHash: string
  safeUtxos: Utxo[]
}> {
  const localSafePoint = await utxoStorage.getUtxoAtSafePoint()
  if (!localSafePoint) {
    const {safeBlockHash, utxos} = await getUtxoAtSafePointFromApi(
      api,
      addresses,
    )
    await utxoStorage.replaceUtxoAtSafePoint(utxos, safeBlockHash)

    return {
      safeBlockHash: safeBlockHash,
      safeUtxos: utxos,
    }
  } else {
    return {
      safeBlockHash: localSafePoint.lastSafeBlockHash,
      safeUtxos: localSafePoint.utxos,
    }
  }
}

async function mergeDiffsIntoSafeUtxoSet(
  _api: UtxoApiContract,
  utxoStorage: UtxoStorage,
  safeUtxos: Utxo[],
  localDiff: UtxoDiffToBestBlock[],
  diffWhichIsNowSafe: UtxoDiffToBestBlock,
  lastFoundSafeBlock: string,
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

    await utxoStorage.removeDiffWithBestBlock(
      diffToMerge.lastBestBlockHash,
    )
  }

  const newSafeUtxos = Object.keys(utxoMap)
    .map((k) => utxoMap[k])
    .filter((utxo): utxo is Utxo => utxo !== undefined)
  await utxoStorage.replaceUtxoAtSafePoint(newSafeUtxos, lastFoundSafeBlock)
}

async function getUtxoDiffSincePoint(
  api: UtxoApiContract,
  addresses: string[],
  afterBestBlocks: string[],
): Promise<{
  safeBlockRollback: boolean
  value?: {
    diff: UtxoDiff
    bestBlock: string
  }
}> {
  const bestBlock = await api.getBestBlock()
  const diffResult = await api.getUtxoDiffSincePoint({
    addresses: addresses,
    afterBestBlocks: afterBestBlocks,
    untilBlockHash: bestBlock,
  })

  if (diffResult.result === UtxoApiResult.BESTBLOCK_ROLLBACK) {
    return getUtxoDiffSincePoint(api, addresses, afterBestBlocks)
  } else if (diffResult.result === UtxoApiResult.SAFEBLOCK_ROLLBACK) {
    return {
      safeBlockRollback: true,
    }
  } else {
    if (!diffResult.value)
      throw new Error('value should be defined when result is SUCCESS')
    return {
      safeBlockRollback: false,
      value: {
        diff: diffResult.value,
        bestBlock: bestBlock,
      },
    }
  }
}

async function syncSafeStateAndGetDiff(
  api: UtxoApiContract,
  utxoStorage: UtxoStorage,
  addresses: string[],
): Promise<{
  safeBlockHash: string
  safeUtxos: Utxo[]
  diff: UtxoDiff
  bestBlock: string
  localDiff: UtxoDiffToBestBlock[]
  tipStatus: TipStatusReference
}> {
  const {safeBlockHash, safeUtxos} = await getUtxoSafePoint(
    api,
    utxoStorage,
    addresses,
  )

  let referenceBlocks = [safeBlockHash]
  const localDiff = await utxoStorage.getUtxoDiffToBestBlock()
  if (localDiff && localDiff.length > 0) {
    referenceBlocks = referenceBlocks.concat(
      localDiff.map((d) => d.lastBestBlockHash),
    )
  }

  const tipStatusResponse = await api.getTipStatusWithReference(referenceBlocks)
  if (tipStatusResponse.result === UtxoApiResult.SAFEBLOCK_ROLLBACK) {
    await utxoStorage.clearUtxoState()
    return syncSafeStateAndGetDiff(api, utxoStorage, addresses)
  }
  const tipStatus = tipStatusResponse.value as TipStatusReference

  const {safeBlockRollback, value} = await getUtxoDiffSincePoint(
    api,
    addresses,
    referenceBlocks,
  )
  if (safeBlockRollback) {
    await utxoStorage.clearUtxoState()
    return syncSafeStateAndGetDiff(api, utxoStorage, addresses)
  } else {
    if (!value)
      throw new Error(
        'value should not be falsy if safeBlockRollback is false',
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
            tipStatus.reference.lastFoundSafeBlock,
        },
      },
    }
  }
}

export const createUtxoService = (
  api: UtxoApiContract,
  utxoStorage: UtxoStorage,
) => {
  return {
    async getAvailableUtxos(): Promise<Utxo[]> {
      const utxoSafePoint = await utxoStorage.getUtxoAtSafePoint()
      const safeUtxos = utxoSafePoint ? utxoSafePoint.utxos : []

      const diffs = await utxoStorage.getUtxoDiffToBestBlock()
      const utxos = safeUtxos.concat(flatten(diffs.map((d) => d.newUtxos)))

      const allSpentUtxoId = flatten(diffs.map((d) => d.spentUtxoIds))
      for (const spendUtxoId of allSpentUtxoId) {
        const utxoToRemove = utxos.find((u) => u.utxoId === spendUtxoId)
        if (utxoToRemove) {
          removeItemFromArray(utxos, utxoToRemove)
        }
      }

      return utxos
    },

    async syncUtxoState(addresses: string[]): Promise<void> {
      const {safeUtxos, diff, bestBlock, localDiff, tipStatus} =
        await syncSafeStateAndGetDiff(api, utxoStorage, addresses)

      const groups = groupBy(diff.diffItems, (i) => i.type)

      const diffToBestBlock: UtxoDiffToBestBlock = {
        lastBestBlockHash: bestBlock,
        spentUtxoIds: groups[DiffType.INPUT]
          ? groups[DiffType.INPUT].map((d) => d.id)
          : [],
        newUtxos: groups[DiffType.OUTPUT]
          ? (groups[DiffType.OUTPUT] as UtxoDiffItemOutput[]).map((d) => d.utxo)
          : [],
      }

      if (localDiff && localDiff.length > 0) {
        const diffFromBestBlock = localDiff.find(
          (d) => d.lastBestBlockHash === tipStatus.reference.lastFoundBestBlock,
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
          await utxoStorage.removeDiffWithBestBlock(
            diffToRemove.lastBestBlockHash,
          )
        }

        if (diffFromBestBlock) {
          const diffWhichIsNowSafe = localDiff.find(
            (d) =>
              d.lastBestBlockHash === tipStatus.reference.lastFoundSafeBlock,
          )

          if (diffWhichIsNowSafe) {
            await mergeDiffsIntoSafeUtxoSet(
              api,
              utxoStorage,
              safeUtxos,
              localDiff,
              diffWhichIsNowSafe,
              tipStatus.reference.lastFoundSafeBlock,
            )
          }
        } // else no need to merge
      }

      await utxoStorage.appendUtxoDiffToBestBlock(diffToBestBlock)
    },
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
 * @returns {ReturnType<typeof createUtxoService>} UtxoService instance
 *
 * @example init(utxoService, 'https://cardano-api.emurgo.com/')
 * @example init(utxoService, 'https://cardano-api.emurgo.com/', 200, 200)
 */
export const init = (
  utxoStorage: UtxoStorage,
  apiUrl: string,
  pageSize = 50,
  maxAddresses = 500,
) => {
  const utxoApi = createEmurgoUtxoApi(apiUrl, true, pageSize)
  const batchedUtxoApi = createBatchedEmurgoUtxoApi(utxoApi, maxAddresses)
  return createUtxoService(batchedUtxoApi, utxoStorage)
}

