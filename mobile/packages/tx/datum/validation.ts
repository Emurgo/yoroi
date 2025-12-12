import type {WasmModuleProxy} from '@emurgo/cross-csl-core'

import {getDatumHash} from './parsing'
import type {Datum} from './types'

/**
 * Validate datum format
 */
export function validateDatum(datum: Datum): {valid: boolean; error?: string} {
  if (datum.type === 'hash') {
    if (!datum.hash || typeof datum.hash !== 'string') {
      return {valid: false, error: 'Invalid datum hash'}
    }
    if (!/^[0-9a-fA-F]{64}$/.test(datum.hash)) {
      return {valid: false, error: 'Datum hash must be 64 hex characters'}
    }
    return {valid: true}
  }

  if (datum.type === 'inline' || datum.type === 'embedded') {
    if (!datum.data || typeof datum.data !== 'string') {
      return {valid: false, error: 'Invalid datum data'}
    }
    if (!/^[0-9a-fA-F]+$/.test(datum.data)) {
      return {valid: false, error: 'Datum data must be hex string'}
    }
    return {valid: true}
  }

  return {valid: false, error: 'Unknown datum type'}
}

/**
 * Validate datum can be parsed as PlutusData
 */
export function validatePlutusData(
  csl: WasmModuleProxy,
  datum: Datum,
): {valid: boolean; error?: string} {
  const validation = validateDatum(datum)
  if (!validation.valid) {
    return validation
  }

  if (datum.type === 'hash') {
    // Hash-only datums are valid (data not available)
    return {valid: true}
  }

  try {
    const plutusData = csl.PlutusData.fromHex(datum.data)
    if (!plutusData) {
      return {valid: false, error: 'Failed to parse PlutusData'}
    }
    return {valid: true}
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid PlutusData',
    }
  }
}

/**
 * Check if datum hash matches datum data
 */
export function validateDatumHash(
  csl: WasmModuleProxy,
  datum: Datum,
): {valid: boolean; error?: string} {
  if (datum.type === 'hash') {
    // Hash-only datum, cannot validate
    return {valid: true}
  }

  try {
    getDatumHash(csl, datum)
    // Hash calculation succeeded
    return {valid: true}
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Failed to validate hash',
    }
  }
}
