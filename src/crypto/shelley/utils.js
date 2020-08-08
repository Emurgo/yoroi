// @flow
import {
  Address,
  BaseAddress,
  Bip32PrivateKey,
  ByronAddress,
  Ed25519KeyHash,
  // TODO(v-almonacid): these bindings are not yet implemented
  // PointerAddress,
  // EnterpriseAddress,
  // RewardAddress,
} from 'react-native-haskell-shelley'

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
  // {
  //   const rewardAddr = await RewardAddress.from_address(addr)
  //   if (rewardAddr) return rewardAddr.payment_cred().to_keyhash()
  // }
  throw new Error('getCardanoAddrKeyHash:: unknown address type')
}

export const normalizeToAddress = async (
  addr: string,
): Promise<void | Address> => {
  // in Shelley, addresses can be base16, bech32 or base58
  // this function, we try parsing in all encodings possible

  // 1) Try converting from base58
  if (await ByronAddress.is_valid(addr)) {
    return await (await ByronAddress.from_base58(addr)).to_address()
  }

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
