import {CardanoMobileWrapped} from '@yoroi/cardano-wallet/wrappedCsl'
import {calculatePolicyId} from '@yoroi/tx'
import type {MintingScript} from '@yoroi/tx'

import type {WasmModuleProxy} from '@emurgo/cross-csl-core'

import type {PolicyRecoveryData} from '../types'

/**
 * Create recovery data from script
 */
export function createRecoveryData(
  policyId: string,
  script: MintingScript,
  params: PolicyRecoveryData['params'],
): PolicyRecoveryData {
  return {
    policyId,
    scriptHex: script.script,
    scriptType: script.type,
    params,
    timestamp: Date.now(),
  }
}

/**
 * Parse recovery data from JSON string
 */
export function parseRecoveryData(
  jsonString: string,
): PolicyRecoveryData | null {
  try {
    const data = JSON.parse(jsonString) as PolicyRecoveryData
    // Validate structure
    if (
      !data.policyId ||
      !data.scriptHex ||
      !data.scriptType ||
      !data.params ||
      !data.timestamp
    ) {
      return null
    }
    return data
  } catch {
    return null
  }
}

/**
 * Convert recovery data to script
 */
export function recoveryDataToScript(
  recoveryData: PolicyRecoveryData,
): MintingScript {
  return {
    type: recoveryData.scriptType,
    script: recoveryData.scriptHex,
  }
}

/**
 * Validate recovery data matches policy ID
 */
export async function validateRecoveryData(
  recoveryData: PolicyRecoveryData,
  expectedPolicyId: string,
): Promise<boolean> {
  return CardanoMobileWrapped.cslScope((csl: WasmModuleProxy) => {
    const script: MintingScript = {
      type: recoveryData.scriptType,
      script: recoveryData.scriptHex,
    }
    const calculatedPolicyId = calculatePolicyId(csl, script)
    return calculatedPolicyId === expectedPolicyId
  })
}

/**
 * Generate recovery data URL (for sharing)
 */
export function generateRecoveryDataUrl(
  recoveryData: PolicyRecoveryData,
): string {
  const encoded = encodeURIComponent(JSON.stringify(recoveryData))
  return `yoroi://mint-burn/recover?data=${encoded}`
}

/**
 * Parse recovery data from URL
 */
export function parseRecoveryDataFromUrl(
  url: string,
): PolicyRecoveryData | null {
  try {
    const urlObj = new URL(url)
    const dataParam = urlObj.searchParams.get('data')
    if (!dataParam) {
      return null
    }
    return parseRecoveryData(decodeURIComponent(dataParam))
  } catch {
    return null
  }
}
