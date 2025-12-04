/**
 * Build native scripts for multisig wallets
 * Supports RequireAllOf, RequireAnyOf, and RequireNOf script types
 */
import {Bip32PublicKeyHex, Wallet} from '@yoroi/types'

import type {WasmModuleProxy} from '@emurgo/cross-csl-core'
import {Buffer} from 'buffer'

import {CardanoMobileWrapped} from '../wrappedCsl'
import {paymentScriptKeyPath, stakingScriptKeyPath} from './script-derivation'

/**
 * Script kind for multisig wallets
 */
export type ScriptKind =
  | {kind: 'RequireAllOf'}
  | {kind: 'RequireAnyOf'}
  | {kind: 'RequireNOf'; required: number}

/**
 * Parameters for building a shared wallet script
 */
type BuildScriptParams = {
  expectedSigners: ReadonlyArray<Bip32PublicKeyHex>
  derivationPath: typeof paymentScriptKeyPath | typeof stakingScriptKeyPath
  kindInfo: ScriptKind
}

/**
 * Derive Ed25519 key hash from BIP32 public key
 */
const deriveEd25519KeyHashFromBip32PublicKey = (
  csl: WasmModuleProxy,
  bip32PublicKeyHex: Bip32PublicKeyHex,
  derivationPath: {role: number; index: number},
): string => {
  const bip32PublicKey = csl.Bip32PublicKey.fromBytes(
    Buffer.from(bip32PublicKeyHex, 'hex'),
  )

  if (!bip32PublicKey) {
    throw new Error('Invalid BIP32 public key')
  }

  // Derive to the specific role and index
  const derivedKey = bip32PublicKey
    .derive(derivationPath.role)
    .derive(derivationPath.index)

  // Get the raw Ed25519 public key
  const rawKey = derivedKey.toRawKey()

  // Get the key hash
  const keyHash = rawKey.hash()

  return keyHash.toHex()
}

/**
 * Build a native script for multisig wallet
 * Returns the script as CBOR hex string
 */
export const buildNativeScript = async ({
  expectedSigners,
  derivationPath,
  kindInfo,
}: BuildScriptParams): Promise<string> => {
  if (expectedSigners.length === 0) {
    throw new Error('Cannot build script with empty signers array')
  }

  return CardanoMobileWrapped.cslScope((csl: WasmModuleProxy) => {
    // Sort signers for deterministic script building
    const signers = [...expectedSigners].sort((key1, key2) =>
      key1.localeCompare(key2),
    )

    // Create individual signature scripts for each signer
    const signatureScripts = csl.NativeScripts.new()

    for (const signer of signers) {
      const keyHashHex = deriveEd25519KeyHashFromBip32PublicKey(
        csl,
        signer,
        derivationPath,
      )

      const keyHashBytes = Buffer.from(keyHashHex, 'hex')
      const ed25519KeyHash = csl.Ed25519KeyHash.fromBytes(
        new Uint8Array(keyHashBytes),
      )

      if (!ed25519KeyHash) {
        throw new Error(`Failed to create Ed25519KeyHash for signer: ${signer}`)
      }

      const scriptPubkey = csl.ScriptPubkey.new(ed25519KeyHash)

      if (!scriptPubkey) {
        throw new Error(`Failed to create ScriptPubkey for signer: ${signer}`)
      }

      const nativeScript = csl.NativeScript.newScriptPubkey(scriptPubkey)

      if (!nativeScript) {
        throw new Error(`Failed to create NativeScript for signer: ${signer}`)
      }

      signatureScripts.add(nativeScript)
    }

    // Create the composite script based on kind
    let compositeScript:
      | ReturnType<typeof csl.NativeScript.newScriptAll>
      | ReturnType<typeof csl.NativeScript.newScriptAny>
      | ReturnType<typeof csl.NativeScript.newScriptNOfK>
      | null = null

    switch (kindInfo.kind) {
      case 'RequireAllOf': {
        compositeScript = csl.NativeScript.newScriptAll(
          csl.ScriptAll.new(signatureScripts),
        )
        break
      }
      case 'RequireAnyOf': {
        compositeScript = csl.NativeScript.newScriptAny(
          csl.ScriptAny.new(signatureScripts),
        )
        break
      }
      case 'RequireNOf': {
        const scriptNOfK = csl.ScriptNOfK.new(
          kindInfo.required,
          signatureScripts,
        )
        if (!scriptNOfK) {
          throw new Error(
            `Failed to create ScriptNOfK with required=${kindInfo.required}`,
          )
        }
        compositeScript = csl.NativeScript.newScriptNOfK(scriptNOfK)
        break
      }
      default: {
        const _exhaustive: never = kindInfo
        throw new Error(`Unknown script kind: ${_exhaustive}`)
      }
    }

    if (!compositeScript) {
      throw new Error('Failed to create composite native script')
    }

    return compositeScript.toHex()
  })
}

/**
 * Build payment script for multisig wallet
 */
export const buildPaymentScript = async (
  expectedSigners: ReadonlyArray<Bip32PublicKeyHex>,
  quorumRules: Wallet.QuorumRules,
): Promise<string> => {
  const kindInfo: ScriptKind =
    quorumRules.kind === 'RequireAllOf'
      ? {kind: 'RequireAllOf'}
      : quorumRules.kind === 'RequireAnyOf'
        ? {kind: 'RequireAnyOf'}
        : {kind: 'RequireNOf', required: quorumRules.required}

  return buildNativeScript({
    expectedSigners,
    derivationPath: paymentScriptKeyPath,
    kindInfo,
  })
}

/**
 * Build staking script for multisig wallet
 */
export const buildStakingScript = async (
  expectedSigners: ReadonlyArray<Bip32PublicKeyHex>,
  quorumRules: Wallet.QuorumRules,
): Promise<string> => {
  const kindInfo: ScriptKind =
    quorumRules.kind === 'RequireAllOf'
      ? {kind: 'RequireAllOf'}
      : quorumRules.kind === 'RequireAnyOf'
        ? {kind: 'RequireAnyOf'}
        : {kind: 'RequireNOf', required: quorumRules.required}

  return buildNativeScript({
    expectedSigners,
    derivationPath: stakingScriptKeyPath,
    kindInfo,
  })
}
