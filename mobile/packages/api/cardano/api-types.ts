import {
  Address,
  Amount,
  BalanceQuantity,
  BlockHash,
  EpochNumber,
  PolicyId,
  Portfolio,
  RemoteAccountState,
  RemoteCertificateMeta,
  SlotNumber,
  TransactionHash,
  UtxoId,
} from '@yoroi/types'

/**
 * API-related types for Cardano backend communication
 */

type RemoteAsset = {
  readonly amount: BalanceQuantity
  readonly tokenId: Portfolio.Token.Id
  readonly policyId: PolicyId
  readonly name: string
}

/**
 * Raw UTXO from backend
 * Equivalent to yoroi-frontend's `RemoteUnspentOutput`
 */
export type RawUtxo = {
  readonly amount: BalanceQuantity
  readonly receiver: Address
  readonly tx_hash: TransactionHash
  readonly tx_index: number
  readonly utxo_id: UtxoId
  readonly assets: ReadonlyArray<RemoteAsset>
}

/**
 * Account state request
 */
export type AccountStateRequest = {
  addresses: Array<Address>
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
  epoch: EpochNumber | null | undefined
  slot: SlotNumber | null | undefined
  hash: BlockHash | null | undefined
  globalSlot: SlotNumber | null | undefined
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
  addresses: Array<Address>
  untilBlock: BlockHash
  after?: {
    block: BlockHash
    tx: TransactionHash
  }
}

type RemoteTransactionInputBase = {
  readonly address: Address
  readonly amount: BalanceQuantity
  readonly assets: Array<RemoteAsset>
}

type RemoteTransactionUtxoInput = {
  readonly id: UtxoId
  // concatenation of txHash || index
  readonly index: number
  readonly txHash: TransactionHash
}

type RemoteTransactionInput = RemoteTransactionInputBase &
  RemoteTransactionUtxoInput

type RemoteTransactionOutput = {
  readonly address: Address
  readonly amount: BalanceQuantity
  readonly assets: Array<RemoteAsset>
}

/**
 * Block metadata (only present if TX is in a block)
 */
type RemoteTxBlockMeta = {
  readonly block_num: number
  readonly block_hash: BlockHash
  readonly tx_ordinal: number
  readonly time: string
  // timestamp with timezone
  readonly epoch: EpochNumber
  readonly slot: SlotNumber
}

type RemoteTxInfo = {
  readonly type: 'byron' | 'shelley'
  readonly fee?: Amount
  // only in shelley txs
  readonly hash: TransactionHash
  readonly last_update: string
  // timestamp with timezone
  readonly tx_state: string
  readonly inputs: Array<RemoteTransactionInput>
  readonly outputs: Array<RemoteTransactionOutput>
  readonly withdrawals: Array<{
    address: Address
    amount: Amount
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
  txHashes: Array<TransactionHash>
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
