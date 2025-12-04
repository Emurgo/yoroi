/**
 * Multiparty transaction JSON format
 * Extends multisig transaction JSON to support multiple different wallets
 * Reuses the same format but with different semantics
 */
import {Bip32PublicKeyHex, TransactionCborHex} from '@yoroi/types'

import {
  type ChainId,
  type MultisigTransactionJSON,
  constructMultisigTransactionJSON,
  parseMultisigTransactionJSON,
} from '../multisig/transaction-json'

/**
 * Multiparty transaction JSON structure
 * Reuses multisig format but tracks multiple different wallets instead of co-signers
 */
export type MultipartyTransactionJSON = MultisigTransactionJSON

/**
 * Required signer information for multiparty transactions
 */
export type MultipartySigner = {
  readonly walletId: string
  readonly walletName: string
  readonly keyHash: string
  readonly signed: boolean
}

/**
 * Parameters for constructing multiparty transaction JSON
 */
type ConstructMultipartyTransactionParams = {
  readonly cborHex: TransactionCborHex
  readonly chainId: ChainId
  readonly createdBy: Bip32PublicKeyHex
  readonly requiredSigners: ReadonlyArray<MultipartySigner>
  readonly note?: string
}

/**
 * Construct multiparty transaction JSON
 * Reuses multisig format but adapts signers to multiparty context
 */
export const constructMultipartyTransactionJSON = ({
  cborHex,
  chainId,
  createdBy,
  requiredSigners,
  note,
}: ConstructMultipartyTransactionParams): MultipartyTransactionJSON => {
  // Convert multiparty signers to transaction signers format
  const signers = requiredSigners.map((signer) => ({
    walletId: signer.walletId,
    publicKey: signer.keyHash as Bip32PublicKeyHex, // Using keyHash as publicKey identifier
    signed: signer.signed,
  }))

  return constructMultisigTransactionJSON({
    cborHex,
    chainId,
    createdBy,
    note,
    signers,
  })
}

/**
 * Parse multiparty transaction JSON
 */
export const parseMultipartyTransactionJSON = (
  jsonString: string,
): MultipartyTransactionJSON => {
  return parseMultisigTransactionJSON(jsonString)
}

/**
 * Update transaction JSON with a new signature from a wallet
 */
export const addWalletSignatureToTransactionJSON = (
  txJson: MultipartyTransactionJSON,
  walletId: string,
  keyHash: string,
  _walletName: string,
): MultipartyTransactionJSON => {
  const existingSigners = txJson.metadata.signers ?? []

  // Check if signer already exists
  const signerIndex = existingSigners.findIndex(
    (signer) => signer.walletId === walletId || signer.publicKey === keyHash,
  )

  const updatedSigners =
    signerIndex >= 0
      ? existingSigners.map((signer, index) =>
          index === signerIndex
            ? {
                ...signer,
                signed: true,
                walletId,
                publicKey: keyHash as Bip32PublicKeyHex,
              }
            : signer,
        )
      : [
          ...existingSigners,
          {
            walletId,
            publicKey: keyHash as Bip32PublicKeyHex,
            signed: true,
          },
        ]

  return {
    ...txJson,
    metadata: {
      ...txJson.metadata,
      signers: updatedSigners,
    },
  }
}

/**
 * Check if transaction is signed by a specific wallet
 */
export const isSignedByWallet = (
  txJson: MultipartyTransactionJSON,
  walletId: string,
  keyHash: string,
): boolean => {
  if (!txJson.metadata.signers) {
    return false
  }

  return txJson.metadata.signers.some(
    (signer) =>
      (signer.walletId === walletId || signer.publicKey === keyHash) &&
      signer.signed === true,
  )
}

/**
 * Get all signed wallets from transaction JSON
 */
export const getSignedWallets = (
  txJson: MultipartyTransactionJSON,
): ReadonlyArray<string> => {
  if (!txJson.metadata.signers) {
    return []
  }

  return txJson.metadata.signers
    .filter((signer) => signer.signed)
    .map((signer) => signer.walletId || '')
    .filter(Boolean)
}

/**
 * Check if all required signers have signed
 */
export const isFullySigned = (
  txJson: MultipartyTransactionJSON,
  requiredSigners: ReadonlyArray<MultipartySigner>,
): boolean => {
  const signedWallets = getSignedWallets(txJson)
  return signedWallets.length === requiredSigners.length
}
