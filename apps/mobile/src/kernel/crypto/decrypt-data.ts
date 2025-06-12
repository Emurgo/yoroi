import {decrypt_with_password} from '@emurgo/csl-mobile-bridge-jsi'

import {App} from '@yoroi/types'

export const decryptData = (hexString: string, secretKey: string) => {
  const secretKeyHex = Buffer.from(secretKey, 'utf8').toString('hex')

  try {
    const decryptedBytes = decrypt_with_password(secretKeyHex, hexString)
    return Buffer.from(decryptedBytes).toString('utf8')
  } catch (error) {
    console.error('decryptData error', error)
    throw new App.Errors.WrongPassword()
  }
}
