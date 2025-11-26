import type {WasmModuleProxy} from '@emurgo/cross-csl-core'

import type {MintingScript} from './types'

/**
 * Calculate policy ID from script
 */
export function calculatePolicyId(
  csl: WasmModuleProxy,
  script: MintingScript,
): string {
  if (script.type === 'native') {
    const nativeScript = csl.NativeScript.fromHex(script.script)
    if (!nativeScript) {
      throw new Error('Invalid native script')
    }
    // NativeScript has hash() method that returns ScriptHash
    return nativeScript.hash().toHex()
  } else {
    // Plutus script
    const plutusScript = csl.PlutusScript.fromHex(script.script)
    if (!plutusScript) {
      throw new Error('Invalid Plutus script')
    }
    // PlutusScript has hash() method that returns ScriptHash
    return plutusScript.hash().toHex()
  }
}

/**
 * Validate minting script format
 */
export function validateMintingScript(script: MintingScript): {
  valid: boolean
  error?: string
} {
  if (!script.type || (script.type !== 'native' && script.type !== 'plutus')) {
    return {valid: false, error: 'Invalid script type'}
  }

  if (!script.script || typeof script.script !== 'string') {
    return {valid: false, error: 'Script must be a hex string'}
  }

  if (!/^[0-9a-fA-F]+$/.test(script.script)) {
    return {valid: false, error: 'Script must be valid hex'}
  }

  return {valid: true}
}
