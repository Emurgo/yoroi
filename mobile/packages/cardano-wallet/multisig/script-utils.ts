/**
 * Utilities for validating and working with multisig native scripts
 */
import {Bip32PublicKeyHex, KeyHash, ScriptCbor} from '@yoroi/types'

import type {WasmModuleProxy} from '@emurgo/cross-csl-core'
import {Buffer} from 'buffer'

import {paymentScriptKeyPath, stakingScriptKeyPath} from './script-derivation'

/**
 * Sign policy extracted from a native script
 */
export type SignPolicy = {
  readonly requiredCosigners: number
  readonly signers: ReadonlyArray<{
    readonly keyHash: KeyHash
  }>
}

/**
 * Check if a script is a valid shared wallet script
 * Valid scripts are: RequireAllOf, RequireAnyOf, or RequireNOf
 * containing only RequireSignature scripts
 */
export const isValidSharedWalletScript = (
  csl: WasmModuleProxy,
  scriptCbor: ScriptCbor,
): boolean => {
  try {
    const nativeScript = csl.NativeScript.fromHex(scriptCbor)

    if (!nativeScript) {
      return false
    }

    // Check if it's ScriptAll, ScriptAny, or ScriptNOfK
    const scriptAll = nativeScript.asScriptAll()
    const scriptAny = nativeScript.asScriptAny()
    const scriptNOfK = nativeScript.asScriptNOfK()

    if (!scriptAll && !scriptAny && !scriptNOfK) {
      return false
    }

    // Get the nested scripts
    const nestedScripts = scriptAll
      ? scriptAll.nativeScripts()
      : scriptAny
        ? scriptAny.nativeScripts()
        : scriptNOfK
          ? scriptNOfK.nativeScripts()
          : null

    if (!nestedScripts) {
      return false
    }

    // Check that all nested scripts are RequireSignature (ScriptPubkey)
    const len = nestedScripts.len()
    for (let i = 0; i < len; i++) {
      const nestedScript = nestedScripts.get(i)
      if (!nestedScript) {
        return false
      }

      const scriptPubkey = nestedScript.asScriptPubkey()
      if (!scriptPubkey) {
        return false
      }
    }

    return true
  } catch {
    return false
  }
}

/**
 * Extract sign policy from a native script
 * Returns undefined if script is not a valid shared wallet script
 */
export const getSignPolicy = (
  csl: WasmModuleProxy,
  scriptCbor: ScriptCbor,
): SignPolicy | undefined => {
  try {
    if (!isValidSharedWalletScript(csl, scriptCbor)) {
      return undefined
    }

    const nativeScript = csl.NativeScript.fromHex(scriptCbor)

    if (!nativeScript) {
      return undefined
    }

    const scriptAll = nativeScript.asScriptAll()
    const scriptAny = nativeScript.asScriptAny()
    const scriptNOfK = nativeScript.asScriptNOfK()

    const nestedScripts = scriptAll
      ? scriptAll.nativeScripts()
      : scriptAny
        ? scriptAny.nativeScripts()
        : scriptNOfK
          ? scriptNOfK.nativeScripts()
          : null

    if (!nestedScripts) {
      return undefined
    }

    // Extract signers (key hashes)
    const signers: Array<{keyHash: KeyHash}> = []
    const len = nestedScripts.len()

    for (let i = 0; i < len; i++) {
      const nestedScript = nestedScripts.get(i)
      if (!nestedScript) continue

      const scriptPubkey = nestedScript.asScriptPubkey()
      if (!scriptPubkey) continue

      const keyHash = scriptPubkey.addrKeyhash()
      if (!keyHash) continue

      signers.push({
        keyHash: keyHash.toHex() as KeyHash,
      })
    }

    // Determine required cosigners based on script kind
    let requiredCosigners: number

    if (scriptAll) {
      requiredCosigners = signers.length
    } else if (scriptNOfK) {
      requiredCosigners = scriptNOfK.n()
    } else {
      // RequireAnyOf
      requiredCosigners = 1
    }

    return {
      requiredCosigners,
      signers,
    }
  } catch {
    return undefined
  }
}

/**
 * Check if a co-signer has signed a transaction
 * Derives the key hash from the BIP32 public key and checks if it's in the vkey witnesses
 */
export const hasSigned = async (
  csl: WasmModuleProxy,
  sharedWalletKey: Bip32PublicKeyHex,
  type: 'payment' | 'staking',
  vkeys: ReturnType<typeof csl.Vkeywitnesses.prototype>,
): Promise<boolean> => {
  const derivationPath =
    type === 'payment' ? paymentScriptKeyPath : stakingScriptKeyPath

  const bip32PublicKey = csl.Bip32PublicKey.fromBytes(
    Buffer.from(sharedWalletKey, 'hex'),
  )

  if (!bip32PublicKey) {
    return false
  }

  // Derive to the specific role and index
  const derivedKey = bip32PublicKey
    .derive(derivationPath.role)
    .derive(derivationPath.index)

  // Get the raw Ed25519 public key
  const rawKey = derivedKey.toRawKey()

  // Get the key hash
  const keyHash = rawKey.hash()
  const keyHashHex = keyHash.toHex()

  // Check if this key hash is in the vkey witnesses by iterating
  if (!vkeys) {
    return false
  }

  for (let i = 0; i < vkeys.len(); i++) {
    const vkey = vkeys.get(i)
    if (!vkey) continue

    const publicKey = vkey.vkey().publicKey()
    const witnessKeyHash = publicKey.hash()

    if (witnessKeyHash.toHex() === keyHashHex) {
      return true
    }
  }

  return false
}

/**
 * Check if a script is a native script (not Plutus)
 */
export const isNativeScript = (
  csl: WasmModuleProxy,
  scriptCbor: ScriptCbor,
): boolean => {
  try {
    const nativeScript = csl.NativeScript.fromHex(scriptCbor)
    return nativeScript !== null
  } catch {
    return false
  }
}
