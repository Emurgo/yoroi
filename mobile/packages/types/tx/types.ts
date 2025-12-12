// Transaction types
// These are WASM types from CSL
import type {
  Transaction as CSLTransaction,
  TransactionBody,
} from '@emurgo/cross-csl-core'
import type BigNumber from 'bignumber.js'

import type {BalanceAmounts} from '../balance/token'
import {
  Address,
  BalanceQuantity,
  KeyHash,
  TokenId,
  TransactionHash,
  UtxoId,
} from '../branded'

// UnsignedTx type - matches TransactionBody structure
export type UnsignedTx = TransactionBody
export type SignedTx = CSLTransaction

export type TokenEntry = {
  amount: BigNumber
  identifier: TokenId
}

/**
 * Addressing information for a UTXO
 */
export type Addressing = {
  path: number[]
  startLevel: number
}

/**
 * Modern UTXO format using Balance.Amounts
 */
export type RemoteUnspentOutput = {
  receiver: Address
  txHash: TransactionHash
  txIndex: number
  utxoId: UtxoId
  balance: BalanceAmounts // Record<TokenId, Quantity> - modern format
}

/**
 * UTXO with addressing information
 */
export type CardanoAddressedUtxo = RemoteUnspentOutput & {
  addressing: Addressing
}

/**
 * Staking key balances mapping
 */
export type StakingKeyBalances = {[key: KeyHash]: BalanceQuantity}

/**
 * JSON-serializable value types for transaction metadata
 */
export type MetadataDataValue =
  | string
  | number
  | boolean
  | null
  | Array<MetadataDataValue>
  | {[key: string]: MetadataDataValue}

/**
 * Transaction metadata (for transaction building)
 * Note: This is different from Wallet.TxMetadata which is an array type
 */
export type TransactionMetadata = {
  label: string
  data: MetadataDataValue
}
