import {RemoteCertificateMeta} from '@yoroi/staking'
import {Balance} from '@yoroi/types'

import {CardanoTypes} from '~/wallets/cardano/types'
import {TransactionToken} from '~/wallets/types/tokens'

// Note: CardanoTypes and TransactionToken are still in src/ but will be moved in future refactoring

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
 * Transaction metadata
 */
export type TxMetadata = Array<{
  label: string
  map_json?: any
  text_scalar?: string | null
}>

/**
 * Transaction metadata info (parsed/flattened)
 */
export type TxMetadataInfo = Record<string, any>

/**
 * Base asset type (from backend)
 */
type RemoteAsset = {
  readonly amount: string
  readonly tokenId: string
  readonly policyId: string
  readonly name: string
}

export type BaseAsset = RemoteAsset

/**
 * Input/Output data for transaction display
 */
type IOData = {
  address: string
  assets: Array<CardanoTypes.TokenEntry>
  amount: string
  id?: string
}

/**
 * @deprecated Use FormattedTx from ReviewTx instead. This type will be removed in a future version.
 * For transaction details, use useFormattedTxFromWalletTransaction hook.
 * For transaction lists, TransactionInfo is still used temporarily but will be migrated.
 */
export type TransactionInfo = {
  id: string
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
  id: string
  type?: TransactionType
  fee?: string
  status: TransactionStatus
  inputs: Array<{
    address: string
    amount: string
    assets: Array<BaseAsset>
    id?: string
  }>
  outputs: Array<{
    address: string
    amount: string
    assets: Array<BaseAsset>
  }>
  blockNum: number | null | undefined
  blockHash: string | null | undefined
  txOrdinal: number | null | undefined
  submittedAt: string | null | undefined
  lastUpdatedAt: string
  epoch: number | null | undefined
  slot: number | null | undefined
  withdrawals: Array<{
    address: string
    // hex
    amount: string
  }>
  certificates: Array<RemoteCertificateMeta>
  readonly validContract?: boolean
  readonly scriptSize?: number
  readonly collateralInputs?: Array<{
    address: string
    amount: string
    assets: Array<BaseAsset>
  }>
  memo: string | null
  readonly metadata?: TxMetadata
}

/**
 * Collection of wallet transactions
 */
export type Transactions = {[txid: string]: WalletTransaction}
