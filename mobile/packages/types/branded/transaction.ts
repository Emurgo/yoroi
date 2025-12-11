import {Number, String} from './utils'

/**
 * Transaction identifiers
 */
export type TransactionHash = String<'TransactionHash'> // 32-byte hex (64 chars)
export type TransactionId = String<'TransactionId'> // txHash#txIndex format
export type UtxoId = String<'UtxoId'> // txHash:txIndex format
export type BlockHash = String<'BlockHash'>
export type SlotNumber = Number<'SlotNumber'>
export type EpochNumber = Number<'EpochNumber'>
