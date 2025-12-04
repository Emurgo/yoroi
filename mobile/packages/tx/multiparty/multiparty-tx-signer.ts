/**
 * Multiparty transaction signing
 * Handles partial signing of transactions from multiple wallets
 * Supports sharing partially signed transactions between participants
 */
import {CardanoMobileWrapped} from '@yoroi/cardano-wallet'
import {getLogger} from '@yoroi/common'
import {Buffer} from 'buffer'
import * as CSL from '@emurgo/cross-csl-core'

import {getRequiredSignersFromTransaction} from '../transaction-builder/multiparty'
import type {UnsignedTransaction} from '../transaction-builder/types'
import {signTransaction} from '../utils/signing'
import {derivationConfig} from '@yoroi/blockchains'
import {cardanoConfig} from '@yoroi/blockchains'

/**
 * Parameters for signing a multiparty transaction
 */
type SignMultipartyTransactionParams = {
  readonly unsignedTx: UnsignedTransaction
  readonly walletId: string
  readonly wallet: {
    readonly signTx: (
      unsignedTx: UnsignedTransaction,
      rootKey: string,
    ) => Promise<CSL.Transaction>
    readonly meta: {
      readonly implementation: string
      readonly accountVisual: number
    }
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
    // Use the wallet's internal signTx method
    const signedCslTx = await wallet.signTx(unsignedTx, rootKeyHex)
    const signedCbor = Buffer.from(signedCslTx.toBytes()).toString('hex')

    // Determine the key hash that was used for signing by this wallet
    // This is a simplification; a more robust solution would involve
    // inspecting the witness set of the signed transaction and matching
    // against the wallet's known key hashes.
    // For now, we'll assume the primary payment key of the wallet.
    const implementationConfig =
      cardanoConfig.implementations[
        wallet.meta.implementation as keyof typeof cardanoConfig.implementations
      ]

    const masterKey = csl.Bip32PrivateKey.fromBytes(
      new Uint8Array(Buffer.from(rootKeyHex, 'hex')),
    )
    const accountPrivateKey = masterKey
      .derive(implementationConfig.derivations.base.harden.purpose)
      .derive(implementationConfig.derivations.base.harden.coinType)
      .derive(wallet.meta.accountVisual + derivationConfig.hardStart)

    const paymentKey = accountPrivateKey.derive(0).derive(0).toRawKey() // external chain, index 0
    const keyHash = Buffer.from(paymentKey.publicKey().hash().to_bytes()).toString('hex')

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
