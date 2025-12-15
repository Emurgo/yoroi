import {Hex, hex} from '@yoroi/common'
import {App} from '@yoroi/types'

import {logger} from '~/kernel/logger/logger'

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
    // Log as debug since WrongPassword is expected during password validation
    // and shouldn't be sent to error tracking services
    logger.debug('Decryption failed (expected during password validation)', {
      origin: 'decryptData',
    })
    throw new App.Errors.WrongPassword()
  }
}
