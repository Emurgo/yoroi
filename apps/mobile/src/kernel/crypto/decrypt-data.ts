import {Hex, hex} from '@yoroi/common'
import {App} from '@yoroi/types'

import {decrypt_with_password} from '@emurgo/csl-mobile-bridge-jsi'

import {logger} from '../logger/logger'

export const decryptData = ({
  encryptedData,
  secretKey,
}: {
  encryptedData: Hex
  secretKey: Hex
}) => {
  try {
    return hex(decrypt_with_password(secretKey.value, encryptedData.value))
  } catch (error) {
    logger.error(error as Error, {origin: 'decryptData'})
    throw new App.Errors.WrongPassword()
  }
}
