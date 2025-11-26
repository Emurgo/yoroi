import type {PlutusData, WasmModuleProxy} from '@emurgo/cross-csl-core'
import {Buffer} from 'buffer'

import type {Datum} from './types'

/**
 * JSON-serializable value types
 */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | {[key: string]: JsonValue}

/**
 * Decoded datum representation (simplified JSON-like structure)
 */
export type DecodedDatum =
  | {type: 'integer'; value: string}
  | {type: 'bytes'; value: string}
  | {type: 'string'; value: string}
  | {type: 'list'; items: DecodedDatum[]}
  | {type: 'map'; entries: Array<{key: DecodedDatum; value: DecodedDatum}>}
  | {type: 'constructor'; index: number; fields: DecodedDatum[]}
  | {type: 'unknown'; hex: string}

/**
 * Try to decode PlutusData to a human-readable format
 *
 * @param csl - CSL module proxy
 * @param datumHex - PlutusData hex string
 * @returns Decoded datum or null if decoding fails
 */
export function decodeDatum(
  csl: WasmModuleProxy,
  datumHex: string,
): DecodedDatum | null {
  try {
    const plutusData = csl.PlutusData.fromHex(datumHex)
    return decodePlutusData(csl, plutusData)
  } catch {
    return null
  }
}

/**
 * Helper to safely access toHex method on PlutusMapValues
 * PlutusMapValues is compatible with PlutusData but TypeScript types don't reflect this
 */
function getHexFromPlutusMapValue(valueData: unknown): string {
  // PlutusMapValues has toHex method but TypeScript doesn't recognize it
  const value = valueData as {toHex?: () => string}
  if (value.toHex && typeof value.toHex === 'function') {
    return value.toHex()
  }
  throw new Error('PlutusMapValues must have toHex() method')
}

/**
 * Decode CSL PlutusData to DecodedDatum
 */
function decodePlutusData(
  csl: WasmModuleProxy,
  plutusData: PlutusData,
): DecodedDatum {
  const kind = plutusData.kind()

  if (kind === 0) {
    // Constr
    const constr = plutusData.asConstrPlutusData()
    if (constr) {
      const indexBigNum = constr.alternative()
      const indexNum = parseInt(indexBigNum.toStr(), 10)
      const fields: DecodedDatum[] = []
      const plutusList = constr.data()
      for (let i = 0; i < plutusList.len(); i++) {
        const field = plutusList.get(i)
        if (field) {
          fields.push(decodePlutusData(csl, field))
        }
      }
      return {type: 'constructor', index: indexNum, fields}
    }
  } else if (kind === 1) {
    // Map
    const map = plutusData.asMap()
    if (map) {
      const entries: Array<{key: DecodedDatum; value: DecodedDatum}> = []
      const keys = map.keys()
      for (let i = 0; i < keys.len(); i++) {
        const key = keys.get(i)
        if (!key) continue
        const valueData = map.get(key)
        if (!valueData) continue
        // Decode key (which is PlutusData)
        const decodedKey = decodePlutusData(csl, key)
        // For value: PlutusMapValues is compatible with PlutusData but TypeScript doesn't recognize it
        // We use a helper function that safely accesses the toHex method
        try {
          const valueHex = getHexFromPlutusMapValue(valueData)
          const valuePlutusData = csl.PlutusData.fromHex(valueHex)
          const decodedValue = decodePlutusData(csl, valuePlutusData)
          entries.push({
            key: decodedKey,
            value: decodedValue,
          })
        } catch {
          // Fallback: mark as unknown if conversion fails
          entries.push({
            key: decodedKey,
            value: {
              type: 'unknown',
              hex: '',
            },
          })
        }
      }
      return {type: 'map', entries}
    }
  } else if (kind === 2) {
    // List
    const list = plutusData.asList()
    if (list) {
      const items: DecodedDatum[] = []
      for (let i = 0; i < list.len(); i++) {
        const item = list.get(i)
        if (item) {
          items.push(decodePlutusData(csl, item))
        }
      }
      return {type: 'list', items}
    }
  } else if (kind === 3) {
    // Integer
    const integer = plutusData.asInteger()
    if (integer) {
      return {type: 'integer', value: integer.toStr()}
    }
  } else if (kind === 4) {
    // Bytes
    const bytes = plutusData.asBytes()
    if (bytes) {
      return {type: 'bytes', value: Buffer.from(bytes).toString('hex')}
    }
  }

  // Fallback for unknown data
  return {type: 'unknown', hex: plutusData.toHex()}
}

/**
 * Format decoded datum to display string
 */
export function formatDecodedDatum(datum: DecodedDatum, indent = 0): string {
  const spaces = '  '.repeat(indent)

  switch (datum.type) {
    case 'integer':
      return `${spaces}${datum.value}`
    case 'bytes':
      return `${spaces}0x${datum.value}`
    case 'string':
      return `${spaces}"${datum.value}"`
    case 'list':
      if (datum.items.length === 0) {
        return `${spaces}[]`
      }
      return `${spaces}[\n${datum.items
        .map((item) => formatDecodedDatum(item, indent + 1))
        .join(',\n')}\n${spaces}]`
    case 'map':
      if (datum.entries.length === 0) {
        return `${spaces}{}`
      }
      return `${spaces}{\n${datum.entries
        .map(
          (entry) =>
            `${formatDecodedDatum(entry.key, indent + 1)}: ${formatDecodedDatum(
              entry.value,
              indent + 1,
            )}`,
        )
        .join(',\n')}\n${spaces}}`
    case 'constructor':
      return `${spaces}Constructor(${datum.index})[\n${datum.fields
        .map((field) => formatDecodedDatum(field, indent + 1))
        .join(',\n')}\n${spaces}]`
    case 'unknown':
      return `${spaces}<unknown: ${datum.hex}>`
  }
}

/**
 * Try to decode datum to JSON-like object
 */
export function decodeDatumToJson(
  csl: WasmModuleProxy,
  datum: Datum,
): JsonValue | null {
  if (datum.type === 'hash') {
    // Cannot decode hash-only datum
    return null
  }

  const decoded = decodeDatum(csl, datum.data)
  if (!decoded) {
    return null
  }

  return decodedDatumToJson(decoded)
}

/**
 * Convert DecodedDatum to JSON-like object
 */
function decodedDatumToJson(datum: DecodedDatum): JsonValue {
  switch (datum.type) {
    case 'integer':
      // Convert BigInt to string for JSON compatibility
      return BigInt(datum.value).toString()
    case 'bytes':
      return `0x${datum.value}`
    case 'string':
      return datum.value
    case 'list':
      return datum.items.map(decodedDatumToJson)
    case 'map':
      return Object.fromEntries(
        datum.entries.map((entry) => [
          decodedDatumToJson(entry.key),
          decodedDatumToJson(entry.value),
        ]),
      )
    case 'constructor':
      return {
        constructor: datum.index,
        fields: datum.fields.map(decodedDatumToJson),
      }
    case 'unknown':
      return {unknown: datum.hex}
  }
}
