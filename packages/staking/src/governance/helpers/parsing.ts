import {CardanoTypes} from '../../types'

/*
 * @param {string} drepId - DRep ID in bech32 format or key hash format
 * @param {CardanoTypes.Wasm} cardano
 * @returns {Promise<string>} drepKeyHash
 * @throws {Error} if drepId is not a valid bech32 format or key hash format
 */
export const parseDrepId = async (
  drepId: string,
  cardano: CardanoTypes.Wasm,
): Promise<string> => {
  const isValidBech32 =
    drepId.startsWith('drep1') &&
    (await isValidDrepBech32Format(drepId, cardano))
  const isValidKeyHash = drepId.length === 56 && /^[0-9a-fA-F]+$/.test(drepId)

  if (!isValidBech32 && !isValidKeyHash) {
    const message =
      'Invalid DRep ID. Must have a valid bech32 format or a valid key hash format.'
    throw new Error(message)
  }

  return isValidKeyHash ? drepId : await convertBech32ToKeyHash(drepId, cardano)
}

const isValidDrepBech32Format = async (
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

const convertBech32ToKeyHash = async (
  drepId: string,
  cardano: CardanoTypes.Wasm,
): Promise<string> => {
  const keyHash = await cardano.Ed25519KeyHash.fromBech32(drepId)
  return await keyHash.toHex()
}

export const convertHexKeyHashToBech32Format = async (
  drepId: string,
  cardano: CardanoTypes.Wasm,
): Promise<string> => {
  const keyHash = await cardano.Ed25519KeyHash.fromHex(drepId)
  return await keyHash.toBech32('drep')
}
