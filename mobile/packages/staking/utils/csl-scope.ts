import {WasmModuleProxy, freeContext} from '@emurgo/cross-csl-core'

import {CardanoTypes} from '../types'

/**
 * Utility function to manage CSL scope with proper cleanup
 * Prefers cslFactory over cardano for better memory management
 */
export const withCslScope = <T>(
  cardano: CardanoTypes.Wasm | undefined,
  cslFactory: ((scope: string) => WasmModuleProxy) | undefined,
  callback: (csl: WasmModuleProxy) => T,
): T => {
  if (!cardano && !cslFactory) {
    throw new Error('Either cardano or cslFactory is required')
  }

  // Priority: use cslFactory if provided, otherwise fall back to cardano
  if (cslFactory) {
    const cslScopeId = String(Math.random())
    const csl = cslFactory(cslScopeId)
    try {
      return callback(csl)
    } finally {
      freeContext(cslScopeId)
    }
  } else {
    return callback(cardano!)
  }
}
