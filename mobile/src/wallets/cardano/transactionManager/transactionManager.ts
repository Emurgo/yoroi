import {RawTransaction, TipStatusResponse, TxHistoryRequest} from '@yoroi/api'
import {PromiseAllLimited, isArray, parseSafe} from '@yoroi/common'
import {RemoteCertificateMeta} from '@yoroi/staking'
import {CertificateKind} from '@yoroi/tx'
import {
  App,
  TRANSACTION_STATUS,
  TransactionStatus,
  Transactions,
  WalletTransaction,
} from '@yoroi/types'

import {fromPairs, mapValues, max} from 'lodash'
import DeviceInfo from 'react-native-device-info'
import {defaultMemoize} from 'reselect'

import {logger} from '~/kernel/logger/logger'
import {Version, versionCompare} from '~/wallets/utils/versioning'

import * as yoroiApi from '../api/api'
import {ApiHistoryError} from '../errors'

type TransactionManagerState = {
  transactions: Transactions
  // @deprecated
  perAddressSyncMetadata: Record<string, SyncMetadata>
  // @deprecated
  bestBlockNum: number | null | undefined // global best block, not per address
}

export class TransactionManager {
  #state: TransactionManagerState
  #subscriptions: Array<
    (transactions: TransactionManagerState['transactions']) => void
  > = []
  #perAddressTxsSelector = defaultMemoize(perAddressTxsSelector)
  #perAddressCertificatesSelector = defaultMemoize(
    perAddressCertificatesSelector,
  )
  #confirmationCountsSelector = defaultMemoize(confirmationCountsSelector)
  #storage: TxManagerStorage

  static async create(storage: App.Storage) {
    const txStorage = makeTxManagerStorage(storage)
    const version = DeviceInfo.getVersion() as Version
    const isDeprecatedSchema = versionCompare(version, '4.1.0') === -1
    if (isDeprecatedSchema) {
      return new TransactionManager({
        storage: txStorage,
        transactions: {},
      })
    }

    const txs = await txStorage.loadTxs()

    return new TransactionManager({
      storage: txStorage,
      transactions: txs,
    })
  }

  private constructor({
    storage,
    transactions,
  }: {
    storage: TxManagerStorage
    transactions: Record<string, WalletTransaction>
  }) {
    this.#storage = storage
    this.#state = {
      perAddressSyncMetadata: {},
      transactions,
      bestBlockNum: 0,
    }
  }

  subscribe(
    handler: (transactions: Record<string, WalletTransaction>) => void,
  ) {
    this.#subscriptions.push(handler)
  }

  private updateState(update: TransactionManagerState) {
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

  async doSync(
    addressesByChunks: Array<Array<string>>,
    baseApiUrl: string,
    walletContext?: {
      walletId: string
      publicKeyHex?: string
      accountPubKeyHex?: string
      paymentKeyHashes: string[]
      rewardAddresses: string[]
    },
    tipStatus?: TipStatusResponse | null,
  ) {
    // Store initial state to restore if sync fails
    const initialState = {
      transactions: {...this.#state.transactions},
    }

    // Callback to update state incrementally as transactions are fetched
    // This updates in-memory state for UI, but we won't save to storage until sync succeeds
    const onBatchProcessed = (batchTxs: Record<string, WalletTransaction>) => {
      const updatedTxs = {...this.#state.transactions, ...batchTxs}
      this.#state = {
        ...this.#state,
        transactions: updatedTxs,
      }
      // Notify subscribers immediately so UI updates
      this.#subscriptions.forEach((handler) =>
        handler(this.#state.transactions),
      )
    }

    try {
      const txUpdate = await syncTxs({
        addressesByChunks,
        baseApiUrl,
        transactions: this.#state.transactions,
        api: yoroiApi,
        onBatchProcessed,
        walletContext,
        tipStatus,
      })

      if (txUpdate) {
        // Sync succeeded - save the updated state to storage
        this.updateState({
          transactions: this.#state.transactions,
          // @deprecated
          bestBlockNum: this.#state.bestBlockNum,
          // @deprecated
          perAddressSyncMetadata: this.#state.perAddressSyncMetadata,
        })
        return true
      }
      // Sync returned undefined (no updates) - state is still valid
      return false
    } catch (error) {
      // Sync failed - restore initial state to avoid saving partial/corrupt data
      this.#state = {
        ...this.#state,
        transactions: initialState.transactions,
      }
      // Notify subscribers of restored state
      this.#subscriptions.forEach((handler) =>
        handler(this.#state.transactions),
      )
      throw error
    }
  }

  /**
   * Quick sync that only fetches the first page of transactions for each address chunk.
   * Used during wallet preparation to make the wallet usable quickly.
   */
  async doQuickSync(
    addressesByChunks: Array<Array<string>>,
    baseApiUrl: string,
    walletContext?: {
      walletId: string
      publicKeyHex?: string
      accountPubKeyHex?: string
      paymentKeyHashes: string[]
      rewardAddresses: string[]
    },
    tipStatus?: TipStatusResponse | null,
  ) {
    // Store initial state to restore if sync fails
    const initialState = {
      transactions: {...this.#state.transactions},
    }

    // Callback to update state incrementally as transactions are fetched
    // This updates in-memory state for UI, but we won't save to storage until sync succeeds
    const onBatchProcessed = (batchTxs: Record<string, WalletTransaction>) => {
      const updatedTxs = {...this.#state.transactions, ...batchTxs}
      this.#state = {
        ...this.#state,
        transactions: updatedTxs,
      }
      // Notify subscribers immediately so UI updates
      this.#subscriptions.forEach((handler) =>
        handler(this.#state.transactions),
      )
    }

    try {
      const txUpdate = await syncTxs({
        addressesByChunks,
        baseApiUrl,
        transactions: this.#state.transactions,
        api: yoroiApi,
        onBatchProcessed,
        maxPagesPerChunk: 1, // Only fetch first page for quick sync
        walletContext,
        tipStatus,
      })

      if (txUpdate) {
        // Sync succeeded - save the updated state to storage
        this.updateState({
          transactions: this.#state.transactions,
          // @deprecated
          bestBlockNum: this.#state.bestBlockNum,
          // @deprecated
          perAddressSyncMetadata: this.#state.perAddressSyncMetadata,
        })
        return true
      }
      // Sync returned undefined (no updates) - state is still valid
      return false
    } catch (error) {
      // Sync failed - restore initial state to avoid saving partial/corrupt data
      this.#state = {
        ...this.#state,
        transactions: initialState.transactions,
      }
      // Notify subscribers of restored state
      this.#subscriptions.forEach((handler) =>
        handler(this.#state.transactions),
      )
      throw error
    }
  }
}

export async function syncTxs({
  addressesByChunks,
  baseApiUrl,
  transactions,
  api,
  onBatchProcessed,
  maxPagesPerChunk,
  walletContext,
  tipStatus,
}: Readonly<{
  addressesByChunks: Array<Array<string>>
  baseApiUrl: string
  transactions: Record<string, WalletTransaction>
  api: Pick<typeof yoroiApi, 'getTipStatus' | 'fetchNewTxHistory'>
  onBatchProcessed?: (batchTxs: Record<string, WalletTransaction>) => void
  maxPagesPerChunk?: number // Limit pagination for quick sync
  walletContext?: {
    walletId: string
    publicKeyHex?: string
    accountPubKeyHex?: string
    paymentKeyHashes: string[]
    rewardAddresses: string[]
  }
  tipStatus?: TipStatusResponse | null
}>): Promise<Record<string, WalletTransaction> | undefined> {
  // Use provided tip status or fetch if not provided (backward compatibility)
  let bestBlock
  if (tipStatus) {
    bestBlock = tipStatus.bestBlock
  } else {
    const tipStatusResponse = await api.getTipStatus(baseApiUrl)
    bestBlock = tipStatusResponse.bestBlock
  }
  if (!bestBlock.hash) return

  // this should change when backend stop throwing when no tx_hash is passed
  // so the last will become the tip and not the last tx submitted which would be faster
  const lastTx = getLatestYoroiTransaction(Object.values(transactions))

  // Validate lastTx has required fields before using it for pagination
  // This prevents sending invalid payloads that cause 500 errors
  const validLastTx = lastTx?.blockHash && lastTx?.txHash ? lastTx : undefined

  // Filter out empty chunks to avoid API errors
  const validChunks = addressesByChunks.filter((addrs) => addrs.length > 0)

  if (validChunks.length === 0) {
    logger.debug('syncTxs: No valid address chunks to sync', {
      totalChunks: addressesByChunks.length,
    })
    return
  }

  // the way the addresses are arranged are make it slower (getting the same tx twice)
  const tasks = validChunks.map((addrs) => {
    const promise = async () => {
      const taskResult: Array<Array<RawTransaction>> = []
      let bestTx: TimeForTx | undefined
      let isPaginating = false
      let historyPayload = txHistoryPayloadFactory(
        addrs,
        {
          // tip
          bestBlockNum: bestBlock.height,
          // current - from state txs saved (only if valid)
          bestBlockHash: validLastTx?.blockHash,
          bestTxHash: validLastTx?.txHash,
        },
        bestBlock.hash!,
      )

      let pageCount = 0
      do {
        const response = await api.fetchNewTxHistory(
          historyPayload,
          baseApiUrl,
          walletContext,
        )
        taskResult.push(response.transactions)
        pageCount++

        // Process transactions immediately as they're fetched so UI can update
        if (onBatchProcessed && response.transactions.length > 0) {
          const batchTxs: Record<string, WalletTransaction> = {}
          for (const tx of response.transactions) {
            batchTxs[tx.hash] = toCachedTx(tx)
          }
          onBatchProcessed(batchTxs)
        }

        // next payload
        // Stop pagination if maxPagesPerChunk is set and we've reached the limit
        isPaginating =
          !response.isLast &&
          (maxPagesPerChunk === undefined || pageCount < maxPagesPerChunk)
        if (isPaginating) {
          bestTx = getLatestApiTransaction(response.transactions)
          // For backend-zero, we only need blockHash and txHash for pagination
          // blockNum and txOrdinal are optional (not provided by backend-zero)
          if (!bestTx || !bestTx.blockHash || !bestTx.txHash) {
            logger.warn(
              'syncTxs: Cannot paginate - bestTx missing blockHash or txHash',
              {
                bestTx,
                txCount: response.transactions.length,
                sampleTx: response.transactions[0]
                  ? {
                      hash: response.transactions[0]?.hash,
                      block_hash: response.transactions[0]?.block_hash,
                    }
                  : null,
              },
            )
            // Stop pagination if we can't get a valid reference
            isPaginating = false
          } else {
            historyPayload = txHistoryPayloadFactory(
              addrs,
              {
                // tip
                bestBlockNum: bestBlock.height,
                // current - from api txs just received
                bestBlockHash: bestTx.blockHash,
                bestTxHash: bestTx.txHash,
              },
              bestBlock.hash!,
            )
          }
        }
      } while (isPaginating)

      return taskResult
    }
    return promise
  })

  try {
    const result = await PromiseAllLimited(tasks, 4)
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
          if (validLastTx) {
            // Remove transactions that reference the invalid block/tx
            // Keep only transactions from blocks before the invalid reference
            const newTxs = fromPairs(
              Object.values(transactions)
                .filter(
                  (t) =>
                    t.blockNum != null && t.blockNum < validLastTx.blockNum,
                )
                .map((t) => [t.id, t]),
            )
            logger.warn(
              'syncTxs: Reference error - cleaning invalid transactions',
              {
                originalCount: Object.keys(transactions).length,
                cleanedCount: Object.keys(newTxs).length,
                invalidReference: validLastTx,
              },
            )
            return newTxs
          } else {
            // No valid lastTx to reference - return empty to start fresh
            logger.warn(
              'syncTxs: Reference error but no valid lastTx - returning empty state',
              {
                error: e,
              },
            )
            return {}
          }

        // UNKNOWN
        default:
          logger.error(`API returned an unknown error response`, {
            type: 'http',
            error: e,
          })
          return
      }
    }
    logger.error(`Unknown error`, {
      type: 'http',
      error: e,
    })
    return
  }
}

function txHistoryPayloadFactory(
  addresses: Array<string>,
  metadata: SyncMetadata,
  currentBestBlockHash: string,
) {
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

function getLatestYoroiTransaction(
  txs: Array<WalletTransaction>,
): undefined | TimeForTx {
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
    if (blockInfo[i]!.blockNum > best!.blockNum) {
      best = blockInfo[i]
      continue
    }

    if (blockInfo[i]!.blockNum === best!.blockNum) {
      if (blockInfo[i]!.txOrdinal > best!.txOrdinal) {
        best = blockInfo[i]
        continue
      }
    }
  }

  return best
}

function getLatestApiTransaction(
  txs: Array<RawTransaction>,
): undefined | TimeForTx {
  const blockInfo: Array<TimeForTx> = []

  for (const tx of txs) {
    // For backend-zero transactions, we only need block_hash and hash
    // block_num and tx_ordinal are optional (not provided by backend-zero API)
    // Check for both null/undefined AND empty strings
    const blockHash = tx.block_hash
    const txHash = tx.hash
    if (
      blockHash != null &&
      blockHash !== '' &&
      txHash != null &&
      txHash !== ''
    ) {
      blockInfo.push({
        blockHash,
        txHash,
        // Use provided values or defaults for sorting
        txOrdinal: tx.tx_ordinal ?? 0,
        blockNum: tx.block_num ?? 0,
      })
    }
  }

  if (blockInfo.length === 0) {
    return undefined
  }

  // If we have block_num and tx_ordinal, use them for proper sorting
  // Otherwise, just return the last transaction (backend-zero returns them in order)
  const hasFullInfo = blockInfo.some(
    (info) => info.blockNum > 0 || info.txOrdinal > 0,
  )

  if (hasFullInfo) {
    let best = blockInfo[0]

    for (let i = 1; i < blockInfo.length; i++) {
      if (blockInfo[i]!.blockNum > best!.blockNum) {
        best = blockInfo[i]
        continue
      }

      if (blockInfo[i]!.blockNum === best!.blockNum) {
        if (blockInfo[i]!.txOrdinal > best!.txOrdinal) {
          best = blockInfo[i]
          continue
        }
      }
    }

    return best
  }

  // For backend-zero (no block_num/tx_ordinal), return the last transaction
  // Backend-zero returns transactions in chronological order
  return blockInfo[blockInfo.length - 1]
}

export function toCachedTx(tx: RawTransaction): WalletTransaction {
  return {
    id: tx.hash,
    type: tx.type,
    fee: tx.fee ?? undefined,
    status: tx.tx_state as TransactionStatus,
    inputs: tx.inputs.map((input) => ({
      id: input.id,
      address: input.address,
      amount: input.amount,
      assets: (input.assets ?? []).map((asset) => ({
        amount: asset.amount,
        tokenId: asset.tokenId,
        policyId: asset.policyId,
        name: asset.name,
      })),
    })),
    outputs: tx.outputs.map((output) => ({
      address: output.address,
      amount: output.amount,
      assets: (output.assets ?? []).map((asset) => ({
        amount: asset.amount,
        tokenId: asset.tokenId,
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
        tokenId: asset.tokenId,
        policyId: asset.policyId,
        name: asset.name,
      })),
    })),
    memo: null,
    metadata: tx.metadata,
  }
}

type TimeForTx = {
  blockHash: string
  blockNum: number
  txHash: string
  txOrdinal: number
}

const perAddressTxsSelector = (state: TransactionManagerState) => {
  const transactions = state.transactions
  const addressToTxs: Record<string, Array<WalletTransaction['id']>> = {}

  const addTxTo = (txId: string, addr: string) => {
    const current = addressToTxs[addr] || ([] as Array<string>)
    const cleared = current.filter((_txId: string) => txId !== _txId)
    addressToTxs[addr] = [...cleared, txId]
  }

  Object.values(transactions).forEach((tx: WalletTransaction) => {
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
type PerAddressCertificatesDict = Record<
  string,
  Record<string, TimestampedCertMeta>
>

const perAddressCertificatesSelector = (
  state: TransactionManagerState,
): PerAddressCertificatesDict => {
  const transactions = state.transactions
  const addressToPerTxCerts: PerAddressCertificatesDict = {}

  const addTxTo = (
    txId: string,
    certificates: Array<RemoteCertificateMeta>,
    submittedAt: string | null | undefined,
    epoch: number | null | undefined,
    addr: string,
  ) => {
    const current: Record<string, TimestampedCertMeta> =
      addressToPerTxCerts[addr] || {}

    if (current[txId] == null && submittedAt != null && epoch != null) {
      current[txId] = {
        submittedAt,
        epoch,
        certificates,
      }
      addressToPerTxCerts[addr] = current
    }
  }

  Object.values(transactions).forEach((tx: WalletTransaction) => {
    tx.certificates.forEach((cert) => {
      if (
        cert.kind === CertificateKind.StakeRegistration ||
        cert.kind === CertificateKind.StakeDeregistration ||
        cert.kind === CertificateKind.StakeDelegation
      ) {
        const {rewardAddress} = cert as any
        addTxTo(tx.id, tx.certificates, tx.submittedAt, tx.epoch, rewardAddress)
      }
    })
  })
  return addressToPerTxCerts
}

const confirmationCountsSelector = (state: TransactionManagerState) => {
  const {perAddressSyncMetadata, transactions} = state
  return mapValues(transactions, (tx: WalletTransaction) => {
    if (tx.status !== TRANSACTION_STATUS.SUCCESSFUL) {
      // TODO(ppershing): do failed transactions have assurance?
      return null
    }

    const getBlockNum = ({address}: {address: string}) =>
      perAddressSyncMetadata[address]?.bestBlockNum ?? 0

    const bestBlockNum = max([
      state.bestBlockNum || 0,
      ...tx.inputs.map(getBlockNum),
      ...tx.outputs.map(getBlockNum),
    ])

    return (bestBlockNum ?? 0) - (tx.blockNum ?? 0)
  })
}

type SyncMetadata = {
  bestBlockNum: number
  bestBlockHash: string | null | undefined
  bestTxHash: string | null | undefined
}

type TxManagerStorage = {
  loadTxs: () => Promise<Record<string, WalletTransaction>>
  saveTxs: (txs: Record<string, WalletTransaction>) => Promise<void>
  clear: () => Promise<void>
}

export const makeTxManagerStorage = (
  storage: App.Storage,
): TxManagerStorage => ({
  loadTxs: async () => {
    const txids = await storage.getItem('txids', parseTxids)
    if (!txids) return {}
    if (txids.length === 0) return {}

    const tuples = await storage.multiGet(txids, parseTx)

    return tuples.reduce(
      (result: TransactionManagerState['transactions'], [txid, tx]) => {
        if (!tx) {
          logger.warn('makeTxManagerStorage: corrupted transaction', {txid})
          return result
        }

        return {...result, [tx.id]: tx}
      },
      {},
    )
  },

  saveTxs: async (txs: TransactionManagerState['transactions']) => {
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
    Array.isArray(data) &&
    data.every((item: unknown) => typeof item === 'string')

  return isTxids(txids) ? txids : []
}

const parseTx = (
  data: string | null | undefined,
): WalletTransaction | undefined => {
  if (!data) return

  const isTx = (data: unknown): data is WalletTransaction => {
    const tx = data as WalletTransaction

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
