import {App} from '@yoroi/types'
import assert from 'assert'
import cryptoRandomString from 'crypto-random-string'

import {Cardano} from '../../yoroi-wallets/wallets'

export const encryptData = async (plaintextHex: string, secretKey: string): Promise<string> => {
  assert(!!plaintextHex, 'encrypt:: !!plaintextHex')
  assert(!!secretKey, 'encrypt:: !!secretKey')
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
  const secretKeyHex = Buffer.from(secretKey, 'utf8').toString('hex')

  try {
    return await Cardano.decryptWithPassword(secretKeyHex, ciphertext)
  } catch (error) {
    // NOTE: Library doesn't throw error, it throws a string
    if ((error as Error)?.message === libraryError || error === libraryError) {
      throw new App.Errors.WrongPassword()
    }

    throw new App.Errors.LibraryError(String(error))
  }
}

const libraryError = 'Decryption error'
