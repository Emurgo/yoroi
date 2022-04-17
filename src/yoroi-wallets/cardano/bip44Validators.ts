import assert from '../../legacy/assert'
import {NUMBERS} from '../../legacy/numbers'
import {Bip32PublicKey} from '.'

const isString = (s) => typeof s === 'string' || s instanceof String

const isUInt32 = (i) => Number.isInteger(i) && i >= 0 && i < 4294967296

export const isValidPath = (path: unknown): boolean => {
  if (!(Array.isArray(path) && path.length > 0 && path.length <= 5)) {
    return false
  }
  for (const i of path) {
    if (!isUInt32(i)) {
      return false
    }
  }
  return true
}

export const isCIP1852AccountPath = (path: Array<number>): boolean => {
  assert.preconditionCheck(isValidPath(path), 'invalid bip44 path')
  // note: allows non-zero accounts
  return (
    path.length === 3 &&
    (path[0] === NUMBERS.WALLET_TYPE_PURPOSE.CIP1852 || path[0] === 1852) &&
    (path[1] === NUMBERS.COIN_TYPES.CARDANO || path[1] === 1815)
  )
}

export const canParsePublicKey = async (publicKeyHex: string): Promise<boolean> => {
  try {
    await Bip32PublicKey.fromBytes(Buffer.from(publicKeyHex, 'hex'))
    return true
  } catch (_e) {
    return false
  }
}

export const isValidPublicKey = async (key: string): Promise<boolean> =>
  key != null && isString(key) && (await canParsePublicKey(key))
