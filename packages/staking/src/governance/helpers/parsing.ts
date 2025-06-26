import {bech32 as bech32Module} from 'bech32'

import {CardanoTypes} from '../../types'

export const parseDrepId = async (
  drepId: string,
  cardano: CardanoTypes.Wasm,
): Promise<{type: 'key'; hash: string} | {type: 'script'; hash: string}> => {
  const isPotentiallyValidHex = /^(22|23)[0-9a-fA-F]{56}$/.test(drepId)

  if (
    drepId.startsWith('drep_vkh1') &&
    (await isValidBech32KeyHash(drepId, cardano))
  ) {
    return {
      type: 'key',
      hash: await convertBech32KeyHashToHex(drepId, cardano),
    }
  }

  if (
    drepId.startsWith('drep1') &&
    (await isValidBech32KeyHash(drepId, cardano))
  ) {
    return {
      type: 'key',
      hash: await convertBech32KeyHashToHex(drepId, cardano),
    }
  }

  if (
    drepId.startsWith('drep_script1') &&
    (await isValidBech32ScriptHash(drepId, cardano))
  ) {
    return {
      type: 'script',
      hash: await convertBech32ScriptHashToHex(drepId, cardano),
    }
  }

  if (drepId.startsWith('drep1') && drepId.length === 58) {
    const base32Parsed = base32ToHex(drepId)
    if (!base32Parsed) {
      throw new Error('Invalid key DRep ID. Must have 58 hex characters')
    }
    return parseDrepId(base32Parsed, cardano)
  }

  if (
    isPotentiallyValidHex &&
    drepId.startsWith('22') &&
    (await isValidHexKeyHash(drepId.substr(2), cardano))
  ) {
    return {
      type: 'key',
      hash: drepId.substr(2),
    }
  }

  if (
    isPotentiallyValidHex &&
    drepId.startsWith('23') &&
    (await isValidHexScriptHash(drepId.substr(2), cardano))
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

const isValidBech32KeyHash = async (
  drepId: string,
  cardano: CardanoTypes.Wasm,
): Promise<boolean> => {
  try {
    await cardano.Ed25519KeyHash.fromBech32(drepId)
    return true
  } catch (e) {
    return false
  }
}

const isValidBech32ScriptHash = async (
  drepId: string,
  cardano: CardanoTypes.Wasm,
): Promise<boolean> => {
  try {
    await cardano.ScriptHash.fromBech32(drepId)
    return true
  } catch (e) {
    return false
  }
}

const isValidHexScriptHash = async (
  drepId: string,
  cardano: CardanoTypes.Wasm,
): Promise<boolean> => {
  try {
    await cardano.ScriptHash.fromHex(drepId)
    return true
  } catch (e) {
    return false
  }
}

const isValidHexKeyHash = async (
  drepId: string,
  cardano: CardanoTypes.Wasm,
): Promise<boolean> => {
  try {
    await cardano.Ed25519KeyHash.fromHex(drepId)
    return true
  } catch (e) {
    return false
  }
}

const convertBech32KeyHashToHex = async (
  drepId: string,
  cardano: CardanoTypes.Wasm,
): Promise<string> => {
  const keyHash = await cardano.Ed25519KeyHash.fromBech32(drepId)
  return await keyHash.toHex()
}

const convertBech32ScriptHashToHex = async (
  drepId: string,
  cardano: CardanoTypes.Wasm,
): Promise<string> => {
  const scriptHash = await cardano.ScriptHash.fromBech32(drepId)
  return await scriptHash.toHex()
}

export const convertHexKeyHashToBech32Format = async (
  drepId: string,
  cardano: CardanoTypes.Wasm,
): Promise<string> => {
  const keyHash = await cardano.Ed25519KeyHash.fromHex(drepId)
  return await keyHash.toBech32('drep')
}

const base32ToHex = (base32: string): string | null => {
  const base32Words = bech32Module.decodeUnsafe(base32, base32.length)
  return base32Words?.words ? convertBase32ToHex(base32Words.words) : null
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
