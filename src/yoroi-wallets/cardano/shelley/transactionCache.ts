/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {fromPairs, mapValues, max} from 'lodash'
import {defaultMemoize} from 'reselect'

import * as api from '../../../legacy/api'
import assert from '../../../legacy/assert'
import {ApiHistoryError} from '../../../legacy/errors'
import {ObjectValues} from '../../../legacy/flow'
import type {Transaction} from '../../../legacy/HistoryTransaction'
import {TRANSACTION_STATUS} from '../../../legacy/HistoryTransaction'
import {Logger} from '../../../legacy/logging'
import type {BackendConfig, RawTransaction} from '../../../legacy/types'
import type {RemoteCertificateMeta, TxHistoryRequest} from '../../../legacy/types'
import {CERTIFICATE_KIND} from '../../../legacy/types'

type SyncMetadata = {
  bestBlockNum: number
  bestBlockHash: string | null | undefined
  bestTxHash: string | null | undefined
}
type TransactionCacheState = {
  transactions: Record<string, Transaction>
  // @deprecated
  perAddressSyncMetadata: Record<string, SyncMetadata>
  // @deprecated
  bestBlockNum: number | null | undefined // global best block, not per address
}
export type TimeForTx = {
  blockHash: string
  blockNum: number
  txHash: string
  txOrdinal: number
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

  async doSync(addressesByChunks: Array<Array<string>>, backendConfig: BackendConfig) {
    const txUpdate = await syncTxs({
      addressesByChunks,
      backendConfig,
      transactions: this._state.transactions,
    })

    if (txUpdate) {
      this.updateState({
        transactions: txUpdate,
        // @deprecated
        bestBlockNum: this._state.bestBlockNum,
        // @deprecated
        perAddressSyncMetadata: this._state.perAddressSyncMetadata,
      })

      Logger.info('TransactionCache: notifying subscribers on txs update')
      this.notifyOnTxHistoryUpdate()
    }
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

async function syncTxs({
  addressesByChunks,
  backendConfig,
  transactions,
}: Readonly<{
  addressesByChunks: Array<Array<string>>
  backendConfig: BackendConfig
  transactions: Record<string, Transaction>
}>): Promise<Record<string, Transaction> | undefined> {
  const {bestBlock} = await api.getTipStatus(backendConfig)
  if (!bestBlock.hash) return

  // this should change when backend stop throwing when no tx_hash is passed
  // so the last will become the tip and not the last tx submitted which would be faster
  const lastTx = getLatestYoroiTransaction(Object.values(transactions))

  // the way the addresses are arranged are make it slower (getting the same tx twice)
  const tasks = addressesByChunks.map(async (addrs) => {
    const taskResult: Array<Array<RawTransaction>> = []
    let bestTx: TimeForTx | undefined
    let isPaginating = false
    let historyPayload = txHistoryPayloadFactory(
      addrs,
      {
        // tip
        bestBlockNum: bestBlock.height,
        // current - from state txs saved
        bestBlockHash: lastTx?.blockHash,
        bestTxHash: lastTx?.txHash,
      },
      bestBlock.hash!,
    )

    do {
      const response = await api.fetchNewTxHistory(historyPayload, backendConfig)
      taskResult.push(response.transactions)

      // next payload
      isPaginating = !response.isLast
      if (isPaginating) {
        bestTx = getLatestApiTransaction(response.transactions)
        historyPayload = txHistoryPayloadFactory(
          addrs,
          {
            // tip
            bestBlockNum: bestBlock.height,
            // current - from api txs just received
            bestBlockHash: bestTx?.blockHash,
            bestTxHash: bestTx?.txHash,
          },
          bestBlock.hash!,
        )
      }
    } while (isPaginating)

    return taskResult
  })

  try {
    const result = await Promise.all(tasks)
    const newTxs = result.flat(2).map((tx) => [tx.hash, toCachedTx(tx)])
    // .map((tx) => processTxHistoryData(tx, addressesByChunks.flat(), 0, networkId))

    if (newTxs.length) {
      return {...transactions, ...fromPairs(newTxs)}
    }

    return
  } catch (e) {
    if (e instanceof ApiHistoryError) {
      switch ((e as ApiHistoryError).values?.response) {
        // REFERENCE_BEST_BLOCK_MISTMATCH ignore and wait for the next iteration
        // tip forked, but last_tx is still valid
        case ApiHistoryError.errors.REFERENCE_BEST_BLOCK_MISMATCH:
          return

        // REFERENCE_BLOCK_MISTMATCH / REFERENCE_TX_NOT_FOUND tip forked last_tx no longer valid
        // drop everything after last_tx (inclusive) and txs that were not included in any block yet
        // it will cascade back till success
        case ApiHistoryError.errors.REFERENCE_BLOCK_MISMATCH:
        case ApiHistoryError.errors.REFERENCE_TX_NOT_FOUND:
          if (lastTx) {
            const newTxs = fromPairs(
              Object.values(transactions)
                .filter((t) => t.blockNum && t.blockNum < lastTx?.blockNum)
                .map((t) => [t.id, t]),
            )
            return newTxs
          } else {
            Logger.error(`API returned an unexpected error response`)
          }
          break

        // UNKNOWN
        default:
          Logger.error(`API returned an unknown error response: ${e}`)
          return
      }
    }
    Logger.error(`Unknown error: ${e}`)
    return
  }
}

function txHistoryPayloadFactory(addresses: Array<string>, metadata: SyncMetadata, currentBestBlockHash: string) {
  const request: TxHistoryRequest = {
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
    }
  }

  return request
}

function getLatestYoroiTransaction(txs: Array<Transaction>): undefined | TimeForTx {
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

function getLatestApiTransaction(txs: Array<RawTransaction>): undefined | TimeForTx {
  const blockInfo: Array<TimeForTx> = []

  for (const tx of txs) {
    if (tx.block_hash != null && tx.tx_ordinal != null && tx.block_num != null) {
      blockInfo.push({
        blockHash: tx.block_hash,
        txHash: tx.hash,
        txOrdinal: tx.tx_ordinal,
        blockNum: tx.block_num,
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

export function toCachedTx(tx: RawTransaction): Transaction {
  return {
    id: tx.hash,
    type: tx.type,
    fee: tx.fee ?? undefined,
    status: tx.tx_state,
    inputs: tx.inputs.map((i) => ({
      address: i.address,
      amount: i.amount,
      assets: (i.assets ?? []).map((a) => ({
        amount: a.amount,
        assetId: a.assetId,
        policyId: a.policyId,
        name: a.name,
      })),
    })),
    outputs: tx.outputs.map((o) => ({
      address: o.address,
      amount: o.amount,
      assets: (o.assets ?? []).map((a) => ({
        amount: a.amount,
        assetId: a.assetId,
        policyId: a.policyId,
        name: a.name,
      })),
    })),
    lastUpdatedAt: tx.last_update,
    // all of these can be null
    submittedAt: tx.time,
    blockNum: tx.block_num,
    blockHash: tx.block_hash,
    txOrdinal: tx.tx_ordinal,
    epoch: tx.epoch,
    slot: tx.slot,
    withdrawals: tx.withdrawals,
    certificates: tx.certificates,
    validContract: tx.valid_contract,
    scriptSize: tx.script_size,
    collateralInputs: (tx.collateral_inputs ?? []).map((i) => ({
      address: i.address,
      amount: i.amount,
      assets: (i.assets ?? []).map((a) => ({
        amount: a.amount,
        assetId: a.assetId,
        policyId: a.policyId,
        name: a.name,
      })),
    })),
  }
}
