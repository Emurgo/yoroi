// Cardano address utilities
// Cardano-specific address normalization and manipulation functions
import {isHex} from '@yoroi/common'

import {Address, Bip32PublicKey, Credential} from '@emurgo/cross-csl-core'

import {CardanoMobileWrapped} from '../../../src/wallets/cardano/wrappedCsl'
import {Addressing} from '../types'

/**
 * Normalize address to WASM Address type
 * Supports base16 (hex), bech32, and base58 (Byron) formats
 */
export async function normalizeToAddress(
  addr: string,
): Promise<Address | undefined> {
  return CardanoMobileWrapped.cslScope((wasm) => {
    // in Shelley, addresses can be base16, bech32 or base58
    // this function, we try parsing in all encodings possible

    // 1) Try converting from base58
    if (wasm.ByronAddress.isValid(addr)) {
      const byronAddr = wasm.ByronAddress.fromBase58(addr)
      return byronAddr.toAddress()
    }
    const address = isHex(addr)
      ? wasm.Address.fromHex(addr)
      : wasm.Address.fromBech32(addr)
    // Return undefined when malformed for backward compatibility
    return address.isMalformed() ? undefined : address
  })
}

/**
 * Convert WASM Address to hex or base58 string
 */
export function toHexOrBase58(address: Address): string {
  return CardanoMobileWrapped.cslScope((wasm) => {
    const asByron = wasm.ByronAddress.fromAddress(address)
    if (asByron === null || !asByron) {
      return Buffer.from(address.toBytes()).toString('hex')
    }
    return asByron.toBase58()
  })
}

/**
 * Filter addresses by staking key
 */
export async function filterAddressesByStakingKey<T extends {receiver: string}>(
  stakingKey: Credential,
  utxos: ReadonlyArray<T>,
  acceptTypeMismatch: boolean,
): Promise<ReadonlyArray<T>> {
  return CardanoMobileWrapped.cslScope(async (wasm) => {
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
  })
}

/**
 * Check if address contains account key
 */
export async function addrContainsAccountKey(
  wasm: import('@emurgo/cross-csl-core').WasmModuleProxy,
  address: string,
  targetAccountKey: Credential,
  acceptTypeMismatch: boolean,
): Promise<boolean> {
  const wasmAddr = await normalizeToAddress(address)
  if (wasmAddr == null)
    throw new Error(`addrContainsAccountKey invalid address ${address}`)

  const accountKeyString = Buffer.from(targetAccountKey.toBytes()).toString(
    'hex',
  )

  const baseAddress = wasm.BaseAddress.fromAddress(wasmAddr)
  if (!baseAddress) throw new Error('addrContainsAccountKey: baseAddress null')
  const stakeCredBytes = baseAddress.stakeCred().toBytes()
  if (baseAddress != null) {
    if (Buffer.from(stakeCredBytes).toString('hex') === accountKeyString) {
      return true
    }
  }
  const asPointer = wasm.PointerAddress.fromAddress(wasmAddr)
  if (asPointer != null) {
    // TODO: Implement pointer address checking
  }
  return acceptTypeMismatch
}

/**
 * Derive public key by addressing
 */
export const derivePublicByAddressing = (
  addressing: Addressing,
  startingFrom: {
    key: Bip32PublicKey
    level: number
  },
): Bip32PublicKey => {
  if (startingFrom.level + 1 < addressing.startLevel) {
    throw new Error('derivePublicByAddressing: keyLevel < startLevel')
  }

  let derivedKey = startingFrom.key

  for (
    let i = startingFrom.level - addressing.startLevel + 1;
    i < addressing.path.length;
    i++
  ) {
    const pathIndex = addressing.path[i]
    if (pathIndex === undefined) {
      throw new Error('Invalid addressing path')
    }
    derivedKey = derivedKey.derive(pathIndex)
  }

  return derivedKey
}
