import {String} from './utils'

/**
 * CBOR-encoded data types
 */
export type CborHex = String<'CborHex'> // Hex-encoded CBOR
export type CborHexValidated = String<'CborHexValidated'> // Validated CBOR
export type MetadataCbor = String<'MetadataCbor'> // Transaction metadata CBOR
export type ScriptCbor = String<'ScriptCbor'> // Plutus script CBOR
export type DatumCbor = String<'DatumCbor'> // Plutus datum CBOR
export type TransactionCbor = String<'TransactionCbor'> // Full transaction CBOR
