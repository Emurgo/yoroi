import {Balance} from '@yoroi/types'

import type {
  NativeScript,
  PlutusScript,
  WasmModuleProxy,
} from '@emurgo/cross-csl-core'

import {calculatePolicyId} from '../minting/policies'
import {TransactionBuilderState} from '../transaction-builder/builder'
import {ModernUtxo} from '../utxo/models'
import type {ReferenceScript} from './types'

/**
 * Calculate script hash from NativeScript
 */
function hashNativeScript(csl: WasmModuleProxy, script: NativeScript): string {
  return calculatePolicyId(csl, {type: 'native', script: script.toHex()})
}

/**
 * Calculate script hash from PlutusScript
 */
function hashPlutusScript(csl: WasmModuleProxy, script: PlutusScript): string {
  return calculatePolicyId(csl, {type: 'plutus', script: script.toHex()})
}

/**
 * Detect reference script in UTXO
 */
export function detectReferenceScript(
  csl: WasmModuleProxy,
  utxo: ModernUtxo,
): ReferenceScript | null {
  try {
    // Convert UTXO to CSL TransactionUnspentOutput
    const cslUtxo = utxo.toTransactionUnspentOutput(csl)
    const output = cslUtxo.output()
    const scriptRef = output.scriptRef()

    if (!scriptRef) {
      return null
    }

    // Determine script type and hash
    let scriptHash: string
    let scriptType: 'native' | 'plutus'

    // Check script type and extract hash
    if (scriptRef.isNativeScript()) {
      // Extract native script bytes and hash
      const scriptBytes = scriptRef.toBytes()
      const nativeScript = csl.NativeScript.fromBytes(scriptBytes)
      if (nativeScript) {
        scriptHash = hashNativeScript(csl, nativeScript)
        scriptType = 'native'
      } else {
        return null
      }
    } else if (scriptRef.isPlutusScript()) {
      // Extract Plutus script bytes and hash
      const scriptBytes = scriptRef.toBytes()
      const plutusScript = csl.PlutusScript.fromBytes(scriptBytes)
      if (plutusScript) {
        scriptHash = hashPlutusScript(csl, plutusScript)
        scriptType = 'plutus'
      } else {
        return null
      }
    } else {
      return null
    }

    const scriptSize = scriptRef.toBytes().length

    return {
      txHash: utxo.txHash,
      txIndex: utxo.txIndex,
      scriptHash,
      scriptType,
      scriptSize,
    }
  } catch {
    return null
  }
}

/**
 * Find reference scripts in UTXOs
 */
export function findReferenceScripts(
  csl: WasmModuleProxy,
  utxos: ModernUtxo[],
): ReferenceScript[] {
  const scripts: ReferenceScript[] = []

  for (const utxo of utxos) {
    const script = detectReferenceScript(csl, utxo)
    if (script) {
      scripts.push(script)
    }
  }

  return scripts
}

/**
 * Find reference script by hash
 */
export function findReferenceScriptByHash(
  csl: WasmModuleProxy,
  utxos: ModernUtxo[],
  scriptHash: string,
): ReferenceScript | null {
  const scripts = findReferenceScripts(csl, utxos)
  return scripts.find((s) => s.scriptHash === scriptHash) || null
}

/**
 * Calculate reference script fee (local estimation)
 *
 * Note: This is a rough estimation. Accurate fee calculation requires
 * Phase 2 backend evaluation.
 */
export function estimateReferenceScriptFee(
  protocolParams: {
    minFeeReferenceScript?: {
      coinsPerByte: {numerator: string; denominator: string}
      tierStepBytes: string
      multiplier: string
    }
  },
  scriptSize: number,
): string {
  // Rough estimation based on protocol parameters
  // Actual calculation would be more complex

  if (!protocolParams.minFeeReferenceScript) {
    // Fallback: estimate based on script size
    return (scriptSize * 0.000044).toString() // Rough ADA per byte
  }

  const {coinsPerByte, tierStepBytes, multiplier} =
    protocolParams.minFeeReferenceScript

  // Simplified calculation
  const bytes = BigInt(scriptSize)
  const numerator = BigInt(coinsPerByte.numerator)
  const denominator = BigInt(coinsPerByte.denominator)
  const tierStep = BigInt(tierStepBytes)
  const mult = BigInt(multiplier)

  // Calculate: (bytes * numerator * multiplier) / (denominator * tierStep)
  const fee = (bytes * numerator * mult) / (denominator * tierStep)

  return fee.toString()
}

/**
 * Add reference script to transaction builder
 *
 * Note: Reference scripts are added as reference inputs, not regular inputs
 */
export function addReferenceScriptUsage(
  state: TransactionBuilderState,
  referenceScript: ReferenceScript,
): TransactionBuilderState {
  // Create UTXO reference for the reference script
  const refUtxo: ModernUtxo = {
    receiver: '', // Not needed for reference inputs
    txHash: referenceScript.txHash,
    txIndex: referenceScript.txIndex,
    balance: {} as Balance.Amounts,
    toTransactionUnspentOutputHex: () => {
      throw new Error('Cannot serialize reference script UTXO')
    },
    toTransactionUnspentOutput: () => {
      throw new Error('Cannot convert reference script UTXO')
    },
  }

  // Add as reference input
  return {
    ...state,
    referenceInputs: [...state.referenceInputs, {utxo: refUtxo}],
  }
}
