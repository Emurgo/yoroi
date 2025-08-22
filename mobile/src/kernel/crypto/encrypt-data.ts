import {Hex, hex} from '@yoroi/common'

import {encrypt_with_password} from './csl'
import {randomHexString} from './random-hex-string'

export const encryptData = ({
  plainData,
  secretKey,
}: {
  plainData: Hex
  secretKey: Hex
}) => {
  const salt = randomSalt()
  const nonce = randomNonce()

  return hex(
    encrypt_with_password(
      secretKey.value,
      salt.value,
      nonce.value,
      plainData.value,
    ),
  )
}

export const randomSalt = () => randomHexString(64)

export const randomNonce = () => randomHexString(24)
