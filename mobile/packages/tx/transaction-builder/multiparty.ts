// Functional multiparty transaction utilities
import type {
  BootstrapWitness,
  Vkeywitness,
  WasmModuleProxy,
} from '@emurgo/cross-csl-core'

import {normalizeToAddress} from '../utils/addresses'
import {UnsignedTransaction} from './types'

// Witness can be either Vkeywitness or BootstrapWitness
export type Witness = Vkeywitness | BootstrapWitness

export type WitnessInfo = {
  witness: Witness
  signerKeyHash: string // For identifying which signer this witness is from
}

export type MultipartyTransaction = {
  unsignedTx: UnsignedTransaction
  witnesses: WitnessInfo[]
  requiredSigners: string[] // Key hashes of required signers
}

export type WitnessState = {
  witnesses: WitnessInfo[]
  requiredSigners: string[]
}

/**
 * Create initial witness state
 */
export function createWitnessState(): WitnessState {
  return {
    witnesses: [],
    requiredSigners: [],
  }
}

/**
 * Add a witness (signature) to the transaction
 */
export function addWitness(
  state: WitnessState,
  witness: Witness,
  signerKeyHash: string,
): WitnessState {
  return {
    ...state,
    witnesses: [...state.witnesses, {witness, signerKeyHash}],
  }
}

/**
 * Check if transaction is fully signed
 */
export function isFullySigned(
  state: WitnessState,
  requiredSigners: string[],
): boolean {
  const signedKeyHashes = new Set(state.witnesses.map((w) => w.signerKeyHash))
  return requiredSigners.every((keyHash) => signedKeyHashes.has(keyHash))
}

/**
 * Get list of missing signers
 */
export function getMissingSigners(
  state: WitnessState,
  requiredSigners: string[],
): string[] {
  const signedKeyHashes = new Set(state.witnesses.map((w) => w.signerKeyHash))
  return requiredSigners.filter((keyHash) => !signedKeyHashes.has(keyHash))
}

/**
 * Get all witnesses
 */
export function getWitnesses(state: WitnessState): WitnessInfo[] {
  return [...state.witnesses]
}

/**
 * Clear all witnesses
 */
export function clearWitnesses(state: WitnessState): WitnessState {
  return {
    ...state,
    witnesses: [],
  }
}

/**
 * Set required signers
 */
export function setRequiredSigners(
  state: WitnessState,
  signers: string[],
): WitnessState {
  return {
    ...state,
    requiredSigners: [...signers],
  }
}

/**
 * Get required signers
 */
export function getRequiredSigners(state: WitnessState): string[] {
  return [...state.requiredSigners]
}

/**
 * Helper to extract required signers from a transaction
 * This analyzes the transaction inputs to determine which keys need to sign
 */
export async function getRequiredSignersFromTransaction(
  unsignedTx: UnsignedTransaction,
  csl: WasmModuleProxy,
): Promise<string[]> {
  const signers: string[] = []
  const seenHashes = new Set<string>()

  // Helper to add key hash if not already seen
  const addKeyHash = (keyHash: string | null | undefined) => {
    if (keyHash && !seenHashes.has(keyHash)) {
      signers.push(keyHash)
      seenHashes.add(keyHash)
    }
  }

  // Extract from inputs - get payment key hash from each input address
  for (const input of unsignedTx.inputs) {
    const address = normalizeToAddress(csl, input.utxo.receiver)
    if (!address) continue

    // Try different address types to extract payment key hash
    const baseAddr = csl.BaseAddress.fromAddress(address)
    if (baseAddr) {
      const paymentCred = baseAddr.paymentCred()
      const keyHash = paymentCred.toKeyhash()
      if (keyHash) {
        addKeyHash(keyHash.toHex())
      }
      continue
    }

    const enterpriseAddr = csl.EnterpriseAddress.fromAddress(address)
    if (enterpriseAddr) {
      const paymentCred = enterpriseAddr.paymentCred()
      const keyHash = paymentCred.toKeyhash()
      if (keyHash) {
        addKeyHash(keyHash.toHex())
      }
      continue
    }

    const pointerAddr = csl.PointerAddress.fromAddress(address)
    if (pointerAddr) {
      const paymentCred = pointerAddr.paymentCred()
      const keyHash = paymentCred.toKeyhash()
      if (keyHash) {
        addKeyHash(keyHash.toHex())
      }
      continue
    }
  }

  // Extract from certificates - get stake key hash from certificate
  for (const certWrapper of unsignedTx.certificates) {
    const cert = certWrapper.cert

    // Check for stake registration
    const stakeReg = cert.asStakeRegistration()
    if (stakeReg && stakeReg.hasValue()) {
      const stakeCred = stakeReg.stakeCredential()
      const keyHash = stakeCred.toKeyhash()
      if (keyHash) {
        addKeyHash(keyHash.toHex())
      }
      continue
    }

    // Check for stake deregistration
    const stakeDereg = cert.asStakeDeregistration()
    if (stakeDereg && stakeDereg.hasValue()) {
      const stakeCred = stakeDereg.stakeCredential()
      const keyHash = stakeCred.toKeyhash()
      if (keyHash) {
        addKeyHash(keyHash.toHex())
      }
      continue
    }

    // Check for stake delegation
    const stakeDeleg = cert.asStakeDelegation()
    if (stakeDeleg && stakeDeleg.hasValue()) {
      const stakeCred = stakeDeleg.stakeCredential()
      const keyHash = stakeCred.toKeyhash()
      if (keyHash) {
        addKeyHash(keyHash.toHex())
      }
      continue
    }

    // Check for vote delegation (CIP-1694)
    const voteDeleg = cert.asVoteDelegation()
    if (voteDeleg) {
      const stakeCred = voteDeleg.stakeCredential()
      const keyHash = stakeCred.toKeyhash()
      if (keyHash) {
        addKeyHash(keyHash.toHex())
      }
      continue
    }
  }

  // Extract from withdrawals - get stake key hash from reward address
  for (const withdrawal of unsignedTx.withdrawals) {
    const address = normalizeToAddress(csl, withdrawal.rewardAddress)
    if (!address) continue

    const rewardAddr = csl.RewardAddress.fromAddress(address)
    if (rewardAddr) {
      // For reward addresses, paymentCred contains the stake credential
      const stakeCred = rewardAddr.paymentCred()
      const keyHash = stakeCred.toKeyhash()
      if (keyHash) {
        addKeyHash(keyHash.toHex())
      }
    }
  }

  return signers
}
