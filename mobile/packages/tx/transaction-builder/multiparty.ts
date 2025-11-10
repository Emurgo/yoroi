// Functional multiparty transaction utilities
import type {
  BootstrapWitness,
  Vkeywitness,
  WasmModuleProxy,
} from '@emurgo/cross-csl-core'

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
  _wasm: WasmModuleProxy,
): Promise<string[]> {
  // TODO: Implement extraction of required signers from transaction
  // This will analyze:
  // - Input addresses to get payment key hashes
  // - Certificate signers (for stake key registration/delegation)
  // - Withdrawal addresses to get reward key hashes
  // - Any other required signers

  const signers: string[] = []

  // Extract from inputs
  for (const _input of unsignedTx.inputs) {
    // TODO: Extract key hash from input.utxo.receiver address
    // const keyHash = await extractKeyHashFromAddress(input.utxo.receiver, wasm)
    // signers.push(keyHash)
  }

  // Extract from certificates
  for (const _cert of unsignedTx.certificates) {
    // TODO: Extract required signers from certificate
  }

  // Extract from withdrawals
  for (const _withdrawal of unsignedTx.withdrawals) {
    // TODO: Extract key hash from withdrawal.rewardAddress
  }

  return signers
}
