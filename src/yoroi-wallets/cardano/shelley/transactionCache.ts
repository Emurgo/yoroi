/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {fromPairs, mapValues, max} from 'lodash'
import DeviceInfo from 'react-native-device-info'
import {defaultMemoize} from 'reselect'

import assert from '../../../legacy/assert'
import {ApiHistoryError} from '../../../legacy/errors'
import {Logger} from '../../../legacy/logging'
import {Storage} from '../../storage'
import type {RemoteCertificateMeta, TxHistoryRequest} from '../../types'
import {BackendConfig, CERTIFICATE_KIND, RawTransaction, Transaction, TRANSACTION_STATUS} from '../../types/other'
import {parseSafe} from '../../utils/parsing'
import {Version, versionCompare} from '../../utils/versioning'
import * as yoroiApi from '../api'

export type TransactionCacheState = {
  transactions: {[txid: string]: Transaction}
  // @deprecated
  perAddressSyncMetadata: Record<string, SyncMetadata>
  // @deprecated
  bestBlockNum: number | null | undefined // global best block, not per address
}

export class TransactionCache {
  #state: TransactionCacheState
  #subscriptions: Array<(transactions: TransactionCacheState['transactions']) => void> = []
  #perAddressTxsSelector = defaultMemoize(perAddressTxsSelector)
  #perAddressCertificatesSelector = defaultMemoize(perAddressCertificatesSelector)
  #confirmationCountsSelector = defaultMemoize(confirmationCountsSelector)
  #storage: TxCacheStorage

  static async create(storage: Storage) {
    const txStorage = makeTxCacheStorage(storage)
    const version = DeviceInfo.getVersion() as Version
    const isDeprecatedSchema = versionCompare(version, '4.1.0') === -1
    if (isDeprecatedSchema) {
      return new TransactionCache({
        storage: txStorage,
        transactions: {},
      })
    }

    const txs = await txStorage.loadTxs()

    return new TransactionCache({
      storage: txStorage,
      transactions: txs,
    })
  }

  private constructor({storage, transactions}: {storage: TxCacheStorage; transactions: Record<string, Transaction>}) {
    this.#storage = storage
    this.#state = {
      perAddressSyncMetadata: {},
      transactions,
      bestBlockNum: 0,
    }
  }

  subscribe(handler: () => any) {
    this.#subscriptions.push(handler)
  }

  private updateState(update: TransactionCacheState) {
    this.#state = {...this.#state, ...update}
    if (Object.keys(this.#state.transactions).length > 0) {
      this.#storage.saveTxs(this.#state.transactions)
    }
    this.#subscriptions.forEach((handler) => handler(this.#state.transactions))
  }

  resetState() {
    this.updateState({
      perAddressSyncMetadata: {},
      transactions: {},
      bestBlockNum: 0,
    })
  }

  clear() {
    return this.#storage.clear()
  }

  get transactions() {
    return this.#state.transactions
  }

  get perAddressTxs() {
    return this.#perAddressTxsSelector(this.#state)
  }

  get perRewardAddressCertificates() {
    return this.#perAddressCertificatesSelector(this.#state)
  }

  get confirmationCounts() {
    return this.#confirmationCountsSelector(this.#state)
  }

  async doSync(addressesByChunks: Array<Array<string>>, backendConfig: BackendConfig) {
    const txUpdate = await syncTxs({
      addressesByChunks,
      backendConfig,
      transactions: this.#state.transactions,
      api: yoroiApi,
    })

    if (txUpdate) {
      this.updateState({
        transactions: txUpdate,
        // @deprecated
        bestBlockNum: this.#state.bestBlockNum,
        // @deprecated
        perAddressSyncMetadata: this.#state.perAddressSyncMetadata,
      })
    }
  }
}

export async function syncTxs({
  addressesByChunks,
  backendConfig,
  transactions,
  api,
}: Readonly<{
  addressesByChunks: Array<Array<string>>
  backendConfig: BackendConfig
  transactions: Record<string, Transaction>
  api: Pick<typeof yoroiApi, 'getTipStatus' | 'fetchNewTxHistory'>
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

    if (newTxs.length > 0) {
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
    inputs: tx.inputs.map((input) => ({
      address: input.address,
      amount: input.amount,
      assets: (input.assets ?? []).map((asset) => ({
        amount: asset.amount,
        assetId: asset.assetId,
        policyId: asset.policyId,
        name: asset.name,
      })),
    })),
    outputs: tx.outputs.map((output) => ({
      address: output.address,
      amount: output.amount,
      assets: (output.assets ?? []).map((asset) => ({
        amount: asset.amount,
        assetId: asset.assetId,
        policyId: asset.policyId,
        name: asset.name,
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
    collateralInputs: (tx.collateral_inputs ?? []).map((input) => ({
      address: input.address,
      amount: input.amount,
      assets: (input.assets ?? []).map((asset) => ({
        amount: asset.amount,
        assetId: asset.assetId,
        policyId: asset.policyId,
        name: asset.name,
      })),
    })),
  }
}

type TimeForTx = {
  blockHash: string
  blockNum: number
  txHash: string
  txOrdinal: number
}

const perAddressTxsSelector = (state: TransactionCacheState) => {
  const transactions = state.transactions
  const addressToTxs: Record<string, Array<Transaction['id']>> = {}

  const addTxTo = (txId: string, addr: string) => {
    const current = addressToTxs[addr] || ([] as Array<string>)
    const cleared = current.filter((_txId: string) => txId !== _txId)
    addressToTxs[addr] = [...cleared, txId]
  }

  Object.values(transactions).forEach((tx) => {
    tx.inputs.forEach(({address}) => addTxTo(tx.id, address))
    tx.outputs.forEach(({address}) => addTxTo(tx.id, address))
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

  Object.values(transactions).forEach((tx) => {
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

type SyncMetadata = {
  bestBlockNum: number
  bestBlockHash: string | null | undefined
  bestTxHash: string | null | undefined
}

export type TxCacheStorage = {
  loadTxs: () => Promise<Record<string, Transaction>>
  saveTxs: (txs: Record<string, Transaction>) => Promise<void>
  clear: () => Promise<void>
}

export const makeTxCacheStorage = (storage: Storage): TxCacheStorage => ({
  loadTxs: async () => {
    const txids = await storage.getItem('txids', parseTxids)
    if (!txids) return {}
    if (txids.length === 0) return {}

    const tuples = await storage.multiGet(txids, parseTx)

    return tuples.reduce((result: TransactionCacheState['transactions'], [txid, tx]) => {
      if (!tx) {
        Logger.warn('corrupted transaction', {txid})
        return result
      }

      return {...result, [tx.id]: tx}
    }, {})
  },

  saveTxs: async (txs: TransactionCacheState['transactions']) => {
    const items = Object.entries(txs)
    const txids = Object.keys(txs)

    await Promise.all([
      storage.multiSet(items), //
      storage.setItem('txids', txids),
    ])
  },

  clear: () => {
    return storage.clear()
  },
})

const parseTxids = (data: string | null | undefined) => {
  if (!data) return [] // initial
  const txids = parseSafe(data)

  const isTxids = (data: unknown): data is Array<string> =>
    Array.isArray(data) && data.every((item: unknown) => typeof item === 'string')

  return isTxids(txids) ? txids : []
}

const parseTx = (data: string | null | undefined): Transaction | undefined => {
  if (!data) return

  const isTx = (data: unknown): data is Transaction => {
    const tx = data as Transaction

    return (
      exists(tx) &&
      isObject(tx) &&
      isString(tx.id) &&
      isString(tx.status) &&
      isString(tx.lastUpdatedAt) &&
      isArray(tx.inputs) &&
      isArray(tx.outputs) &&
      isArray(tx.certificates) &&
      isArray(tx.withdrawals)
    )
  }

  const tx = parseSafe(data)
  return isTx(tx) ? tx : undefined
}

const exists = <T>(data: unknown): data is NonNullable<T> => !!data
const isObject = (data: unknown): data is object => typeof data === 'object'
const isString = (data: unknown): data is string => typeof data === 'string'
const isArray = (data: unknown): data is Array<unknown> => Array.isArray(data)
