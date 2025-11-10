// Cardano asset utilities
// Functions for working with Cardano assets and tokens

import {
  AssetName,
  MultiAsset,
  ScriptHash,
  Value,
  WasmModuleProxy,
} from '@emurgo/cross-csl-core'
import {BigNumber} from 'bignumber.js'

import {RemoteUnspentOutput, SendToken, Token} from '../types'
import {MultiToken} from '../types/multi-token'

/**
 * Convert MultiToken to Cardano Value
 */
export async function cardanoValueFromMultiToken(
  wasm: WasmModuleProxy,
  tokens: MultiToken,
): Promise<Value> {
  const value = await wasm.Value.new(
    await wasm.BigNum.fromStr(tokens.getDefaultEntry().amount.toString()),
  )
  // recall: primary asset counts towards size
  if (tokens.size() === 1) return value

  const assets = await wasm.MultiAsset.new()
  for (const entry of tokens.nonDefaultEntries()) {
    const {policyId, name} = await identifierToCardanoAsset(
      wasm,
      entry.identifier,
    )

    const asset = await assets.get(policyId)

    const policyContent = asset ?? (await wasm.Assets.new())

    await policyContent.insert(
      name,
      await wasm.BigNum.fromStr(entry.amount.toString()),
    )
    // recall: we always have to insert since WASM returns copies of objects
    assets.insert(policyId, policyContent)
  }
  if ((await assets.len()) > 0) {
    await value.setMultiasset(assets)
  }
  return value
}

/**
 * Convert Cardano Value to MultiToken
 */
export async function multiTokenFromCardanoValue(
  value: Value,
  defaults: Token,
): Promise<MultiToken> {
  const multiToken = new MultiToken([], defaults)
  const coin = await value.coin()
  multiToken.add({
    amount: new BigNumber(await coin.toStr()),
    identifier: defaults.identifier,
  })

  const ma = await value.multiasset()
  if (ma) {
    for (const token of await parseTokenList(ma)) {
      multiToken.add({
        amount: new BigNumber(token.amount),
        identifier: token.assetId,
      })
    }
  }
  return multiToken
}

/**
 * Convert Cardano asset to identifier string
 */
export async function cardanoAssetToIdentifier(
  policyId: ScriptHash,
  name: AssetName,
): Promise<string> {
  // note: possible for name to be empty causing a trailing hyphen
  return `${Buffer.from(await policyId.toBytes()).toString(
    'hex',
  )}.${Buffer.from(await name.name()).toString('hex')}`
}

/**
 * Convert identifier string to Cardano asset
 */
export async function identifierToCardanoAsset(
  wasm: WasmModuleProxy,
  identifier: string,
): Promise<{
  policyId: ScriptHash
  name: AssetName
}> {
  const parts = identifier.split('.')
  return {
    policyId: await wasm.ScriptHash.fromBytes(Buffer.from(parts[0], 'hex')),
    name: await wasm.AssetName.new(Buffer.from(parts[1], 'hex')),
  }
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
export async function parseTokenList(
  assets: MultiAsset,
): Promise<Array<{assetId: string; amount: string}>> {
  const result: Array<{assetId: string; amount: string}> = []

  const policyHashes = await assets.keys()
  for (let i = 0; i < (await policyHashes.len()); i++) {
    const policyId = await policyHashes.get(i)
    const assetsForPolicy = await assets.get(policyId)
    if (!assetsForPolicy) continue

    const assetNames = await assetsForPolicy.keys()
    for (let j = 0; j < (await assetNames.len()); j++) {
      const assetName = await assetNames.get(j)
      const amount = await assetsForPolicy.get(assetName)
      if (!amount) continue

      const assetId = await cardanoAssetToIdentifier(policyId, assetName)
      result.push({
        assetId,
        amount: await amount.toStr(),
      })
    }
  }

  return result
}

/**
 * Asset name utilities
 */
export class AssetNameUtils {
  static readonly ASCII_ASSET_NAME_BLACKLIST = [
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
  ]

  /**
   * Resolve CIP-67 tag from asset name hex
   */
  static resolveCip67Tag(assetNameHEX: string): {
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
  static resolveAsciiName(hexName: string): string | null {
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
  static resolveProperties(assetNameHEX: string): {
    tag: string | null
    asciiName: string | null
  } {
    const {hexName, tag} = this.resolveCip67Tag(assetNameHEX)
    const asciiName = this.resolveAsciiName(hexName)
    return {tag, asciiName}
  }
}
