// Cardano asset utilities
// Functions for working with Cardano assets and tokens
import {Balance} from '@yoroi/types'

import {AssetName, MultiAsset, ScriptHash, Value} from '@emurgo/cross-csl-core'
import {BigNumber} from 'bignumber.js'

import {CardanoMobileWrapped} from '../../../src/wallets/cardano/wrappedCsl'
import {RemoteUnspentOutput, SendToken} from '../types'

/**
 * Convert Balance.Amounts to Cardano Value
 *
 * WARNING: Returns a WASM Value object that will be freed when the cslScope exits.
 * Only use the returned Value within the same scope where it was created, or extract
 * primitive values before the scope exits.
 */
export async function cardanoValueFromAmounts(
  amounts: Balance.Amounts,
  primaryTokenId: string,
): Promise<Value> {
  return CardanoMobileWrapped.cslScope((csl) => {
    const adaAmount = amounts[primaryTokenId] || '0'
    const value = csl.Value.new(csl.BigNum.fromStr(adaAmount))

    // Get all asset IDs except primary token
    const assetIds = Object.keys(amounts).filter((id) => id !== primaryTokenId)

    if (assetIds.length === 0) return value

    const multiAsset = csl.MultiAsset.new()

    // Group assets by policy ID
    const groupedByPolicyId = assetIds.reduce(
      (acc, assetId) => {
        const policyId = assetId.substring(0, 56) // Policy ID is first 56 hex chars
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
        const assetNameHex = assetId.substring(56) // Asset name is after policy ID
        const name = csl.AssetName.new(
          new Uint8Array(Buffer.from(assetNameHex, 'hex')),
        )
        const amount = csl.BigNum.fromStr(amounts[assetId] ?? '0')
        assets.insert(name, amount)
      }

      multiAsset.insert(policyId, assets)
    }

    if (multiAsset.len() > 0) {
      value.setMultiasset(multiAsset)
    }
    return value
  })
}

/**
 * Convert Cardano Value to Balance.Amounts
 */
export async function amountsFromCardanoValue(
  value: Value,
  primaryTokenId: string,
): Promise<Balance.Amounts> {
  return CardanoMobileWrapped.cslScope((csl) => {
    const amounts: Balance.Amounts = {} as Balance.Amounts

    // Add primary token (ADA)
    const coin = value.coin()
    amounts[primaryTokenId] = coin.toStr() as Balance.Quantity

    // Add other assets
    const ma = value.multiasset()
    if (ma) {
      for (const token of parseTokenList(csl, ma)) {
        amounts[token.assetId] = token.amount as Balance.Quantity
      }
    }

    return amounts
  })
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
  csl: import('@emurgo/cross-csl-core').WasmModuleProxy,
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
 */
export function amountsFromRemote(
  utxo: RemoteUnspentOutput,
  primaryTokenId: string,
): Balance.Amounts {
  const amounts: Balance.Amounts = {} as Balance.Amounts

  // Add primary token (ADA)
  amounts[primaryTokenId] = utxo.amount as Balance.Quantity

  // Add other assets
  for (const asset of utxo.assets) {
    amounts[asset.assetId] = asset.amount as Balance.Quantity
  }

  return amounts
}

/**
 * Parse token list from MultiAsset
 */
export function parseTokenList(
  _csl: import('@emurgo/cross-csl-core').WasmModuleProxy,
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
 */
export function resolveCip67Tag(assetNameHEX: string): {
  hexName: string
  tag: string | null
} {
  if (assetNameHEX.length < 4) {
    return {hexName: assetNameHEX, tag: null}
  }

  const tag = assetNameHEX.substring(0, 4)
  const hexName = assetNameHEX.substring(4)

  // CIP-67 tags are 2 bytes (4 hex chars) representing a number
  // Valid tags are typically in specific ranges
  // For now, we'll return the tag if it exists
  return {hexName, tag}
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
