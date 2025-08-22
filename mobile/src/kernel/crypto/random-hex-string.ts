import {hex} from '@yoroi/common'

import * as Crypto from 'expo-crypto'

export const randomHexString = (length: number) => {
  if (length % 2 !== 0 || length < 2) {
    throw new Error('Length must be even since each byte is 2 hex chars')
  }

  const bytes = Crypto.getRandomBytes(length / 2)
  return hex.fromBytes(bytes)
}
