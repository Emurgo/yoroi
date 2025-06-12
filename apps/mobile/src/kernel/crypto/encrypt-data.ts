import {encrypt_with_password} from '@emurgo/csl-mobile-bridge-jsi'

import {randomHexString} from './random-hex-string'

export const encryptData = (plainTextHex: string, secretKey: string) => {
  const saltHex = randomSalt()
  const nonceHex = randomNonce()
  const secretKeyBytesHex = Buffer.from(secretKey, 'utf8').toString('hex')

  const encryptedBytes = encrypt_with_password(
    secretKeyBytesHex,
    saltHex,
    nonceHex,
    plainTextHex,
  )

  return Buffer.from(encryptedBytes).toString('hex')
}

export const randomSalt = () => randomHexString(64)

export const randomNonce = () => randomHexString(24)
