import {RemoteAccountState} from '@yoroi/staking'
import {Portfolio} from '@yoroi/types'

/**
 * API-related types for Cardano backend communication
 */

type RemoteAsset = {
  readonly amount: string
  readonly tokenId: Portfolio.Token.Id
  readonly policyId: string
  readonly name: string
}

/**
 * Raw UTXO from backend
 * Equivalent to yoroi-frontend's `RemoteUnspentOutput`
 */
export type RawUtxo = {
  readonly amount: string
  readonly receiver: string
  readonly tx_hash: string
  readonly tx_index: number
  readonly utxo_id: string
  readonly assets: ReadonlyArray<RemoteAsset>
}

/**
 * Account state request
 */
export type AccountStateRequest = {
  addresses: Array<string>
}

/**
 * Account state response
 */
export type AccountStateResponse = Record<string, null | RemoteAccountState>

/**
 * Best block response
 */
type BestblockResponse = {
  height: number
  epoch: number | null | undefined
  slot: number | null | undefined
  hash: string | null | undefined
  globalSlot: number | null | undefined
}

/**
 * Tip status response
 */
export type TipStatusResponse = {
  safeBlock: BestblockResponse
  bestBlock: BestblockResponse
}

/**
 * Transaction history request
 */
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

type RemoteTransactionInput = RemoteTransactionInputBase &
  RemoteTransactionUtxoInput

type RemoteTransactionOutput = {
  readonly address: string
  readonly amount: string
  readonly assets: Array<RemoteAsset>
}

/**
 * Block metadata (only present if TX is in a block)
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

import {RemoteCertificateMeta} from '@yoroi/staking'

type RemoteTxInfo = {
  readonly type: 'byron' | 'shelley'
  readonly fee?: string
  // only in shelley txs
  readonly hash: string
  readonly last_update: string
  // timestamp with timezone
  readonly tx_state: string
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

/**
 * Raw transaction from backend
 */
export type RawTransaction = Partial<RemoteTxBlockMeta> & RemoteTxInfo

/**
 * Transaction metadata
 */
export type TxMetadata = Array<{
  label: string
  map_json?: Record<string, unknown> | Array<unknown>
  text_scalar?: string | null
}>

/**
 * Transaction submission status
 */
export type TxSubmissionStatus = {
  readonly status: 'WAITING' | 'FAILED' | 'MAX_RETRY_REACHED' | 'SUCCESS'
  readonly reason?: string
}

/**
 * Transaction status request
 */
export type TxStatusRequest = {
  txHashes: Array<string>
}

/**
 * Transaction status response
 */
export type TxStatusResponse = {
  readonly depth?: Record<string, number>
  readonly submissionStatus?: Record<string, TxSubmissionStatus>
}

/**
 * Backend configuration
 */
export type BackendConfig = {
  API_ROOT: string
  TOKEN_INFO_SERVICE?: string
  NFT_STORAGE_URL: string
  FETCH_UTXOS_MAX_ADDRESSES: number
  TX_HISTORY_MAX_ADDRESSES: number
  FILTER_USED_MAX_ADDRESSES: number
  TX_HISTORY_RESPONSE_LIMIT: number
}

/**
 * Catalyst fund info
 */
type FundInfo = {
  readonly id: number
  readonly registrationStart: string
  readonly registrationEnd: string
  readonly votingStart?: string
  readonly votingEnd?: string
  readonly votingPowerThreshold: string // in ada
}

/**
 * Catalyst fund info response
 */
export type FundInfoResponse = {
  readonly currentFund: FundInfo | null | undefined
  readonly nextFund: FundInfo | null | undefined
}

