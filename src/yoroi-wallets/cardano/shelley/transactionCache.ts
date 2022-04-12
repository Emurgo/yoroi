/* eslint-disable @typescript-eslint/no-explicit-any */
import {fromPairs, mapValues, max, sum, uniq} from 'lodash'
import {defaultMemoize} from 'reselect'

import * as api from '../../../legacy/api'
import assert from '../../../legacy/assert'
import {CONFIG} from '../../../legacy/config'
import {ApiHistoryError} from '../../../legacy/errors'
import {ObjectValues} from '../../../legacy/flow'
import type {Transaction} from '../../../legacy/HistoryTransaction'
import {TRANSACTION_STATUS} from '../../../legacy/HistoryTransaction'
import {Logger} from '../../../legacy/logging'
import {getCardanoNetworkConfigById} from '../../../legacy/networks'
import {limitConcurrency} from '../../../legacy/promise'
import type {NetworkId, YoroiProvider} from '../../../legacy/types'
import type {RemoteCertificateMeta, TxHistoryRequest} from '../../../legacy/types'
import {CERTIFICATE_KIND} from '../../../legacy/types'

type SyncMetadata = {
  bestBlockNum: number
  bestBlockHash: string | null | undefined
  bestTxHash: string | null | undefined
}
type TransactionCacheState = {
  transactions: Record<string, Transaction>
  perAddressSyncMetadata: Record<string, SyncMetadata>
  bestBlockNum: number | null | undefined // global best block, not per address
}
export type TimeForTx = {
  blockHash: string
  blockNum: number
  txHash: string
  txOrdinal: number
}

const getLatestTransaction: (arg0: Array<Transaction>) => void | TimeForTx = (txs) => {
  const blockInfo: Array<TimeForTx> = []

  for (const tx of txs) {
    if (tx.blockHash != null && tx.txOrdinal != null && tx.blockNum != null) {
      blockInfo.push({
        blockHash: tx.blockHash,
        txHash: tx.id,
        txOrdinal: tx.txOrdinal,
        blockNum: tx.blockNum,
      })
    }
  }

  if (blockInfo.length === 0) {
    return undefined
  }

  let best = blockInfo[0]

  for (let i = 1; i < blockInfo.length; i++) {
    if (blockInfo[i].blockNum > best.blockNum) {
      best = blockInfo[i]
      continue
    }

    if (blockInfo[i].blockNum === best.blockNum) {
      if (blockInfo[i].txOrdinal > best.txOrdinal) {
        best = blockInfo[i]
        continue
      }
    }
  }

  return best
}

const perAddressTxsSelector = (state: TransactionCacheState) => {
  const transactions = state.transactions
  const addressToTxs = {}

  const addTxTo = (txId, addr) => {
    const current = addressToTxs[addr] || []
    const cleared = current.filter((_txId) => txId !== _txId)
    addressToTxs[addr] = [...cleared, txId]
  }

  ObjectValues(transactions).forEach((tx) => {
    tx.inputs.forEach(({address}) => {
      addTxTo(tx.id, address)
    })
    tx.outputs.forEach(({address}) => {
      addTxTo(tx.id, address)
    })
  })
  return addressToTxs
}

export type TimestampedCertMeta = {
  submittedAt: string
  epoch: number
  certificates: Array<RemoteCertificateMeta>
}
type PerAddressCertificatesDict = Record<string, Record<string, TimestampedCertMeta>>

const perAddressCertificatesSelector = (state: TransactionCacheState): PerAddressCertificatesDict => {
  const transactions = state.transactions
  const addressToPerTxCerts = {}

  const addTxTo = (
    txId: string,
    certificates: Array<RemoteCertificateMeta>,
    submittedAt: string | null | undefined,
    epoch: number | null | undefined,
    addr: string,
  ) => {
    const current: Record<string, TimestampedCertMeta> = addressToPerTxCerts[addr] || {}

    if (current[txId] == null && submittedAt != null && epoch != null) {
      current[txId] = {
        submittedAt,
        epoch,
        certificates,
      }
      addressToPerTxCerts[addr] = current
    }
  }

  ObjectValues(transactions).forEach((tx) => {
    tx.certificates.forEach((cert) => {
      if (
        cert.kind === CERTIFICATE_KIND.STAKE_REGISTRATION ||
        cert.kind === CERTIFICATE_KIND.STAKE_DEREGISTRATION ||
        cert.kind === CERTIFICATE_KIND.STAKE_DELEGATION
      ) {
        const {rewardAddress} = cert as any
        addTxTo(tx.id, tx.certificates, tx.submittedAt, tx.epoch, rewardAddress)
      }
    })
  })
  return addressToPerTxCerts
}

const confirmationCountsSelector = (state: TransactionCacheState) => {
  const {perAddressSyncMetadata, transactions} = state
  return mapValues(transactions, (tx: Transaction) => {
    if (tx.status !== TRANSACTION_STATUS.SUCCESSFUL) {
      // TODO(ppershing): do failed transactions have assurance?
      return null
    }

    const getBlockNum = ({address}) =>
      perAddressSyncMetadata[address] ? perAddressSyncMetadata[address].bestBlockNum : 0

    const bestBlockNum: any = max([
      state.bestBlockNum || 0,
      ...tx.inputs.map(getBlockNum),
      ...tx.outputs.map(getBlockNum),
    ])
    assert.assert(tx.blockNum, 'Successfull tx should have blockNum')

    return bestBlockNum - (tx as any).blockNum
  })
}

export type TransactionCacheJSON = TransactionCacheState
export class TransactionCache {
  _state: TransactionCacheState = {
    perAddressSyncMetadata: {},
    transactions: {},
    bestBlockNum: 0,
  }

  _subscriptions: Array<() => any> = []
  _onTxHistoryUpdateSubscriptions: Array<() => any> = []
  _perAddressTxsSelector = defaultMemoize(perAddressTxsSelector)
  _perAddressCertificates = defaultMemoize(perAddressCertificatesSelector)
  _confirmationCountsSelector = defaultMemoize(confirmationCountsSelector)

  subscribe(handler: () => any) {
    this._subscriptions.push(handler)
  }

  notifyOnTxHistoryUpdate = () => {
    this._onTxHistoryUpdateSubscriptions.forEach((handler) => handler())
  }

  subscribeOnTxHistoryUpdate(handler: () => any) {
    this._onTxHistoryUpdateSubscriptions.push(handler)
  }

  updateState(update: TransactionCacheState) {
    Logger.debug('TransactionHistory update state')
    // Logger.debug('Update', update)
    this._state = {...this._state, ...update}

    this._subscriptions.forEach((handler) => handler())
  }

  resetState() {
    this.updateState({
      perAddressSyncMetadata: {},
      transactions: {},
      bestBlockNum: 0,
    })
  }

  get transactions() {
    return this._state.transactions
  }

  get perAddressTxs() {
    return this._perAddressTxsSelector(this._state)
  }

  get perRewardAddressCertificates() {
    return this._perAddressCertificates(this._state)
  }

  get confirmationCounts() {
    return this._confirmationCountsSelector(this._state)
  }

  _getBlockMetadata(addrs: Array<string>) {
    assert.assert(addrs.length, 'getBlockMetadata: addrs not empty')
    const metadata = addrs.map((addr) => this._state.perAddressSyncMetadata[addr])
    const first = metadata[0]

    if (!first) {
      // New addresses
      assert.assert(
        metadata.every((x) => !x),
        'getBlockMetadata: undefined vs defined',
      )
      return {
        bestBlockNum: 0,
        bestBlockHash: null,
        bestTxHash: null,
      }
    } else {
      // Old addresses
      assert.assert(
        metadata.every((x) => x.bestBlockNum === first.bestBlockNum),
        'getBlockMetadata: bestBlockNum metadata same',
      )
      assert.assert(
        metadata.every((x) => x.bestBlockHash === first.bestBlockHash),
        'getBlockMetadata: bestBlockHash metadata same',
      )
      return first
    }
  }

  _buildTxHistoryRequest(
    addresses: Array<string>,
    metadata: SyncMetadata,
    currentBestBlockHash: string | null | undefined,
  ): TxHistoryRequest {
    assert.assert(currentBestBlockHash != null, 'buildTxHistoryRequest: bestBlock not null')

    /* :: if (currentBestBlockHash == null) throw 'assert' */
    const request = {
      addresses,
      untilBlock: currentBestBlockHash,
    }

    if (metadata.bestBlockHash != null && metadata.bestTxHash != null) {
      return {
        ...request,
        after: {
          block: metadata.bestBlockHash,
          tx: metadata.bestTxHash,
        },
      } as any
    }

    return request as any
  }

  _isUpdatedTransaction(tx: Transaction): boolean {
    const id = tx.id

    // We have this transaction and it did not change
    if (this._state.transactions[id] && this._state.transactions[id].lastUpdatedAt === tx.lastUpdatedAt) {
      return false
    }

    if (this._state.transactions[id]) {
      // Do things that matter if the transaction changed!
      Logger.info('Tx changed', tx)
    }

    return true
  }

  // Returns number of updated transactions
  _checkUpdatedTransactions(transactions: Array<Transaction>): number {
    // Currently we do not support two updates inside a same batch
    // (and backend shouldn't support it either)
    assert.assert(
      transactions.length === uniq(transactions.map((tx) => tx.id)).length,
      'Got the same transaction twice in one batch',
      transactions,
    )
    const updated = transactions.map((tx) => this._isUpdatedTransaction(tx))

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (sum as any)(updated, (x) => (x ? 1 : 0))
  }

  async doSyncStep(
    blocks: Array<Array<string>>,
    networkId: NetworkId,
    provider: YoroiProvider | null | undefined,
  ): Promise<boolean> {
    let count = 0
    let wasPaginated = false
    const errors: Array<Error> = []
    const currentBestBlock = await api.getBestBlock(getCardanoNetworkConfigById(networkId, provider).BACKEND)
    const tasks = blocks.map((addrs) => {
      const metadata = this._getBlockMetadata(addrs)

      const historyRequest = this._buildTxHistoryRequest(addrs, metadata, currentBestBlock.hash)

      return () =>
        api
          .fetchNewTxHistory(historyRequest, getCardanoNetworkConfigById(networkId, provider).BACKEND)
          .then((response) => [addrs, response] as const)
    })
    const limit = limitConcurrency(CONFIG.MAX_CONCURRENT_REQUESTS)
    const promises = tasks.map((t) => limit(t))

    // Note(ppershing): This serializes the response order
    // but still allows for concurrent requests
    for (const promise of promises) {
      try {
        const [addrs, response] = await promise
        wasPaginated = wasPaginated || !response.isLast

        const metadata = this._getBlockMetadata(addrs)

        const bestTx = getLatestTransaction(response.transactions)
        // Note: we can update best block number only if we are processing
        // the last page of the history request, see design doc for details
        const newBestBlockNum =
          response.isLast && response.transactions.length ? currentBestBlock.height : metadata.bestBlockNum
        const newMetadata = {
          bestBlockNum: newBestBlockNum,
          bestBlockHash: bestTx?.blockHash,
          bestTxHash: bestTx?.txHash,
        }
        const transactionsUpdate = fromPairs(response.transactions.map((tx) => [tx.id, tx]))
        const metadataUpdate = fromPairs(addrs.map((addr) => [addr, newMetadata]))
        count += this._checkUpdatedTransactions(response.transactions)

        if (count > 0) {
          Logger.info('TransactionCache: notifying subscribers on txs update')
          this.notifyOnTxHistoryUpdate()
        }

        this.updateState({
          transactions: {
            ...this._state.transactions,
            ...transactionsUpdate,
          } as any,
          perAddressSyncMetadata: {
            ...this._state.perAddressSyncMetadata,
            ...metadataUpdate,
          } as any,
          bestBlockNum: currentBestBlock.height,
        })
      } catch (e) {
        if (e instanceof ApiHistoryError) {
          // flush cache to resync
          // (consider only removing cache for current address block)
          this.resetState()
          throw e
        }

        errors.push(e as Error)
      }
    }

    if (errors.length) {
      Logger.error('Sync errors', errors)
      throw errors
    }

    return wasPaginated || count > 0
  }

  toJSON(): TransactionCacheJSON {
    return this._state
  }

  static fromJSON(data: TransactionCacheJSON) {
    const cache = new TransactionCache()
    // if cache is deprecated it means it was obtained when the old history
    // endpoint was still being used (in versions <= 2.2.1)
    // in this case, we do not load the data and start from a fresh object.
    const isDeprecatedCache = ObjectValues(data.perAddressSyncMetadata).some(
      (metadata: any) => metadata.lastUpdated != null,
    )
    // similarly, the haskell shelley endpoint introduces withdrawals & certs.
    // versions < 3.0.1 need resync
    const txs = ObjectValues(data.transactions)
    const lacksShelleyTxData = txs ? txs.some((tx) => tx.withdrawals == null || tx.certificates == null) : false

    if (!isDeprecatedCache && !lacksShelleyTxData) {
      cache.updateState(data)
    } else {
      Logger.info('TransactionCache: deprecated tx. Restoring from empty object')
    }

    return cache
  }
}
