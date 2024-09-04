import {CardanoTypes} from '../../types'

export const parseDrepId = async (
  drepId: string,
  cardano: CardanoTypes.Wasm,
): Promise<{type: 'key'; hash: string} | {type: 'script'; hash: string}> => {
  const keyPrefix = drepId.startsWith('drep1')
  const scriptPrefix = drepId.startsWith('drep_script1')

  if (!keyPrefix && !scriptPrefix)
    throw new Error(
      'Invalid DRep ID. Must have a valid key or script bech32 format',
    )

  if (keyPrefix) {
    const isValidDrepKeyHashBech32Format = await getIsValidDrepKeyBech32Format(
      drepId,
      cardano,
    )

    if (!isValidDrepKeyHashBech32Format)
      throw new Error('Invalid key DRep ID. Must have a valid bech32 format')

    const keyHash = await convertBech32ToKeyHash(drepId, cardano)
    const type = 'key'

    return {
      type,
      hash: keyHash,
    }
  }

  const isValidDrepScriptBech32Format = await getIsValidDrepScriptBech32Format(
    drepId,
    cardano,
  )

  if (!isValidDrepScriptBech32Format)
    throw new Error('Invalid script DRep ID. Must have a valid bech32 format')

  const scriptHash = await convertBech32ToScriptHash(drepId, cardano)
  const type = 'script'

  return {
    type,
    hash: scriptHash,
  }
}

const getIsValidDrepKeyBech32Format = async (
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

const getIsValidDrepScriptBech32Format = async (
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

const convertBech32ToKeyHash = async (
  drepId: string,
  cardano: CardanoTypes.Wasm,
): Promise<string> => {
  const keyHash = await cardano.Ed25519KeyHash.fromBech32(drepId)
  return await keyHash.toHex()
}

const convertBech32ToScriptHash = async (
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
