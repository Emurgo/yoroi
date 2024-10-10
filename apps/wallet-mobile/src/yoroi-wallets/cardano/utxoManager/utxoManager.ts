import {initUtxo, UtxoModels, UtxoStorage} from '@emurgo/yoroi-lib'
import {Utxo, UtxoAtSafePoint, UtxoDiffToBestBlock} from '@emurgo/yoroi-lib/dist/utxo/models'
import {isString, parseSafe} from '@yoroi/common'
import {App} from '@yoroi/types'
import {parseInt} from 'lodash'

import {RawUtxo} from '../../types/other'

export const makeUtxoManager = async ({storage, apiUrl}: {storage: App.Storage; apiUrl: string}) => {
  const managerStorage = makeUtxoManagerStorage(storage)
  const serviceStorage = makeUtxoStorage(storage.join('utxos/'))
  const service = initUtxo(serviceStorage, `${apiUrl}/`)

  let addrCounter = await managerStorage.addrCounter.read()

  const getCachedUtxos = () => service.getAvailableUtxos().then((utxos) => utxos.map(serializer))
  const initialUtxos = await getCachedUtxos()

  const getCollateralId = async (): Promise<string> => {
    const collateralId = await managerStorage.collateral.read()
    return collateralId ?? ''
  }

  const initialCollateralId = await getCollateralId()

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
      await managerStorage.collateral.clear()
    },
    initialUtxos,
    getCachedUtxos,
    sync,

    initialCollateralId,
    getCollateralId,
    setCollateralId: (utxoId: RawUtxo['utxo_id']) => managerStorage.collateral.save(utxoId),
  } as const
}

export const makeUtxoManagerStorage = (storage: App.Storage) => {
  const addrCounterKey = 'addrCounter'
  const collateralKey = 'collateral'

  return {
    addrCounter: {
      save: (count: number) => storage.setItem(addrCounterKey, count),
      clear: () => storage.removeItem(addrCounterKey),
      read: () => storage.getItem(addrCounterKey, (count) => (count != null ? parseInt(count) : 0)),
    },
    collateral: {
      save: (utxoId: string) => storage.setItem(collateralKey, utxoId),
      clear: () => storage.removeItem(collateralKey),
      read: () =>
        storage.getItem<string>(collateralKey, (utxoId) => {
          const parsed = parseSafe(utxoId)
          return isString(parsed) ? parsed : ''
        }),
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

export const makeUtxoStorage = (storage: App.Storage) => {
  const getUtxoDiffToBestBlock = () => storage.getItem(diffPath, parseDiff).then((diff) => diff ?? [])
  const setUtxoDiffToBestBlock = (utxoDiffToBestBlock: UtxoDiffToBestBlock[]) =>
    storage.setItem(diffPath, utxoDiffToBestBlock)

  const getUtxoAtSafePoint = async (): Promise<UtxoModels.UtxoAtSafePoint | undefined> => {
    const safePoint = await storage.getItem(safePointPath, parseSafePoint)
    if (!safePoint) return undefined
    return safePoint
  }
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
