// @ts-ignore
import {chacha20poly1305} from '@noble/ciphers/chacha'
import 'react-native-get-random-values'
// @ts-ignore
import QuickCrypto from 'react-native-quick-crypto'

const PBKDF_ITERATIONS = 12983
const SALT_SIZE = 16
const KEY_SIZE = 32
const DIGEST = 'sha512'
const NONCE_SIZE = 12
const PROTO_SIZE = 1
const PROTO_VERSION = Buffer.from('01', 'hex')

/*
	----------------------------------------------------------
	| 0x01 | SALT(16) | NONCE(12) | Encrypted Data | Tag(16) |
	----------------------------------------------------------
*/

// Helper function to generate random hex string
export function generateRandomHexString(length: number): string {
  const bytes = new Uint8Array(length / 2)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(
    '',
  )
}

export function generatePbkdf2Key(password: Uint8Array, salt: Buffer): Buffer {
  try {
    const keyArrayBuffer = QuickCrypto.pbkdf2Sync(
      Buffer.from(password),
      salt,
      PBKDF_ITERATIONS,
      KEY_SIZE,
      DIGEST,
    )

    const key = Buffer.from(keyArrayBuffer)

    if (!key || key.length === 0) {
      throw new Error('PBKDF2 returned empty key')
    }

    return key
  } catch (error) {
    throw error
  }
}

export function encryptWithPassword(
  passwordBuf: Uint8Array,
  dataBytes: Uint8Array,
): string {
  const salt = Buffer.from(generateRandomHexString(2 * SALT_SIZE), 'hex')
  const nonce = Buffer.from(generateRandomHexString(2 * NONCE_SIZE), 'hex')
  const data = Buffer.from(dataBytes)
  const key = generatePbkdf2Key(passwordBuf, salt)

  const keyUint8 = new Uint8Array(key)
  const nonceUint8 = new Uint8Array(nonce)
  const dataUint8 = new Uint8Array(data)

  const cipher = chacha20poly1305(keyUint8, nonceUint8)

  const encrypted = cipher.encrypt(dataUint8)

  const cipherText = Buffer.concat([
    PROTO_VERSION,
    salt,
    nonce,
    Buffer.from(encrypted),
  ])

  return cipherText.toString('hex')
}
}

export function decryptWithPassword(
  passwordBuf: Uint8Array,
  ciphertextHex: string,
) {
  const ciphertext = Buffer.from(ciphertextHex, 'hex')

  const salt = ciphertext.slice(PROTO_SIZE, SALT_SIZE + PROTO_SIZE)
  const nonce = ciphertext.slice(
    SALT_SIZE + PROTO_SIZE,
    SALT_SIZE + NONCE_SIZE + PROTO_SIZE,
  )
  const encryptedData = ciphertext.slice(SALT_SIZE + NONCE_SIZE + PROTO_SIZE)

  if (ciphertext.length <= SALT_SIZE + NONCE_SIZE) {
    throw new Error('not enough data to decrypt')
  }

  const key = generatePbkdf2Key(passwordBuf, salt)

  // Use @noble/ciphers for ChaCha20-Poly1305 decryption
  const keyUint8 = new Uint8Array(key)
  const nonceUint8 = new Uint8Array(nonce)
  const encryptedDataUint8 = new Uint8Array(encryptedData)

  const cipher = chacha20poly1305(keyUint8, nonceUint8)
  const decrypted = cipher.decrypt(encryptedDataUint8)

  return Buffer.from(decrypted).toString('hex')
}
