import {WasmModuleProxy} from '@emurgo/cross-csl-core'
import {bech32 as bech32Module} from 'bech32'

export const parseDrepId = (
  drepId: string,
  csl: WasmModuleProxy,
): {type: 'key'; hash: string} | {type: 'script'; hash: string} => {
  const isPotentiallyValidHex = /^(22|23)[0-9a-fA-F]{56}$/.test(drepId)

  if (drepId.startsWith('drep_vkh1') && isValidBech32KeyHash(drepId, csl)) {
    return {
      type: 'key',
      hash: convertBech32KeyHashToHex(drepId, csl),
    }
  }

  if (drepId.startsWith('drep1') && isValidBech32KeyHash(drepId, csl)) {
    return {
      type: 'key',
      hash: convertBech32KeyHashToHex(drepId, csl),
    }
  }

  if (
    drepId.startsWith('drep_script1') &&
    isValidBech32ScriptHash(drepId, csl)
  ) {
    return {
      type: 'script',
      hash: convertBech32ScriptHashToHex(drepId, csl),
    }
  }

  if (drepId.startsWith('drep1') && drepId.length === 58) {
    const base32Parsed = base32ToHex(drepId)
    if (!base32Parsed) {
      throw new Error('Invalid key DRep ID. Must have 58 hex characters')
    }
    return parseDrepId(base32Parsed, csl)
  }

  if (
    isPotentiallyValidHex &&
    drepId.startsWith('22') &&
    isValidHexKeyHash(drepId.substr(2), csl)
  ) {
    return {
      type: 'key',
      hash: drepId.substr(2),
    }
  }

  if (
    isPotentiallyValidHex &&
    drepId.startsWith('23') &&
    isValidHexScriptHash(drepId.substr(2), csl)
  ) {
    return {
      type: 'script',
      hash: drepId.substr(2),
    }
  }

  throw new Error(
    'Invalid DRep ID. Must have a valid key or script bech32 format',
  )
}

const isValidBech32KeyHash = (
  drepId: string,
  csl: WasmModuleProxy,
): boolean => {
  try {
    csl.Ed25519KeyHash.fromBech32(drepId)
    return true
  } catch (e) {
    return false
  }
}

const isValidBech32ScriptHash = (
  drepId: string,
  csl: WasmModuleProxy,
): boolean => {
  try {
    csl.ScriptHash.fromBech32(drepId)
    return true
  } catch (e) {
    return false
  }
}

const isValidHexScriptHash = (
  drepId: string,
  csl: WasmModuleProxy,
): boolean => {
  try {
    csl.ScriptHash.fromHex(drepId)
    return true
  } catch (e) {
    return false
  }
}

const isValidHexKeyHash = (drepId: string, csl: WasmModuleProxy): boolean => {
  try {
    csl.Ed25519KeyHash.fromHex(drepId)
    return true
  } catch (e) {
    return false
  }
}

const convertBech32KeyHashToHex = (
  drepId: string,
  csl: WasmModuleProxy,
): string => {
  const keyHash = csl.Ed25519KeyHash.fromBech32(drepId)
  return keyHash.toHex()
}

const convertBech32ScriptHashToHex = (
  drepId: string,
  csl: WasmModuleProxy,
): string => {
  const scriptHash = csl.ScriptHash.fromBech32(drepId)
  return scriptHash.toHex()
}

export const convertHexKeyHashToBech32Format = (
  drepId: string,
  csl: WasmModuleProxy,
): string => {
  const keyHash = csl.Ed25519KeyHash.fromHex(drepId)
  return keyHash.toBech32('drep')
}

const base32ToHex = (base32: string): string | null => {
  try {
    const base32Words = bech32Module.decode(base32, base32.length)
    return base32Words?.words ? convertBase32ToHex(base32Words.words) : null
  } catch (e) {
    return null
  }
}

const convertBase32ToHex = (words: number[]): string => {
  return Buffer.from(bech32Module.fromWords(words)).toString('hex')
}

export const convertDrepHashToCIP129Format = (
  hash: string,
  kind: 'key' | 'script',
) => {
  const prefix = kind === 'script' ? '23' : '22'
  return hexToBase32(prefix + hash, 'drep')
}

export const convertDrepHashToCIP105Format = (hash: string) => {
  return hexToBase32(hash, 'drep')
}

const hexToBase32 = (hex: string, prefix: string): string => {
  return bech32Module.encode(
    prefix,
    bech32Module.toWords(Buffer.from(hex, 'hex')),
  )
}
