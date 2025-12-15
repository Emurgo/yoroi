import type {TransactionOutput, WasmModuleProxy} from '@emurgo/cross-csl-core'

import type {Datum, DatumInfo} from './types'

/**
 * Parse datum from CSL TransactionOutput
 *
 * @param csl - CSL module proxy
 * @param output - CSL TransactionOutput
 * @returns DatumInfo if datum is present, null otherwise
 */
export function parseDatumFromOutput(
  csl: WasmModuleProxy,
  output: TransactionOutput,
): DatumInfo | null {
  const plutusData = output.plutusData()
  const dataHash = output.dataHash()

  if (plutusData) {
    // Inline datum
    return {
      type: 'inline',
      hash: csl.hashPlutusData(plutusData).toHex(),
      data: plutusData.toHex(),
    }
  }

  if (dataHash) {
    // Datum hash
    return {
      type: 'hash',
      hash: dataHash.toHex(),
    }
  }

  return null
}

/**
 * Create Datum from DatumInfo
 */
export function datumFromInfo(info: DatumInfo): Datum {
  if (info.type === 'inline') {
    return {
      type: 'inline',
      data: info.data!,
    }
  }

  if (info.type === 'embedded') {
    return {
      type: 'embedded',
      data: info.data!,
    }
  }

  return {
    type: 'hash',
    hash: info.hash,
  }
}

/**
 * Convert legacy Datum format to enhanced format
 */
export function convertLegacyDatum(datum: {
  hash?: string
  data?: string
}): Datum | null {
  if (datum.data) {
    return {
      type: 'inline',
      data: datum.data,
    }
  }

  if (datum.hash) {
    return {
      type: 'hash',
      hash: datum.hash,
    }
  }

  return null
}

/**
 * Get datum hash from Datum
 */
export function getDatumHash(csl: WasmModuleProxy, datum: Datum): string {
  if (datum.type === 'hash') {
    return datum.hash
  }

  if (datum.type === 'inline' || datum.type === 'embedded') {
    const plutusData = csl.PlutusData.fromHex(datum.data)
    return csl.hashPlutusData(plutusData).toHex()
  }

  throw new Error('Invalid datum type')
}
