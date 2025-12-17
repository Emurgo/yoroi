// Cardano asset utilities
// Functions for working with Cardano assets and tokens
import {Balance, TokenId} from '@yoroi/types'

import {
  AssetName,
  MultiAsset,
  ScriptHash,
  Value,
  WasmModuleProxy,
} from '@emurgo/cross-csl-core'
import {BigNumber} from 'bignumber.js'

import {RemoteUnspentOutput, SendToken} from '../types'

/**
 * Convert Balance.Amounts to Cardano Value
 *
 * NOTE: Pass CardanoMobile as the csl parameter.
 * With wrappedCSL mode, memory management is automatic.
 */
export function cardanoValueFromAmounts(
  csl: WasmModuleProxy,
  amounts: Balance.Amounts,
  primaryTokenId: TokenId,
): Value {
  const adaAmount = amounts[primaryTokenId] || '0'
  const value = csl.Value.new(csl.BigNum.fromStr(adaAmount))

  // Get all asset IDs except primary token
  const assetIds = Object.keys(amounts).filter((id) => id !== primaryTokenId)

  if (assetIds.length === 0) return value

  const multiAsset = csl.MultiAsset.new()

  // Group assets by policy ID
  const groupedByPolicyId = assetIds.reduce(
    (acc, assetId) => {
      // assetId is in format "policyId.assetNameHex" (Portfolio.Token.Id format)
      const [policyId] = assetId.split('.')
      if (!policyId) return acc
      acc[policyId] = acc[policyId] ?? []
      acc[policyId]!.push(assetId)
      return acc
    },
    {} as Record<string, Array<string>>,
  )

  // Create MultiAsset structure
  for (const policyIdStr of Object.keys(groupedByPolicyId)) {
    const assetGroup = groupedByPolicyId[policyIdStr]
    if (!assetGroup) continue

    const policyId = csl.ScriptHash.fromBytes(
      new Uint8Array(Buffer.from(policyIdStr, 'hex')),
    )
    const assets = csl.Assets.new()

    for (const assetId of assetGroup) {
      const [, assetNameHex] = assetId.split('.')
      if (!assetNameHex) continue
      const name = csl.AssetName.new(
        new Uint8Array(Buffer.from(assetNameHex, 'hex')),
      )
      const amount = csl.BigNum.fromStr(amounts[assetId as TokenId] ?? '0')
      assets.insert(name, amount)
    }

    multiAsset.insert(policyId, assets)
  }

  if (multiAsset.len() > 0) {
    value.setMultiasset(multiAsset)
  }
  return value
}

/**
 * Convert Cardano Value to Balance.Amounts
 *
 * NOTE: Pass CardanoMobile as the csl parameter.
 * With wrappedCSL mode, memory management is automatic.
 */
export function amountsFromCardanoValue(
  csl: WasmModuleProxy,
  value: Value,
  primaryTokenId: TokenId,
): Balance.Amounts {
  const amounts: Balance.Amounts = {} as Balance.Amounts

  // Add primary token (ADA)
  const coin = value.coin()
  amounts[primaryTokenId] = coin.toStr() as Balance.Quantity

  // Add other assets
  const ma = value.multiasset()
  if (ma) {
    for (const token of parseTokenList(csl, ma)) {
      amounts[token.assetId as TokenId] = token.amount as Balance.Quantity
    }
  }

  return amounts
}

/**
 * Convert Cardano asset to identifier string
 */
export function cardanoAssetToIdentifier(
  policyId: ScriptHash,
  name: AssetName,
): string {
  // note: possible for name to be empty causing a trailing hyphen
  return `${Buffer.from(policyId.toBytes()).toString('hex')}.${Buffer.from(name.name()).toString('hex')}`
}

/**
 * Convert identifier string to Cardano asset
 */
export function identifierToCardanoAsset(
  csl: WasmModuleProxy,
  identifier: string,
): {
  policyId: ScriptHash
  name: AssetName
} {
  const parts = identifier.split('.')
  const policyIdHex = parts[0]!
  const assetNameHex = parts[1]!
  // Use fromHex for hex strings (preferred method in CSL)
  const policyId = csl.ScriptHash.fromHex(policyIdHex)
  const name = csl.AssetName.fromHex(assetNameHex)
  return {policyId, name}
}

/**
 * Build send token list from tokens and UTXOs
 */
export function buildSendTokenList(
  _primaryTokenId: string,
  tokens: SendToken[],
  utxos: Array<Balance.Amounts>,
): Balance.Amounts {
  const amounts: Balance.Amounts = {} as Balance.Amounts

  for (const token of tokens) {
    if (token.amount != null) {
      // if we add a specific amount of a specific token to the output, just add it
      const tokenId = token.token.identifier
      const currentAmount = amounts[tokenId] || '0'
      const newAmount = new BigNumber(currentAmount)
        .plus(token.amount)
        .toString()
      amounts[tokenId] = newAmount as Balance.Quantity
    } else if (token.shouldSendAll) {
      // if we want to send all of a specific token, sum it from all utxos
      const tokenId = token.token.identifier
      const total = utxos.reduce((sum, utxo) => {
        const tokenAmount = utxo[tokenId]
        if (tokenAmount != null) {
          return sum.plus(tokenAmount)
        }
        return sum
      }, new BigNumber(0))

      amounts[tokenId] = total.toString() as Balance.Quantity
    }
  }

  return amounts
}

/**
 * Convert remote UTXO format to Balance.Amounts
 * Now simply returns the balance field directly since RemoteUnspentOutput uses Balance.Amounts
 */
export function amountsFromRemote(
  utxo: RemoteUnspentOutput,
  _primaryTokenId: string, // Kept for backward compatibility but not used
): Balance.Amounts {
  return utxo.balance
}

/**
 * Parse token list from MultiAsset
 */
export function parseTokenList(
  _csl: WasmModuleProxy,
  assets: MultiAsset,
): Array<{assetId: string; amount: string}> {
  const result: Array<{assetId: string; amount: string}> = []

  const policyHashes = assets.keys()
  for (let i = 0; i < policyHashes.len(); i++) {
    const policyId = policyHashes.get(i)
    const assetsForPolicy = assets.get(policyId)
    if (!assetsForPolicy) continue

    const assetNames = assetsForPolicy.keys()
    for (let j = 0; j < assetNames.len(); j++) {
      const assetName = assetNames.get(j)
      const amount = assetsForPolicy.get(assetName)
      if (!amount) continue

      const assetId = cardanoAssetToIdentifier(policyId, assetName)
      result.push({
        assetId,
        amount: amount.toStr() as Balance.Quantity,
      })
    }
  }

  return result
}

/**
 * ASCII asset name blacklist
 */
export const ASCII_ASSET_NAME_BLACKLIST = [
  'ADA',
  'ADAF',
  'ADAT',
  'ADAB',
  'ADAN',
  'ADAC',
  'ADAL',
  'ADAR',
  'ADAS',
  'ADAI',
  'ADAM',
  'ADAP',
  'ADAU',
  'ADAV',
  'ADAW',
  'ADAX',
  'ADAY',
  'ADAZ',
] as const

/**
 * Resolve CIP-67 tag from asset name hex
 * CIP-67 tags are 4 bytes (8 hex chars)
 */
export function resolveCip67Tag(assetNameHEX: string): {
  hexName: string
  tag: string | null
} {
  if (assetNameHEX.length < 8) {
    return {hexName: assetNameHEX, tag: null}
  }

  // First, check if the entire hex decodes to valid ASCII
  // If it does, it's likely not a tagged asset name
  try {
    const fullBytes = Buffer.from(assetNameHEX, 'hex')
    const fullAscii = fullBytes.toString('ascii')
    if (/^[\x20-\x7E]*$/.test(fullAscii)) {
      // Entire hex is valid ASCII, no tag
      return {hexName: assetNameHEX, tag: null}
    }
  } catch {
    // Not valid hex or not ASCII, continue to check for tag
  }

  // Extract potential tag (first 8 hex chars = 4 bytes)
  const tag = assetNameHEX.substring(0, 8)
  const hexName = assetNameHEX.substring(8)

  // CIP-67 tags are 4 bytes (8 hex chars)
  // Check if remaining hex can be decoded as ASCII
  if (hexName.length > 0) {
    try {
      const remainingBytes = Buffer.from(hexName, 'hex')
      const remainingAscii = remainingBytes.toString('ascii')
      // If remaining hex is valid ASCII, it's likely a CIP-67 tag
      if (/^[\x20-\x7E]*$/.test(remainingAscii)) {
        return {hexName, tag}
      }
    } catch {
      // Invalid hex, not a tag
    }
  }

  // Not a valid CIP-67 tag, return original hex as hexName
  return {hexName: assetNameHEX, tag: null}
}

/**
 * Resolve ASCII name from hex
 */
export function resolveAsciiName(hexName: string): string | null {
  try {
    const bytes = Buffer.from(hexName, 'hex')
    const ascii = bytes.toString('ascii')
    // Check if it's valid ASCII (printable characters)
    if (/^[\x20-\x7E]*$/.test(ascii)) {
      return ascii
    }
  } catch {
    // Invalid hex
  }
  return null
}

/**
 * Resolve asset properties (tag + ASCII name)
 */
export function resolveAssetProperties(assetNameHEX: string): {
  tag: string | null
  asciiName: string | null
} {
  const {hexName, tag} = resolveCip67Tag(assetNameHEX)
  const asciiName = resolveAsciiName(hexName)
  return {tag, asciiName}
}

/**
 * Asset name utilities (for backward compatibility)
 * @deprecated Use individual functions instead
 */
export const AssetNameUtils = {
  ASCII_ASSET_NAME_BLACKLIST,
  resolveCip67Tag,
  resolveAsciiName,
  resolveProperties: resolveAssetProperties,
} as const
