import {Hex, hex} from '@yoroi/common'
import {App} from '@yoroi/types'

import {decrypt_with_password} from '@emurgo/csl-mobile-bridge-jsi'

import {logger} from '../logger/logger'

export const decryptData = ({
  cipherTextHex,
  secretKey,
}: {
  cipherTextHex: Hex
  secretKey: string
}) => {
  const secretKeyHex = hex.fromUtf8(secretKey)

  try {
    return hex(decrypt_with_password(secretKeyHex.value, cipherTextHex.value))
  } catch (error) {
    logger.error(error as Error, {origin: 'decryptData'})
    throw new App.Errors.WrongPassword()
  }
}
