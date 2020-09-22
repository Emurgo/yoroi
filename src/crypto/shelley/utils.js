// @flow
import {
  Address,
  BaseAddress,
  Bip32PublicKey,
  Bip32PrivateKey,
  ByronAddress,
  Ed25519KeyHash,
  RewardAddress,
  // TODO(v-almonacid): these bindings are not yet implemented
  // PointerAddress,
  // EnterpriseAddress,
} from 'react-native-haskell-shelley'

import {NUMBERS} from '../../config/numbers'

import type {Addressing} from '../types'

export const getCardanoAddrKeyHash = async (
  addr: Address,
): // null -> legacy address (no key hash)
// undefined -> script hash instead of key hash
Promise<Ed25519KeyHash | null | void> => {
  {
    const byronAddr = await ByronAddress.from_address(addr)
    if (byronAddr) return null
  }
  {
    const baseAddr = await BaseAddress.from_address(addr)
    if (baseAddr) return await (await baseAddr.payment_cred()).to_keyhash()
  }
  // {
  //   const ptrAddr = await PointerAddress.from_address(addr)
  //   if (ptrAddr) return ptrAddr.payment_cred().to_keyhash()
  // }
  // {
  //   const enterpriseAddr = await EnterpriseAddress.from_address(addr)
  //   if (enterpriseAddr) return enterpriseAddr.payment_cred().to_keyhash()
  // }
  {
    const rewardAddr = await RewardAddress.from_address(addr)
    if (rewardAddr) return await (await rewardAddr.payment_cred()).to_keyhash()
  }
  throw new Error('getCardanoAddrKeyHash:: unknown address type')
}

export const normalizeToAddress = async (
  addr: string,
): Promise<void | Address> => {
  // in Shelley, addresses can be base16, bech32 or base58
  // in this function, we try parsing in all encodings possible

  // 1) Try converting from base58
  try {
    if (await ByronAddress.is_valid(addr)) {
      return await (await ByronAddress.from_base58(addr)).to_address()
    }
  } catch (_e) {} // eslint-disable-line no-empty

  // 2) If already base16, simply return
  try {
    return await Address.from_bytes(Buffer.from(addr, 'hex'))
  } catch (_e) {} // eslint-disable-line no-empty

  // 3) Try converting from base32
  try {
    return await Address.from_bech32(addr)
  } catch (_e) {} // eslint-disable-line no-empty

  return undefined
}

export const byronAddrToHex = async (base58Addr: string): Promise<string> => {
  return Buffer.from(
    await (await ByronAddress.from_base58(base58Addr)).to_bytes(),
  ).toString('hex')
}

// need to format shelley addresses as base16 but only legacy addresses as base58
export const toHexOrBase58 = async (address: Address): Promise<string> => {
  const asByron = await ByronAddress.from_address(address)
  if (asByron == null) {
    return Buffer.from(await address.to_bytes()).toString('hex')
  }
  return await asByron.to_base58()
}

export const derivePublicByAddressing = async (request: {|
  addressing: $PropertyType<Addressing, 'addressing'>,
  startingFrom: {|
    key: Bip32PublicKey,
    level: number,
  |},
|}): Promise<Bip32PublicKey> => {
  if (request.startingFrom.level + 1 < request.addressing.startLevel) {
    throw new Error('derivePublicByAddressing: keyLevel < startLevel')
  }
  let derivedKey = request.startingFrom.key
  for (
    let i = request.startingFrom.level - request.addressing.startLevel + 1;
    i < request.addressing.path.length;
    i++
  ) {
    derivedKey = await derivedKey.derive(request.addressing.path[i])
  }
  return derivedKey
}

export const derivePrivateByAddressing = async (request: {|
  addressing: $PropertyType<Addressing, 'addressing'>,
  startingFrom: {|
    key: Bip32PrivateKey,
    level: number,
  |},
|}): Promise<Bip32PrivateKey> => {
  if (request.startingFrom.level + 1 < request.addressing.startLevel) {
    throw new Error('derivePrivateByAddressing: keyLevel < startLevel')
  }
  let derivedKey = request.startingFrom.key
  for (
    let i = request.startingFrom.level - request.addressing.startLevel + 1;
    i < request.addressing.path.length;
    i++
  ) {
    derivedKey = await derivedKey.derive(request.addressing.path[i])
  }
  return derivedKey
}

export const verifyFromBip44Root = (
  request: $ReadOnly<{|
    ...$PropertyType<Addressing, 'addressing'>,
  |}>,
): void => {
  const accountPosition = request.startLevel
  if (accountPosition !== NUMBERS.BIP44_DERIVATION_LEVELS.PURPOSE) {
    throw new Error('verifyFromBip44Root: addressing does not start from root')
  }
  const lastLevelSpecified = request.startLevel + request.path.length - 1
  if (lastLevelSpecified !== NUMBERS.BIP44_DERIVATION_LEVELS.ADDRESS) {
    throw new Error('verifyFromBip44Root: incorrect addressing size')
  }
}
