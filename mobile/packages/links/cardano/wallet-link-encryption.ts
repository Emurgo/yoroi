import {Hex, hex} from '@yoroi/common'
import {getLogger} from '@yoroi/logger'
import {App} from '@yoroi/types'

import {Buffer} from '@craftzdog/react-native-buffer'
// @ts-ignore
import {chacha20poly1305} from '@noble/ciphers/chacha'
import 'react-native-get-random-values'
// @ts-ignore
import QuickCrypto from 'react-native-quick-crypto'

// CSL encryption constants
const CSL_SALT_SIZE = 16 // bytes
const CSL_NONCE_SIZE = 12 // bytes

// Standard ChaCha20-Poly1305 constants
const STANDARD_PBKDF_ITERATIONS = 12983 // Same as CSL for compatibility
const STANDARD_SALT_SIZE = 16 // bytes
const STANDARD_NONCE_SIZE = 12 // bytes
const STANDARD_KEY_SIZE = 32 // bytes
const STANDARD_TAG_SIZE = 16 // bytes
const STANDARD_DIGEST = 'sha512'

export type WalletLinkEncryptionAlgorithm =
  | 'plain'
  | 'chacha20poly1305' // Standard format: salt + nonce + ciphertext + tag
  | 'chacha20poly1305-csl' // CSL format: ciphertext + tag + nonce + salt (legacy, decryption only)

export type CSLEncryptFunction = (
  passwordHex: string,
  saltHex: string,
  nonceHex: string,
  dataHex: string,
) => string

export type CSLDecryptFunction = (
  passwordHex: string,
  encryptedDataHex: string,
) => string

export type RandomHexStringFunction = (length: number) => Hex

export type WalletLinkEncryptionOptions = {
  cslEncrypt?: CSLEncryptFunction
  cslDecrypt?: CSLDecryptFunction
  randomHexString?: RandomHexStringFunction
}

/**
 * Encrypt wallet data for deeplink sharing
 * @param data - Plaintext data to encrypt (hex string)
 * @param password - Encryption password
 * @param algorithm - Encryption algorithm to use
 * @param options - Optional CSL functions and utilities (required for 'csl' algorithm)
 * @returns Encrypted data as hex string
 */
export const encryptWalletData = (
  data: string,
  password: string,
  algorithm: WalletLinkEncryptionAlgorithm,
  options?: WalletLinkEncryptionOptions,
): string => {
  if (algorithm === 'plain') {
    return data
  }

  if (algorithm === 'chacha20poly1305-csl') {
    if (!options?.cslEncrypt || !options?.randomHexString) {
      throw new Error(
        'CSL encrypt function and randomHexString are required for CSL format encryption',
      )
    }
    // Use CSL's encrypt_with_password function
    // CSL format: [Encrypted Data] + [Tag (16 bytes)] + [Nonce (12 bytes)] + [Salt (16 bytes)]
    // CSL expects: password (hex), salt (hex), nonce (hex), data (hex)
    const salt = options.randomHexString(CSL_SALT_SIZE * 2).value // 32 hex chars = 16 bytes
    const nonce = options.randomHexString(CSL_NONCE_SIZE * 2).value // 24 hex chars = 12 bytes
    const passwordHex = hex.fromUtf8(password).value

    return options.cslEncrypt(passwordHex, salt, nonce, data)
  }

  if (algorithm === 'chacha20poly1305') {
    // Standard ChaCha20-Poly1305 format: salt + nonce + ciphertext + tag
    // Generate random hex strings for salt and nonce
    const generateRandomHex = (length: number): string => {
      if (options?.randomHexString) {
        return options.randomHexString(length).value
      }
      // Fallback: use crypto.getRandomValues (available globally via react-native-get-random-values)
      const bytes = new Uint8Array(length / 2)
      // @ts-ignore - crypto is available globally
      crypto.getRandomValues(bytes)
      return hex.fromBytes(bytes).value
    }
    const saltHex = generateRandomHex(STANDARD_SALT_SIZE * 2) // 32 hex chars = 16 bytes
    const nonceHex = generateRandomHex(STANDARD_NONCE_SIZE * 2) // 24 hex chars = 12 bytes
    const saltBytes = Buffer.from(saltHex, 'hex')
    const nonceBytes = Buffer.from(nonceHex, 'hex')
    const dataBytes = Buffer.from(data, 'hex')
    const passwordBytes = Buffer.from(password, 'utf8')

    // Derive key using PBKDF2-SHA512
    const keyBuffer = QuickCrypto.pbkdf2Sync(
      passwordBytes,
      saltBytes,
      STANDARD_PBKDF_ITERATIONS,
      STANDARD_KEY_SIZE,
      STANDARD_DIGEST,
    )
    const key = new Uint8Array(keyBuffer)

    // Encrypt using ChaCha20-Poly1305
    const cipher = chacha20poly1305(key, new Uint8Array(nonceBytes))
    const encrypted = cipher.encrypt(new Uint8Array(dataBytes))

    // Format: salt + nonce + ciphertext (which includes tag)
    const result = Buffer.concat([
      saltBytes,
      nonceBytes,
      Buffer.from(encrypted),
    ])

    return result.toString('hex')
  }

  throw new Error(`Unsupported encryption algorithm: ${algorithm}`)
}

/**
 * Decrypt wallet data from deeplink
 * @param encryptedData - Encrypted data as hex string
 * @param password - Decryption password
 * @param algorithm - Encryption algorithm used
 * @param options - Optional CSL functions (required for 'csl' algorithm)
 * @returns Decrypted data as hex string
 */
export const decryptWalletData = (
  encryptedData: string,
  password: string,
  algorithm: WalletLinkEncryptionAlgorithm,
  options?: WalletLinkEncryptionOptions,
): string => {
  if (algorithm === 'plain') {
    return encryptedData
  }

  if (algorithm === 'chacha20poly1305-csl') {
    if (!options?.cslDecrypt) {
      throw new Error(
        'CSL decrypt function is required for CSL format decryption',
      )
    }
    // Use CSL's decrypt_with_password function
    // CSL format: [Encrypted Data] + [Tag (16 bytes)] + [Nonce (12 bytes)] + [Salt (16 bytes)]
    try {
      const passwordHex = hex.fromUtf8(password).value
      return options.cslDecrypt(passwordHex, encryptedData)
    } catch (error) {
      getLogger().debug('ChaCha20-Poly1305 (CSL format) decryption failed', {
        origin: 'decryptWalletData',
      })
      throw new App.Errors.WrongPassword()
    }
  }

  if (algorithm === 'chacha20poly1305') {
    // Standard format: salt (16) + nonce (12) + ciphertext + tag (16)
    const encryptedBuffer = Buffer.from(encryptedData, 'hex')
    const minSize = STANDARD_SALT_SIZE + STANDARD_NONCE_SIZE + STANDARD_TAG_SIZE

    if (encryptedBuffer.length < minSize) {
      throw new Error('Invalid encrypted data: too short')
    }

    const salt = encryptedBuffer.slice(0, STANDARD_SALT_SIZE)
    const nonce = encryptedBuffer.slice(
      STANDARD_SALT_SIZE,
      STANDARD_SALT_SIZE + STANDARD_NONCE_SIZE,
    )
    const ciphertextWithTag = encryptedBuffer.slice(
      STANDARD_SALT_SIZE + STANDARD_NONCE_SIZE,
    )
    const passwordBytes = Buffer.from(password, 'utf8')

    // Derive key using PBKDF2-SHA512
    const keyBuffer = QuickCrypto.pbkdf2Sync(
      passwordBytes,
      salt,
      STANDARD_PBKDF_ITERATIONS,
      STANDARD_KEY_SIZE,
      STANDARD_DIGEST,
    )
    const key = new Uint8Array(keyBuffer)

    // Decrypt using ChaCha20-Poly1305
    try {
      const cipher = chacha20poly1305(key, new Uint8Array(nonce))
      const decrypted = cipher.decrypt(new Uint8Array(ciphertextWithTag))
      return Buffer.from(decrypted).toString('hex')
    } catch (error) {
      getLogger().debug(
        'ChaCha20-Poly1305 (standard format) decryption failed',
        {
          origin: 'decryptWalletData',
        },
      )
      throw new App.Errors.WrongPassword()
    }
  }

  throw new Error(`Unsupported encryption algorithm: ${algorithm}`)
}
