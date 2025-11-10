// Cardano address utilities
// Cardano-specific address normalization and manipulation functions

import {Address, WasmModuleProxy, Credential, Bip32PublicKey} from '@emurgo/cross-csl-core'
import {isHex} from '@yoroi/common'
import {Addressing} from '../types'

/**
 * Normalize address to WASM Address type
 * Supports base16 (hex), bech32, and base58 (Byron) formats
 */
export async function normalizeToAddress(
  wasm: WasmModuleProxy,
  addr: string,
): Promise<Address | undefined> {
  // in Shelley, addresses can be base16, bech32 or base58
  // this function, we try parsing in all encodings possible

  // 1) Try converting from base58
  if (await wasm.ByronAddress.isValid(addr)) {
    const byronAddr = await wasm.ByronAddress.fromBase58(addr)
    return await byronAddr.toAddress()
  }
  const address = await (isHex(addr)
    ? wasm.Address.fromHex(addr)
    : wasm.Address.fromBech32(addr))
  // Return undefined when malformed for backward compatibility
  return (await address.isMalformed()) ? undefined : address
}

/**
 * Convert WASM Address to hex or base58 string
 */
export async function toHexOrBase58(
  wasm: WasmModuleProxy,
  address: Address,
): Promise<string> {
  const asByron = await wasm.ByronAddress.fromAddress(address)
  if (asByron === null || !asByron) {
    return Buffer.from(await address.toBytes()).toString('hex')
  }
  return await asByron.toBase58()
}

/**
 * Filter addresses by staking key
 */
export async function filterAddressesByStakingKey<
  T extends {receiver: string},
>(
  wasm: WasmModuleProxy,
  stakingKey: Credential,
  utxos: ReadonlyArray<T>,
  acceptTypeMismatch: boolean,
): Promise<ReadonlyArray<T>> {
  const result: T[] = []
  for (const utxo of utxos) {
    if (
      await addrContainsAccountKey(
        wasm,
        utxo.receiver,
        stakingKey,
        acceptTypeMismatch,
      )
    ) {
      result.push(utxo)
    }
  }
  return result
}

/**
 * Check if address contains account key
 */
export async function addrContainsAccountKey(
  wasm: WasmModuleProxy,
  address: string,
  targetAccountKey: Credential,
  acceptTypeMismatch: boolean,
): Promise<boolean> {
  const wasmAddr = await normalizeToAddress(wasm, address)
  if (wasmAddr == null)
    throw new Error(`addrContainsAccountKey invalid address ${address}`)

  const accountKeyString = Buffer.from(
    await targetAccountKey.toBytes(),
  ).toString('hex')

  const baseAddress = await wasm.BaseAddress.fromAddress(wasmAddr)
  if (!baseAddress)
    throw new Error('addrContainsAccountKey: baseAddress null')
  const stakeCredBytes = await baseAddress.stakeCred().then((x) => x.toBytes())
  if (baseAddress != null) {
    if (Buffer.from(stakeCredBytes).toString('hex') === accountKeyString) {
      return true
    }
  }
  const asPointer = await wasm.PointerAddress.fromAddress(wasmAddr)
  if (asPointer != null) {
    // TODO: Implement pointer address checking
  }
  return acceptTypeMismatch
}

/**
 * Derive public key by addressing
 */
export const derivePublicByAddressing = async (
  addressing: Addressing,
  startingFrom: {
    key: Bip32PublicKey
    level: number
  },
): Promise<Bip32PublicKey> => {
  if (startingFrom.level + 1 < addressing.startLevel) {
    throw new Error('derivePublicByAddressing: keyLevel < startLevel')
  }

  let derivedKey = startingFrom.key

  for (
    let i = startingFrom.level - addressing.startLevel + 1;
    i < addressing.path.length;
    i++
  ) {
    derivedKey = await derivedKey.derive(addressing.path[i])
  }

  return derivedKey
}

