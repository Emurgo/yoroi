// @ts-ignore
import chacha from 'chacha'
import cryptoRandomString from 'crypto-random-string'
import Pbkdf2 from 'react-native-fast-pbkdf2'

const PBKDF_ITERATIONS = 12983
const SALT_SIZE = 16
const KEY_SIZE = 32
const NONCE_SIZE = 12
const TAG_SIZE = 16
const PROTO_SIZE = 1
const PROTO_VERSION = Buffer.from('01', 'hex')

/*
	----------------------------------------------------------
	| 0x01 | SALT(16) | NONCE(12) | Encrypted Data | Tag(16) |
	----------------------------------------------------------
*/

const promisifyPbkdf2: (
  array: Uint8Array,
  buffer: Buffer,
) => Promise<Buffer> = async (password, salt) => {
  const passwordB64 = Buffer.from(password).toString('base64')
  const saltB64 = Buffer.from(salt).toString('base64')
  // react-native-fast-pbkdf2 returns base64 string
  const derivedB64 = await Pbkdf2.derive(
    passwordB64,
    saltB64,
    PBKDF_ITERATIONS,
    KEY_SIZE,
    'sha-512',
  )
  return Buffer.from(derivedB64, 'base64')
}

export async function encryptWithPassword(
  passwordBuf: Uint8Array,
  dataBytes: Uint8Array,
): Promise<string> {
  const salt = Buffer.from(cryptoRandomString(2 * SALT_SIZE), 'hex')
  const nonce = Buffer.from(cryptoRandomString(2 * NONCE_SIZE), 'hex')
  const data = Buffer.from(dataBytes)
  const aad = Buffer.from('', 'hex')

  const key = await promisifyPbkdf2(passwordBuf, salt)

  const cipher = chacha.createCipher(key, nonce)
  cipher.setAAD(aad, {plaintextLength: data.length})

  const head = cipher.update(data)
  const final = cipher.final()
  const tag = cipher.getAuthTag()

  const cipherText = Buffer.concat([
    PROTO_VERSION,
    salt,
    nonce,
    head,
    final,
    tag,
  ])
  return cipherText.toString('hex')
}

export async function decryptWithPassword(
  passwordBuf: Uint8Array,
  ciphertextHex: string,
): Promise<string> {
  const ciphertext = Buffer.from(ciphertextHex, 'hex')

  const salt = ciphertext.slice(PROTO_SIZE, SALT_SIZE + PROTO_SIZE)
  const nonce = ciphertext.slice(
    SALT_SIZE + PROTO_SIZE,
    SALT_SIZE + NONCE_SIZE + PROTO_SIZE,
  )
  const cipherdata = ciphertext.slice(
    SALT_SIZE + NONCE_SIZE + PROTO_SIZE,
    -TAG_SIZE,
  )
  const tag = ciphertext.slice(
    SALT_SIZE + PROTO_SIZE + NONCE_SIZE + cipherdata.length,
  )

  const aad = Buffer.from('', 'hex')

  if (ciphertext.length <= SALT_SIZE + NONCE_SIZE + TAG_SIZE) {
    throw new Error('not enough data to decrypt')
  }

  const key = await promisifyPbkdf2(passwordBuf, salt)

  const decipher = chacha.createDecipher(key, nonce)
  decipher.setAAD(aad)
  decipher.setAuthTag(tag)

  let decrypted = decipher.update(cipherdata, 'ignored', 'hex')
  decrypted += decipher.final('hex')
  return decrypted
}
