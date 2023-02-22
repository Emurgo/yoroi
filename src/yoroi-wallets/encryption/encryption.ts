import cryptoRandomString from 'crypto-random-string'

import assert from '../../legacy/assert'
import {Cardano} from '../cardano/networks/shared'
import {CardanoError, WrongPassword} from '../cardano/networks/shared/errors'

export const encryptData = async (plaintextHex: string, secretKey: string): Promise<string> => {
  assert.assert(!!plaintextHex, 'encrypt:: !!plaintextHex')
  assert.assert(!!secretKey, 'encrypt:: !!secretKey')
  const secretKeyHex = Buffer.from(secretKey, 'utf8').toString('hex')
  const saltHex = cryptoRandomString({
    length: 2 * 32,
  })
  const nonceHex = cryptoRandomString({
    length: 2 * 12,
  })
  return Cardano.encryptWithPassword(secretKeyHex, saltHex, nonceHex, plaintextHex)
}

export const decryptData = async (ciphertext: string, secretKey: string): Promise<string> => {
  assert.assert(!!ciphertext, 'decrypt:: !!cyphertext')
  assert.assert(!!secretKey, 'decrypt:: !!secretKey')
  const secretKeyHex = Buffer.from(secretKey, 'utf8').toString('hex')

  try {
    return await Cardano.decryptWithPassword(secretKeyHex, ciphertext)
  } catch (error) {
    if ((error as Error).message === 'Decryption error') {
      throw new WrongPassword()
    }

    throw new CardanoError(String(error))
  }
}
