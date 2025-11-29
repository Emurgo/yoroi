import {RemoteCertificateMeta} from '@yoroi/staking'
import {Balance} from '@yoroi/types'

import {CardanoTypes} from '~/wallets/cardano/types'

import {
  Address,
  Amount,
  AssetName,
  BlockHash,
  EpochNumber,
  PolicyId,
  SlotNumber,
  TokenId,
  TransactionHash,
} from '../branded'

// Note: CardanoTypes is still in src/ but will be moved in future refactoring

/**
 * Minimal token metadata for transaction processing
 * Used in deprecated TransactionInfo type
 */
export type TransactionToken = {
  isDefault: boolean
  identifier: TokenId
  // Minimal metadata for transaction display
  policyId: PolicyId
  assetName: AssetName
  numberOfDecimals: number
  ticker: string | null
  longName: string | null
}

/**
 * Transaction status constants and type
 */
export const TRANSACTION_STATUS = {
  SUCCESSFUL: 'Successful',
  PENDING: 'Pending',
  FAILED: 'Failed',
} as const

export type TransactionStatus =
  (typeof TRANSACTION_STATUS)[keyof typeof TRANSACTION_STATUS]

/**
 * Transaction direction constants and type
 */
export const TRANSACTION_DIRECTION = {
  SENT: 'SENT',
  RECEIVED: 'RECEIVED',
  SELF: 'SELF',
  // intra-wallet
  MULTI: 'MULTI', // multi-party
} as const

export type TransactionDirection =
  (typeof TRANSACTION_DIRECTION)[keyof typeof TRANSACTION_DIRECTION]

/**
 * Transaction type constants
 */
export const TRANSACTION_TYPE = {
  BYRON: 'byron',
  SHELLEY: 'shelley',
} as const

export type TransactionType =
  (typeof TRANSACTION_TYPE)[keyof typeof TRANSACTION_TYPE]

/**
 * Transaction assurance level
 */
export type TransactionAssurance =
  | 'PENDING'
  | 'FAILED'
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'

/**
 * JSON-serializable value types for Cardano metadata
 */
export type MetadataValue =
  | string
  | number
  | boolean
  | null
  | Array<MetadataValue>
  | {[key: string]: MetadataValue}

/**
 * Transaction metadata
 */
export type TxMetadata = Array<{
  label: string
  map_json?: Record<string, MetadataValue> | MetadataValue[]
  text_scalar?: string | null
}>

/**
 * Transaction metadata info (parsed/flattened)
 */
export type TxMetadataInfo = Record<string, MetadataValue>

/**
 * Base asset type (from backend)
 */
type RemoteAsset = {
  readonly amount: Amount
  readonly tokenId: TokenId
  readonly policyId: PolicyId
  readonly name: AssetName
}

export type BaseAsset = RemoteAsset

/**
 * Input/Output data for transaction display
 */
type IOData = {
  address: Address
  assets: Array<CardanoTypes.TokenEntry>
  amount: Amount
  id?: TransactionHash
}

/**
 * @deprecated INTERNAL ONLY: TransactionInfo is kept internally for deprecated code.
 * Do not use in new code. Use FormattedTx from ReviewTx for transaction details (via useFormattedTxFromWalletTransaction hook).
 * Use TransactionSummary for transaction lists.
 * This type will be removed when deprecated code is migrated.
 */
export type TransactionInfo = {
  id: TransactionHash
  inputs: Array<IOData>
  outputs: Array<IOData>
  amount: Balance.Amounts
  fee: Balance.Amounts | null | undefined
  delta: Balance.Amounts
  direction: TransactionDirection
  confirmations: number
  submittedAt: string | null | undefined
  lastUpdatedAt: string
  status: TransactionStatus
  assurance: TransactionAssurance
  tokens: Record<string, TransactionToken>
  blockNumber: number
  memo: null | string
  metadata: TxMetadataInfo | undefined
}

/**
 * Wallet transaction type (raw transaction from backend, cached in wallet)
 */
export type WalletTransaction = {
  id: TransactionHash
  type?: TransactionType
  fee?: Amount
  status: TransactionStatus
  inputs: Array<{
    address: Address
    amount: Amount
    assets: Array<BaseAsset>
    id?: TransactionHash
  }>
  outputs: Array<{
    address: Address
    amount: Amount
    assets: Array<BaseAsset>
  }>
  blockNum: number | null | undefined
  blockHash: BlockHash | null | undefined
  txOrdinal: number | null | undefined
  submittedAt: string | null | undefined
  lastUpdatedAt: string
  epoch: EpochNumber | null | undefined
  slot: SlotNumber | null | undefined
  withdrawals: Array<{
    address: Address
    // hex
    amount: Amount
  }>
  certificates: Array<RemoteCertificateMeta>
  readonly validContract?: boolean
  readonly scriptSize?: number
  readonly collateralInputs?: Array<{
    address: Address
    amount: Amount
    assets: Array<BaseAsset>
  }>
  memo: string | null
  readonly metadata?: TxMetadata
}

/**
 * Collection of wallet transactions
 */
export type Transactions = {[txid: TransactionHash]: WalletTransaction}
