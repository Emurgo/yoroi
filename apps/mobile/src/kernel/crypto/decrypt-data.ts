import {Hex, hex} from '@yoroi/common'
import {App} from '@yoroi/types'

import {logger} from '../logger/logger'
import {decrypt_with_password} from './csl'

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
