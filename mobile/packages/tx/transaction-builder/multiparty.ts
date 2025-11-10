import type {Witness, WasmModuleProxy} from '@emurgo/cross-csl-core'
import {UnsignedTransaction} from './types'

export type WitnessInfo = {
  witness: Witness
  signerKeyHash: string // For identifying which signer this witness is from
}

export type MultipartyTransaction = {
  unsignedTx: UnsignedTransaction
  witnesses: WitnessInfo[]
  requiredSigners: string[] // Key hashes of required signers
}

/**
 * Manages witnesses for multiparty transactions
 */
export class WitnessManager {
  private witnesses: WitnessInfo[] = []
  private requiredSigners: string[] = []

  /**
   * Add a witness (signature) to the transaction
   */
  addWitness(witness: Witness, signerKeyHash: string): void {
    this.witnesses.push({witness, signerKeyHash})
  }

  /**
   * Check if transaction is fully signed
   */
  isFullySigned(requiredSigners: string[]): boolean {
    const signedKeyHashes = new Set(this.witnesses.map((w) => w.signerKeyHash))
    return requiredSigners.every((keyHash) => signedKeyHashes.has(keyHash))
  }

  /**
   * Get list of missing signers
   */
  getMissingSigners(requiredSigners: string[]): string[] {
    const signedKeyHashes = new Set(this.witnesses.map((w) => w.signerKeyHash))
    return requiredSigners.filter((keyHash) => !signedKeyHashes.has(keyHash))
  }

  /**
   * Get all witnesses
   */
  getWitnesses(): WitnessInfo[] {
    return [...this.witnesses]
  }

  /**
   * Clear all witnesses
   */
  clear(): void {
    this.witnesses = []
  }

  /**
   * Set required signers
   */
  setRequiredSigners(signers: string[]): void {
    this.requiredSigners = [...signers]
  }

  /**
   * Get required signers
   */
  getRequiredSigners(): string[] {
    return [...this.requiredSigners]
  }
}

/**
 * Helper to extract required signers from a transaction
 * This analyzes the transaction inputs to determine which keys need to sign
 */
export async function getRequiredSigners(
  unsignedTx: UnsignedTransaction,
  wasm: WasmModuleProxy
): Promise<string[]> {
  // TODO: Implement extraction of required signers from transaction
  // This will analyze:
  // - Input addresses to get payment key hashes
  // - Certificate signers (for stake key registration/delegation)
  // - Withdrawal addresses to get reward key hashes
  // - Any other required signers

  const signers: string[] = []

  // Extract from inputs
  for (const input of unsignedTx.inputs) {
    // TODO: Extract key hash from input.utxo.receiver address
    // const keyHash = await extractKeyHashFromAddress(input.utxo.receiver, wasm)
    // signers.push(keyHash)
  }

  // Extract from certificates
  for (const cert of unsignedTx.certificates) {
    // TODO: Extract required signers from certificate
  }

  // Extract from withdrawals
  for (const withdrawal of unsignedTx.withdrawals) {
    // TODO: Extract key hash from withdrawal.rewardAddress
  }

  return signers
}

