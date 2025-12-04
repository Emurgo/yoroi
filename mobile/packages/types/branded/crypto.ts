import {String} from './utils'

/**
 * Key types
 */
export type PublicKeyHex = String<'PublicKeyHex'> // Ed25519 public key (64 hex chars)
export type PrivateKeyHex = String<'PrivateKeyHex'> // Ed25519 private key
export type PrivateKeyBech32 = String<'PrivateKeyBech32'> // Bech32-encoded private key
export type Bip32PublicKeyHex = String<'Bip32PublicKeyHex'> // BIP32 extended public key (hex)
export type KeyHash = String<'KeyHash'> // 28-byte hash (56 hex chars)
export type SignatureHex = String<'SignatureHex'> // Ed25519 signature

/**
 * Hash types
 */
export type Blake2bHash = String<'Blake2bHash'> // Blake2b hash (various sizes)
export type Sha256Hash = String<'Sha256Hash'> // SHA-256 hash
export type DatumHash = String<'DatumHash'> // Plutus datum hash
export type ScriptHash = String<'ScriptHash'> // Script hash
