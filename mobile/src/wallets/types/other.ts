import {RemoteAccountState, RemoteCertificateMeta} from '@yoroi/staking'
import {Portfolio, type TransactionStatus, type TxMetadata} from '@yoroi/types'

// note(v-almonacid): this
/**
 * wallet types
 */
export type WalletState = {
  lastGeneratedAddressIndex: number
}

/**
 * API-related types
 */
type RemoteAsset = {
  readonly amount: string
  readonly tokenId: Portfolio.Token.Id
  readonly policyId: string
  readonly name: string
}
// this is equivalent to yoroi-frontend's `RemoteUnspentOutput`
export type RawUtxo = {
  readonly amount: string
  readonly receiver: string
  readonly tx_hash: string
  readonly tx_index: number
  readonly utxo_id: string
  readonly assets: ReadonlyArray<RemoteAsset>
}
// getAccountState
export type AccountStateRequest = {
  addresses: Array<string>
}
export type AccountStateResponse = Record<string, null | RemoteAccountState>

// bestblock
type BestblockResponse = {
  height: number
  epoch: number | null | undefined
  slot: number | null | undefined
  hash: string | null | undefined
  globalSlot: number | null | undefined
}
// tip status
export type TipStatusResponse = {
  safeBlock: BestblockResponse
  bestBlock: BestblockResponse
}
// tx history
export type TxHistoryRequest = {
  addresses: Array<string>
  untilBlock: string
  after?: {
    block: string
    tx: string
  }
}
type RemoteTransactionInputBase = {
  readonly address: string
  readonly amount: string
  readonly assets: Array<RemoteAsset>
}
type RemoteTransactionUtxoInput = {
  readonly id: string
  // concatenation of txHash || index
  readonly index: number
  readonly txHash: string
}
// not considering account txs for now
type RemoteTransactionInput = RemoteTransactionInputBase &
  RemoteTransactionUtxoInput
type RemoteTransactionOutput = {
  readonly address: string
  readonly amount: string
  readonly assets: Array<RemoteAsset>
}

/**
 * only present if TX is in a block
 */
type RemoteTxBlockMeta = {
  readonly block_num: number
  readonly block_hash: string
  readonly tx_ordinal: number
  readonly time: string
  // timestamp with timezone
  readonly epoch: number
  readonly slot: number
}

type RemoteTxInfo = {
  readonly type: 'byron' | 'shelley'
  readonly fee?: string
  // only in shelley txs
  readonly hash: string
  readonly last_update: string
  // timestamp with timezone
  readonly tx_state: TransactionStatus
  readonly inputs: Array<RemoteTransactionInput>
  readonly outputs: Array<RemoteTransactionOutput>
  readonly withdrawals: Array<{
    address: string
    // hex
    amount: string
  }>
  readonly certificates: Array<RemoteCertificateMeta>
  readonly valid_contract?: boolean
  readonly script_size?: number
  readonly collateral_inputs?: Array<RemoteTransactionInput>
  readonly metadata?: TxMetadata
}
export type RawTransaction = Partial<RemoteTxBlockMeta> & RemoteTxInfo

// Catalyst
type FundInfo = {
  readonly id: number
  readonly registrationStart: string
  readonly registrationEnd: string
  readonly votingStart?: string
  readonly votingEnd?: string
  readonly votingPowerThreshold: string // in ada
}
export type FundInfoResponse = {
  readonly currentFund: FundInfo | null | undefined
  readonly nextFund: FundInfo | null | undefined
}
export type TxSubmissionStatus = {
  readonly status: 'WAITING' | 'FAILED' | 'MAX_RETRY_REACHED' | 'SUCCESS'
  readonly reason?: string
}
export type TxStatusRequest = {
  txHashes: Array<string>
}
export type TxStatusResponse = {
  readonly depth?: Record<string, number>
  readonly submissionStatus?: Record<string, TxSubmissionStatus>
}

export type BackendConfig = {
  API_ROOT: string
  TOKEN_INFO_SERVICE?: string
  NFT_STORAGE_URL: string
  FETCH_UTXOS_MAX_ADDRESSES: number
  TX_HISTORY_MAX_ADDRESSES: number
  FILTER_USED_MAX_ADDRESSES: number
  TX_HISTORY_RESPONSE_LIMIT: number
}

// Re-export transaction types from @yoroi/types
export {
  TRANSACTION_DIRECTION,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
  type TransactionAssurance,
  type TransactionDirection,
  type Transactions,
  type TransactionStatus,
  type TransactionType,
  type TxMetadata,
  type TxMetadataInfo,
  type WalletTransaction,
} from '@yoroi/types'

// Re-export BaseAsset from @yoroi/types
export type {BaseAsset} from '@yoroi/types'
