// Cardano address utilities
// Cardano-specific address normalization and manipulation functions
import {CardanoMobileWrapped, isHex} from '@yoroi/common'
import {Address, AddressBech32, AddressHex} from '@yoroi/types'

import {
  Bip32PublicKey,
  Credential,
  Address as CslAddress,
  WasmModuleProxy,
} from '@emurgo/cross-csl-core'

import {Addressing} from '../types'

/**
 * Check if an address is a Byron address by checking common prefixes
 * This is a fast check that doesn't require CSL parsing
 * @param address - The address string to check
 * @returns true if the address appears to be a Byron address, false otherwise
 */
export function isByronAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false
  }
  const trimmed = address.trim()
  return (
    trimmed.startsWith('DdzFF') ||
    trimmed.startsWith('Ae2') ||
    trimmed.startsWith('37btjr')
  )
}

/**
 * Address information extracted from WASM objects (safe to use outside cslScope)
 */
export type AddressInfo = {
  networkId: number
  hex: AddressHex
  bech32: AddressBech32 | null
  isValid: boolean
}

/**
 * Validate address and extract all needed information in one scope
 * This is the preferred way to validate addresses as it extracts primitive values
 * before the WASM objects are freed
 */
export async function validateAndExtractAddressInfo(
  addr: Address | string,
): Promise<AddressInfo | undefined> {
  return CardanoMobileWrapped.cslScope((csl) => {
    const addrStr = typeof addr === 'string' ? addr : addr
    let address: CslAddress

    // 1) Try converting from base58
    if (csl.ByronAddress.isValid(addrStr)) {
      const byronAddr = csl.ByronAddress.fromBase58(addrStr)
      const byronAddress = byronAddr.toAddress()
      if (!byronAddress) {
        return undefined
      }
      address = byronAddress
    } else {
      const isHexAddr = isHex(addrStr)
      const parsedAddress = isHexAddr
        ? csl.Address.fromHex(addrStr)
        : csl.Address.fromBech32(addrStr)
      if (!parsedAddress) {
        return undefined
      }
      address = parsedAddress
    }

    if (address.isMalformed()) {
      return undefined
    }

    // Extract all needed values before scope exits
    const networkId = address.networkId()
    const hex = address.toHex() as AddressHex
    const bech32 = (address.toBech32(undefined) ?? null) as AddressBech32 | null

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
 * NOTE: This function must use the same csl instance as the caller to avoid
 * NULL pointer errors. All CSL objects must be created from the same instance.
 *
 * WARNING: The returned Address object is a WASM object that will be freed when
 * the cslScope exits. Do NOT use it outside the scope where it was created.
 *
 * For safe usage, use validateAndExtractAddressInfo() instead, which extracts
 * primitive values (networkId, hex, bech32) before the scope exits.
 */
export function normalizeToAddress(
  csl: WasmModuleProxy,
  addr: Address | string,
): CslAddress | undefined {
  const addrStr = typeof addr === 'string' ? addr : addr
  // in Shelley, addresses can be base16, bech32 or base58
  // this function, we try parsing in all encodings possible

  // 1) Try converting from base58
  if (csl.ByronAddress.isValid(addrStr)) {
    const byronAddr = csl.ByronAddress.fromBase58(addrStr)
    const address = byronAddr.toAddress()
    if (!address || address.isMalformed()) {
      return undefined
    }
    return address
  }

  const isHexAddr = isHex(addrStr)
  const address = isHexAddr
    ? csl.Address.fromHex(addrStr)
    : csl.Address.fromBech32(addrStr)
  if (!address) {
    return undefined
  }
  const isMalformed = address.isMalformed()
  // Return undefined when malformed for backward compatibility
  return isMalformed ? undefined : address
}

/**
 * Filter addresses by staking key
 * NOTE: This function must use the same csl instance as the caller to avoid
 * NULL pointer errors. All CSL objects must be created from the same instance.
 */
export async function filterAddressesByStakingKey<
  T extends {receiver: Address},
>(
  csl: WasmModuleProxy,
  stakingKey: Credential,
  utxos: ReadonlyArray<T>,
  acceptTypeMismatch: boolean,
): Promise<ReadonlyArray<T>> {
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
}

/**
 * Check if address contains account key
 * NOTE: This function expects to be called within a cslScope, and will parse
 * the address within that same scope to avoid WASM pointer issues
 */
export async function addrContainsAccountKey(
  csl: WasmModuleProxy,
  address: Address | string,
  targetAccountKey: Credential,
  acceptTypeMismatch: boolean,
): Promise<boolean> {
  // Parse address within the provided csl scope to avoid pointer issues
  const addrStr = typeof address === 'string' ? address : address
  let wasmAddr: CslAddress

  if (csl.ByronAddress.isValid(addrStr)) {
    const byronAddr = csl.ByronAddress.fromBase58(addrStr)
    const byronAddress = byronAddr.toAddress()
    if (!byronAddress || byronAddress.isMalformed()) {
      throw new Error(`addrContainsAccountKey invalid address ${addrStr}`)
    }
    wasmAddr = byronAddress
  } else {
    const parsedAddress = isHex(addrStr)
      ? csl.Address.fromHex(addrStr)
      : csl.Address.fromBech32(addrStr)
    if (!parsedAddress || parsedAddress.isMalformed()) {
      throw new Error(`addrContainsAccountKey invalid address ${addrStr}`)
    }
    wasmAddr = parsedAddress
  }

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
