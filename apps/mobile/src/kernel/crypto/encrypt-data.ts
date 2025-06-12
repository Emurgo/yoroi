import {Hex, hex} from '@yoroi/common'

import {encrypt_with_password} from '@emurgo/csl-mobile-bridge-jsi'

import {randomHexString} from './random-hex-string'

export const encryptData = ({
  textHex,
  secretKey,
}: {
  textHex: Hex
  secretKey: string
}) => {
  const saltHex = randomSalt()
  const nonceHex = randomNonce()
  const secretKeyHex = hex.fromUtf8(secretKey)

  const encryptedHex = encrypt_with_password(
    secretKeyHex.value,
    saltHex.value,
    nonceHex.value,
    textHex.value,
  )

  return hex(encryptedHex)
}

export const randomSalt = () => randomHexString(64)

export const randomNonce = () => randomHexString(24)
