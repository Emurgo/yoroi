import {Locker} from '@emurgo/dullahan/.js/yoroi/Locker'
import {bytes} from '@emurgo/dullahan/.js/core'

import {randomHexString} from './random'

export const encryptData = async (plainText: string, secretKey: string) => {
  const dataBytes = Buffer.from(plainText, 'hex')
  const secretKeyBytes = Buffer.from(secretKey, 'utf8')
  const encryptedBytes = await Locker(secretKeyBytes).encrypt(dataBytes, {
    salt: bytes(randomSalt()),
    nonce: bytes(randomNonce()),
  })

  return Buffer.from(encryptedBytes).toString('hex')
}

export const randomSalt = () => randomHexString(64)

export const randomNonce = () => randomHexString(24)
