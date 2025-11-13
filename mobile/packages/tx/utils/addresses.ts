// Cardano address utilities
// Cardano-specific address normalization and manipulation functions
import {isHex} from '@yoroi/common'

import {
  Address,
  Bip32PublicKey,
  Credential,
  WasmModuleProxy,
} from '@emurgo/cross-csl-core'

import {CardanoMobileWrapped} from '../../../src/wallets/cardano/wrappedCsl'
import {Addressing} from '../types'

/**
 * Address information extracted from WASM objects (safe to use outside cslScope)
 */
export type AddressInfo = {
  networkId: number
  hex: string
  bech32: string | null
  isValid: boolean
}

/**
 * Validate address and extract all needed information in one scope
 * This is the preferred way to validate addresses as it extracts primitive values
 * before the WASM objects are freed
 */
export async function validateAndExtractAddressInfo(
  addr: string,
): Promise<AddressInfo | undefined> {
  return CardanoMobileWrapped.cslScope((csl) => {
    let address: any

    // 1) Try converting from base58
    if (csl.ByronAddress.isValid(addr)) {
      const byronAddr = csl.ByronAddress.fromBase58(addr)
      address = byronAddr.toAddress()
    } else {
      const isHexAddr = isHex(addr)
      address = isHexAddr
        ? csl.Address.fromHex(addr)
        : csl.Address.fromBech32(addr)
    }

    if (address.isMalformed()) {
      return undefined
    }

    // Extract all needed values before scope exits
    const networkId = address.networkId()
    const hex = address.toHex()
    const bech32 = address.toBech32(undefined) ?? null

    return {
      networkId,
      hex,
      bech32,
      isValid: true,
    }
  })
}

/**
 * Normalize address to WASM Address type
 * Supports base16 (hex), bech32, and base58 (Byron) formats
 *
 * WARNING: The returned Address object is a WASM object that will be freed when
 * the cslScope exits. Do NOT use it outside the scope where it was created.
 *
 * For safe usage, use validateAndExtractAddressInfo() instead, which extracts
 * primitive values (networkId, hex, bech32) before the scope exits.
 */
export async function normalizeToAddress(
  addr: string,
): Promise<Address | undefined> {
  return CardanoMobileWrapped.cslScope((csl) => {
    // in Shelley, addresses can be base16, bech32 or base58
    // this function, we try parsing in all encodings possible

    // 1) Try converting from base58
    if (csl.ByronAddress.isValid(addr)) {
      const byronAddr = csl.ByronAddress.fromBase58(addr)
      const address = byronAddr.toAddress()
      return address.isMalformed() ? undefined : address
    }

    const isHexAddr = isHex(addr)
    const address = isHexAddr
      ? csl.Address.fromHex(addr)
      : csl.Address.fromBech32(addr)
    const isMalformed = address.isMalformed()
    // Return undefined when malformed for backward compatibility
    return isMalformed ? undefined : address
  })
}

/**
 * Convert WASM Address to hex or base58 string
 * WARNING: This function takes an Address parameter that must be from the same cslScope.
 * For safe usage, use validateAndExtractAddressInfo() and use the hex/bech32 from there.
 *
 * @deprecated Use validateAndExtractAddressInfo() instead for safer address handling
 */
export function toHexOrBase58(address: Address): string {
  return CardanoMobileWrapped.cslScope((csl) => {
    // Try to use the address - if it's from a different scope, this will fail
    const asByron = csl.ByronAddress.fromAddress(address)
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
  return CardanoMobileWrapped.cslScope(async (csl) => {
    const result: T[] = []
    for (const utxo of utxos) {
      if (
        await addrContainsAccountKey(
          csl,
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
 * NOTE: This function expects to be called within a cslScope, and will parse
 * the address within that same scope to avoid WASM pointer issues
 */
export async function addrContainsAccountKey(
  csl: WasmModuleProxy,
  address: string,
  targetAccountKey: Credential,
  acceptTypeMismatch: boolean,
): Promise<boolean> {
  // Parse address within the provided csl scope to avoid pointer issues
  let wasmAddr: any
  if (csl.ByronAddress.isValid(address)) {
    const byronAddr = csl.ByronAddress.fromBase58(address)
    wasmAddr = byronAddr.toAddress()
  } else {
    wasmAddr = isHex(address)
      ? csl.Address.fromHex(address)
      : csl.Address.fromBech32(address)
  }

  if (wasmAddr == null || wasmAddr.isMalformed())
    throw new Error(`addrContainsAccountKey invalid address ${address}`)

  const accountKeyString = Buffer.from(targetAccountKey.toBytes()).toString(
    'hex',
  )

  const baseAddress = csl.BaseAddress.fromAddress(wasmAddr)
  if (baseAddress != null) {
    const stakeCredBytes = baseAddress.stakeCred().toBytes()
    if (Buffer.from(stakeCredBytes).toString('hex') === accountKeyString) {
      return true
    }
  }

  // Pointer addresses don't contain stake credentials directly
  // They reference stake credentials by pointer (slot, txIndex, certIndex)
  // We can't extract the credential from a pointer address, so we skip this check
  const asPointer = csl.PointerAddress.fromAddress(wasmAddr)
  if (asPointer != null) {
    // Pointer addresses can't be matched by stake credential directly
    // Return false or accept type mismatch based on flag
    return acceptTypeMismatch
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
