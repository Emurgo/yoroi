import {String} from './utils'

/**
 * CBOR-encoded data types
 */
export type CborHex = String<'CborHex'> // Hex-encoded CBOR
export type CborHexValidated = String<'CborHexValidated'> // Validated CBOR
export type MetadataCbor = String<'MetadataCbor'> // Transaction metadata CBOR
export type ScriptCbor = String<'ScriptCbor'> // Plutus script CBOR
export type DatumCbor = String<'DatumCbor'> // Plutus datum CBOR

/**
 * Transaction CBOR types - differentiated by encoding format
 */
export type TransactionCborHex = String<'TransactionCborHex'> // Hex-encoded transaction CBOR (internal use)
export type TransactionCborBase64 = String<'TransactionCborBase64'> // Base64-encoded transaction CBOR (API submission)

/**
 * @deprecated Use TransactionCborHex or TransactionCborBase64 instead
 * Legacy type kept for backward compatibility - defaults to hex
 */
export type TransactionCbor = TransactionCborHex
