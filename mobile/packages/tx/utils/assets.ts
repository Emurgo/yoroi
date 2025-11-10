// Cardano asset utilities
// Functions for working with Cardano assets and tokens
import {AssetName, MultiAsset, ScriptHash, Value} from '@emurgo/cross-csl-core'
import {BigNumber} from 'bignumber.js'

import {CardanoMobileWrapped} from '../../../src/wallets/cardano/wrappedCsl'
import {RemoteUnspentOutput, SendToken, Token} from '../types'
import {MultiToken} from '../types/multi-token'

/**
 * Convert MultiToken to Cardano Value
 */
export async function cardanoValueFromMultiToken(
  tokens: MultiToken,
): Promise<Value> {
  return CardanoMobileWrapped.cslScope((wasm) => {
    const value = wasm.Value.new(
      wasm.BigNum.fromStr(tokens.getDefaultEntry().amount.toString()),
    )
    // recall: primary asset counts towards size
    if (tokens.size() === 1) return value

    const assets = wasm.MultiAsset.new()
    for (const entry of tokens.nonDefaultEntries()) {
      const {policyId, name} = identifierToCardanoAsset(wasm, entry.identifier)

      const asset = assets.get(policyId)

      const policyContent = asset ?? wasm.Assets.new()

      policyContent.insert(name, wasm.BigNum.fromStr(entry.amount.toString()))
      // recall: we always have to insert since WASM returns copies of objects
      assets.insert(policyId, policyContent)
    }
    if (assets.len() > 0) {
      value.setMultiasset(assets)
    }
    return value
  })
}

/**
 * Convert Cardano Value to MultiToken
 */
export async function multiTokenFromCardanoValue(
  value: Value,
  defaults: Token,
): Promise<MultiToken> {
  return CardanoMobileWrapped.cslScope((wasm) => {
    const multiToken = new MultiToken([], defaults)
    const coin = value.coin()
    multiToken.add({
      amount: new BigNumber(coin.toStr()),
      identifier: defaults.identifier,
    })

    const ma = value.multiasset()
    if (ma) {
      for (const token of parseTokenList(wasm, ma)) {
        multiToken.add({
          amount: new BigNumber(token.amount),
          identifier: token.assetId,
        })
      }
    }
    return multiToken
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
  wasm: import('@emurgo/cross-csl-core').WasmModuleProxy,
  identifier: string,
): {
  policyId: ScriptHash
  name: AssetName
} {
  const parts = identifier.split('.')
  const policyIdHex = parts[0]!
  const assetNameHex = parts[1]!
  // Use fromHex for hex strings (preferred method in CSL)
  const policyId = wasm.ScriptHash.fromHex(policyIdHex)
  const name = wasm.AssetName.fromHex(assetNameHex)
  return {policyId, name}
}

/**
 * Build send token list from tokens and UTXOs
 */
export function buildSendTokenList(
  defaultToken: Token,
  tokens: SendToken[],
  utxos: Array<MultiToken>,
): MultiToken {
  const amount = new MultiToken([], defaultToken)

  for (const token of tokens) {
    if (token.amount != null) {
      // if we add a specific amount of a specific token to the output, just add it
      amount.add({
        amount: new BigNumber(token.amount),
        identifier: token.token.identifier,
      })
    } else if (token.shouldSendAll) {
      // if we want to send all of a specific token, sum it from all utxos
      const total = utxos.reduce((sum, utxo) => {
        const tokenAmount = utxo.get(token.token.identifier)
        if (tokenAmount != null) {
          return sum.plus(tokenAmount)
        }
        return sum
      }, new BigNumber(0))

      amount.add({
        amount: total,
        identifier: token.token.identifier,
      })
    }
  }

  return amount
}

/**
 * Convert remote UTXO format to MultiToken
 */
export function multiTokenFromRemote(
  utxo: RemoteUnspentOutput,
  defaultToken: Token,
): MultiToken {
  const multiToken = new MultiToken([], defaultToken)

  multiToken.add({
    amount: new BigNumber(utxo.amount),
    identifier: defaultToken.identifier,
  })

  for (const asset of utxo.assets) {
    multiToken.add({
      amount: new BigNumber(asset.amount),
      identifier: asset.assetId,
    })
  }

  return multiToken
}

/**
 * Parse token list from MultiAsset
 */
export function parseTokenList(
  _wasm: import('@emurgo/cross-csl-core').WasmModuleProxy,
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
        amount: amount.toStr(),
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
