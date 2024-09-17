import assert from 'assert'

import {cardanoConfig} from '../../../features/WalletManager/common/adapters/cardano/cardano-config'
import {CardanoMobile} from '../../wallets'

const isString = (s: unknown) => typeof s === 'string' || s instanceof String

const isUInt32 = (i: unknown) => Number.isInteger(i) && typeof i === 'number' && i >= 0 && i < 4294967296

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
  assert(isValidPath(path), 'invalid bip44 path')
  // note: allows non-zero accounts
  return (
    path.length === 3 &&
    (path[0] === cardanoConfig.implementations['cardano-cip1852'].derivations.base.harden.purpose ||
      path[0] === 1852) &&
    (path[1] === cardanoConfig.implementations['cardano-cip1852'].derivations.base.harden.coinType || path[1] === 1815)
  )
}

const canParsePublicKey = async (publicKeyHex: string): Promise<boolean> => {
  try {
    await CardanoMobile.Bip32PublicKey.fromBytes(Buffer.from(publicKeyHex, 'hex'))
    return true
  } catch (_e) {
    return false
  }
}

export const isValidPublicKey = async (key: string): Promise<boolean> =>
  key != null && isString(key) && canParsePublicKey(key)
