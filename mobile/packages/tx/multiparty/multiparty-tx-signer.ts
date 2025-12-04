/**
 * Multiparty transaction signing
 * Handles partial signing of transactions from multiple wallets
 * Supports sharing partially signed transactions between participants
 */
import {CardanoMobileWrapped} from '@yoroi/cardano-wallet'
import {getLogger} from '@yoroi/common'
import {Address, Wallet} from '@yoroi/types'

import * as CSL from '@emurgo/cross-csl-core'
import {Buffer} from 'buffer'

import {getRequiredSignersFromTransaction} from '../transaction-builder/multiparty'
import type {UnsignedTransaction} from '../transaction-builder/types'

/**
 * Parameters for signing a multiparty transaction
 */
type SignMultipartyTransactionParams = {
  readonly unsignedTx: UnsignedTransaction
  readonly walletId: string
  readonly wallet: {
    readonly signRawTx: (
      cbor: string,
      keys: ReadonlyArray<CSL.PrivateKey>,
    ) => Promise<Uint8Array | null>
    readonly getSigningKey: (address: Address) => Promise<CSL.PrivateKey | null>
  }
  readonly rootKeyHex: string
}

/**
 * Result of signing a multiparty transaction
 */
type MultipartySignResult = {
  readonly signedTxCbor: string
  readonly signedBy: string // walletId
  readonly keyHash: string
}

/**
 * Sign a multiparty transaction with a specific wallet
 * Adds signature to the transaction witness set
 */
export const signMultipartyTransaction = async ({
  unsignedTx,
  walletId,
  wallet,
  rootKeyHex,
}: SignMultipartyTransactionParams): Promise<MultipartySignResult> => {
  const logger = getLogger()

  if (!unsignedTx.cbor) {
    throw new Error('UnsignedTransaction must have CBOR to sign')
  }

  return CardanoMobileWrapped.cslScope(async (csl) => {
    // Parse the unsigned transaction
    const tx = csl.Transaction.fromHex(unsignedTx.cbor)
    if (!tx) {
      throw new Error('Failed to parse transaction CBOR')
    }

    // Get required signers from transaction
    const requiredSigners = await getRequiredSignersFromTransaction(
      unsignedTx,
      csl,
    )

    // Extract key hashes that need to be signed by this wallet
    const txBody = tx.body()
    const inputs = txBody.inputs()
    if (!inputs) {
      throw new Error('Transaction has no inputs')
    }

    // Get addresses from inputs to determine which keys to sign
    const addressesToSign: string[] = []
    const inputLen = inputs.len()

    for (let i = 0; i < inputLen; i++) {
      const input = inputs.get(i)
      if (!input) continue

      // For multiparty, we need to determine which inputs belong to this wallet
      // This is simplified - in practice, we'd track which inputs come from which wallet
      // For now, we'll sign all inputs that match this wallet's addresses
      // The actual implementation would need to track input-to-wallet mapping
    }

    // Sign the transaction
    // Get signing keys for this wallet
    const signingKeys: CSL.PrivateKey[] = []

    // Derive keys from root key for addresses that need signing
    // This is a simplified version - actual implementation would derive based on address paths
    const rootKey = csl.Bip32PrivateKey.fromBytes(
      Buffer.from(rootKeyHex, 'hex'),
    )

    // For now, we'll use the wallet's signRawTx method which handles key derivation internally
    const signedBytes = await wallet.signRawTx(unsignedTx.cbor, signingKeys)

    if (!signedBytes) {
      throw new Error('Failed to sign transaction')
    }

    const signedCbor = Buffer.from(signedBytes).toString('hex')

    // Extract key hash that was signed (simplified)
    const keyHash = requiredSigners[0] || ''

    logger.debug('signMultipartyTransaction: Transaction signed', {
      walletId,
      keyHash,
    })

    return {
      signedTxCbor: signedCbor,
      signedBy: walletId,
      keyHash,
    }
  })
}

/**
 * Check if a transaction is signed by a specific wallet
 */
export const isSignedByWallet = async (
  cbor: string,
  walletId: string,
  keyHash: string,
): Promise<boolean> => {
  return CardanoMobileWrapped.cslScope(async (csl) => {
    const tx = csl.Transaction.fromHex(cbor)
    if (!tx) {
      return false
    }

    const witnessSet = tx.witnessSet()
    if (!witnessSet) {
      return false
    }

    const vkeys = witnessSet.vkeys()
    if (!vkeys) {
      return false
    }

    const keyHashBytes = Buffer.from(keyHash, 'hex')
    const ed25519KeyHash = csl.Ed25519KeyHash.fromBytes(keyHashBytes)

    if (!ed25519KeyHash) {
      return false
    }

    // Check if this key hash has a signature
    return vkeys.has(ed25519KeyHash)
  })
}

/**
 * Get all signed wallets from a transaction
 */
export const getSignedWallets = async (
  cbor: string,
  requiredSigners: ReadonlyArray<{
    readonly walletId: string
    readonly keyHash: string
    readonly walletName: string
  }>,
): Promise<ReadonlyArray<string>> => {
  const signedWalletIds: string[] = []

  for (const signer of requiredSigners) {
    const isSigned = await isSignedByWallet(
      cbor,
      signer.walletId,
      signer.keyHash,
    )
    if (isSigned) {
      signedWalletIds.push(signer.walletId)
    }
  }

  return signedWalletIds
}

/**
 * Check if all required signers have signed
 */
export const isFullySigned = async (
  cbor: string,
  requiredSigners: ReadonlyArray<{
    readonly walletId: string
    readonly keyHash: string
    readonly walletName: string
  }>,
): Promise<boolean> => {
  const signedWallets = await getSignedWallets(cbor, requiredSigners)
  return signedWallets.length === requiredSigners.length
}
