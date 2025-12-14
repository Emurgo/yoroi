/**
 * Branded type utilities for type-safe string/number/bytes
 */

export declare const __brand: unique symbol
type Brand<B> = {[__brand]: B}
export type Branded<T, B> = T & Brand<B>

/**
 * Creates a branded string type for type safety.
 * Use this to prevent mixing up different string types like IDs, hashes, etc.
 *
 * @example
 * type UserId = String<'UserId'>
 * type PublicKey = String<'PublicKey'>
 */
export type String<T> = Branded<string, T>

/**
 * Creates a branded byte array type for type safety.
 * Use this for encrypted data, hashes, binary content, etc.
 *
 * @example
 * type EncryptedData = Bytes<'Encrypted'>
 * type HashDigest = Bytes<'Hash'>
 */
export type Bytes<T> = Branded<Uint8Array, T>

/**
 * Creates a branded number type for type safety.
 * Use this for IDs, timestamps, counts, etc.
 *
 * @example
 * type Timestamp = Number<'Timestamp'>
 * type Count = Number<'Count'>
 */
export type Number<T> = Branded<number, T>
