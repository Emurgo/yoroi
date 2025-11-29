import type {MintingScript} from '@yoroi/tx'
import {calculatePolicyId} from '@yoroi/tx'
import {KeyHash, PolicyId, Wallet} from '@yoroi/types'

import type {WasmModuleProxy} from '@emurgo/cross-csl-core'
import {Buffer} from 'buffer'

import {getSpendingKey} from '~/wallets/cardano/addressInfo/addressInfo'
import {YoroiWallet} from '~/wallets/cardano/types'
import {CardanoMobileWrapped} from '~/wallets/cardano/wrappedCsl'

/**
 * Create a basic native script from wallet address
 * Uses single signature from wallet's payment key hash
 */
export async function createNativeScriptFromWallet(
  wallet: YoroiWallet,
  addressMode: Wallet.AddressMode = 'multiple',
): Promise<{
  script: MintingScript
  policyId: PolicyId
  keyHash: KeyHash
}> {
  return CardanoMobileWrapped.cslScope((csl: WasmModuleProxy) => {
    // Get wallet's change address (synchronous method)
    const address = wallet.getChangeAddress(addressMode)

    if (!address) {
      throw new Error('Wallet has no address')
    }

    // Extract payment key hash
    const keyHash = getSpendingKey(address)
    if (!keyHash) {
      throw new Error('Could not extract payment key hash from address')
    }

    // Create Ed25519KeyHash from hex
    const keyHashBytes = Buffer.from(keyHash, 'hex')
    const ed25519KeyHash = csl.Ed25519KeyHash.fromBytes(
      new Uint8Array(keyHashBytes),
    )

    // Create ScriptPubkey
    const scriptPubkey = csl.ScriptPubkey.new(ed25519KeyHash)

    // Create native script with single signature
    const nativeScript = csl.NativeScript.newScriptPubkey(scriptPubkey)

    if (!nativeScript) {
      throw new Error('Failed to create native script')
    }

    const scriptHex = nativeScript.toHex()
    const script: MintingScript = {
      type: 'native',
      script: scriptHex,
    }

    // Calculate policy ID
    const policyIdHex = calculatePolicyId(csl, script)

    return {
      script,
      policyId: policyIdHex as PolicyId,
      keyHash: keyHash as KeyHash,
    }
  })
}

/**
 * Check if a policy script can be recreated from wallet address
 * (Only works for basic single-signature scripts)
 */
export async function canRecreatePolicyFromWallet(
  wallet: YoroiWallet,
  policyId: PolicyId | string,
): Promise<boolean> {
  try {
    const {policyId: recreatedPolicyId} =
      await createNativeScriptFromWallet(wallet)
    const policyIdStr = typeof policyId === 'string' ? policyId : policyId
    const recreatedStr =
      typeof recreatedPolicyId === 'string'
        ? recreatedPolicyId
        : recreatedPolicyId
    return recreatedStr === policyIdStr
  } catch {
    return false
  }
}
