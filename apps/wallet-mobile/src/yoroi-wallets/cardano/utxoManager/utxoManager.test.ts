import {rootStorage} from '@yoroi/common'

import {makeUtxoManagerStorage, makeUtxoStorage} from './utxoManager'

describe('utxo manager storage', () => {
  it('addrCounter works', async () => {
    const storage = rootStorage.join('utxos/')
    const {addrCounter} = makeUtxoManagerStorage(storage)

    // initial
    await addrCounter.read().then((addrCounter) => {
      return expect(addrCounter).toEqual(0)
    })

    await addrCounter.save(1)
    await addrCounter.read().then((addrCounter) => {
      return expect(addrCounter).toEqual(1)
    })

    await addrCounter.clear()
    await addrCounter.read().then((addrCounter) => {
      return expect(addrCounter).toEqual(0)
    })
  })
  it('collateral works', async () => {
    const storage = rootStorage.join('utxos/')
    const {collateral} = makeUtxoManagerStorage(storage)

    // initial
    await collateral.read().then((collateral) => {
      return expect(collateral).toEqual('')
    })

    await collateral.save('id#0')
    await collateral.read().then((collateral) => {
      return expect(collateral).toEqual('id#0')
    })

    await collateral.clear()
    await collateral.read().then((collateral) => {
      return expect(collateral).toEqual('')
    })
  })
})

describe('utxo storage', () => {
  it('works', async () => {
    const storage = rootStorage.join('utxos/')

    const {
      getUtxoDiffToBestBlock,
      getUtxoAtSafePoint,
      replaceUtxoAtSafePoint,
      appendUtxoDiffToBestBlock,
      removeDiffWithBestBlock,
      clearUtxoState,
    } = makeUtxoStorage(storage)

    // initial
    await getUtxoDiffToBestBlock().then((safePoint) => {
      return expect(safePoint).toEqual([])
    })
    await getUtxoAtSafePoint().then((safePoint) => {
      return expect(safePoint).toEqual(undefined)
    })

    await replaceUtxoAtSafePoint(utxoAtSafePoint1.utxos, utxoAtSafePoint1.lastSafeBlockHash)
    await getUtxoAtSafePoint().then((safePoint) => {
      return expect(safePoint).toEqual(utxoAtSafePoint1)
    })

    await replaceUtxoAtSafePoint(utxoAtSafePoint2.utxos, utxoAtSafePoint2.lastSafeBlockHash)
    await getUtxoAtSafePoint().then((safePoint) => {
      return expect(safePoint).toEqual(utxoAtSafePoint2)
    })

    await appendUtxoDiffToBestBlock(utxoDiff1)
    await getUtxoDiffToBestBlock().then((diff) => {
      return expect(diff).toEqual([utxoDiff1])
    })

    // does not append duplicates
    await appendUtxoDiffToBestBlock(utxoDiff1)
    await getUtxoDiffToBestBlock().then((diff) => {
      return expect(diff).toEqual([utxoDiff1])
    })

    await appendUtxoDiffToBestBlock(utxoDiff2)
    await getUtxoDiffToBestBlock().then((diff) => {
      return expect(diff).toEqual([utxoDiff1, utxoDiff2])
    })

    await removeDiffWithBestBlock(utxoDiff2.lastBestBlockHash)
    await getUtxoDiffToBestBlock().then((diff) => {
      return expect(diff).toEqual([utxoDiff1])
    })

    await clearUtxoState()
    await getUtxoAtSafePoint().then((safePoint) => {
      return expect(safePoint).toEqual(undefined)
    })
    await getUtxoDiffToBestBlock().then((diff) => {
      return expect(diff).toEqual([])
    })
  })
})

const utxoAtSafePoint1 = {
  lastSafeBlockHash: 'lastSafeBlockHash - 1',
  utxos: [],
}
const utxoAtSafePoint2 = {
  lastSafeBlockHash: 'lastSafeBlockHash - 2',
  utxos: [],
}

const utxoDiff1 = {
  lastBestBlockHash: 'lastBestBlockHash - 1',
  newUtxos: [],
  spentUtxoIds: [],
}
const utxoDiff2 = {
  lastBestBlockHash: 'lastBestBlockHash - 2',
  spentUtxoIds: [],
  newUtxos: [],
}
