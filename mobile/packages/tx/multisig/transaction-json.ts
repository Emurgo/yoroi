/**
 * Transaction JSON format for multisig wallet co-signing
 * Supports export/import of transaction JSON files for offline signing
 */
import {Bip32PublicKeyHex, TransactionCborHex} from '@yoroi/types'

/**
 * Chain ID format: cip34:networkId-networkMagic
 */
export type ChainId = `cip34:${number}-${number}`

/**
 * Signer information in transaction metadata
 */
export type TransactionSigner = {
  readonly walletId?: string
  readonly publicKey: Bip32PublicKeyHex
  readonly signed: boolean
}

/**
 * Multisig transaction JSON structure
 * Used for exporting/importing transactions for co-signing
 */
export type MultisigTransactionJSON = {
  readonly version: string
  readonly metadata: {
    readonly createdAt: string // ISO 8601 date string
    readonly createdBy: Bip32PublicKeyHex
    readonly chainId: ChainId
    readonly note?: string
    readonly signers?: ReadonlyArray<TransactionSigner>
  }
  readonly transaction: {
    readonly cborHex: TransactionCborHex
  }
}

/**
 * Parameters for constructing multisig transaction JSON
 */
type ConstructMultisigTransactionParams = {
  readonly cborHex: TransactionCborHex
  readonly chainId: ChainId
  readonly createdBy: Bip32PublicKeyHex
  readonly note?: string
  readonly signers?: ReadonlyArray<TransactionSigner>
}

/**
 * Construct multisig transaction JSON from transaction CBOR
 */
export const constructMultisigTransactionJSON = ({
  cborHex,
  chainId,
  createdBy,
  note,
  signers,
}: ConstructMultisigTransactionParams): MultisigTransactionJSON => {
  return {
    version: '1.0.0',
    metadata: {
      createdAt: new Date().toISOString(),
      createdBy,
      chainId,
      ...(note !== undefined && {note}),
      ...(signers !== undefined && {signers}),
    },
    transaction: {
      cborHex,
    },
  }
}

/**
 * Parse multisig transaction JSON from string
 */
export const parseMultisigTransactionJSON = (
  jsonString: string,
): MultisigTransactionJSON => {
  try {
    const parsed = JSON.parse(jsonString) as unknown

    // Validate structure
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      !('version' in parsed) ||
      !('metadata' in parsed) ||
      !('transaction' in parsed)
    ) {
      throw new Error('Invalid transaction JSON structure')
    }

    const txJson = parsed as MultisigTransactionJSON

    // Validate required fields
    if (
      typeof txJson.version !== 'string' ||
      typeof txJson.metadata !== 'object' ||
      typeof txJson.transaction !== 'object'
    ) {
      throw new Error('Invalid transaction JSON field types')
    }

    if (
      !txJson.metadata.createdAt ||
      !txJson.metadata.createdBy ||
      !txJson.metadata.chainId ||
      !txJson.transaction.cborHex
    ) {
      throw new Error('Missing required transaction JSON fields')
    }

    return txJson
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to parse transaction JSON: ${error.message}`)
    }
    throw new Error('Failed to parse transaction JSON: Unknown error')
  }
}

/**
 * Serialize multisig transaction JSON to string
 */
export const serializeMultisigTransactionJSON = (
  txJson: MultisigTransactionJSON,
): string => {
  return JSON.stringify(txJson, null, 2)
}

/**
 * Check if transaction JSON is already signed by a specific co-signer
 */
export const isSignedByCoSigner = (
  txJson: MultisigTransactionJSON,
  sharedWalletKey: Bip32PublicKeyHex,
): boolean => {
  if (!txJson.metadata.signers) {
    return false
  }

  return txJson.metadata.signers.some(
    (signer) => signer.publicKey === sharedWalletKey && signer.signed === true,
  )
}

/**
 * Update transaction JSON with a new signature
 * Returns a new transaction JSON with updated signers metadata
 */
export const addSignatureToTransactionJSON = (
  txJson: MultisigTransactionJSON,
  sharedWalletKey: Bip32PublicKeyHex,
  walletId?: string,
): MultisigTransactionJSON => {
  const existingSigners = txJson.metadata.signers ?? []

  // Check if signer already exists
  const signerIndex = existingSigners.findIndex(
    (signer) => signer.publicKey === sharedWalletKey,
  )

  const updatedSigners: Array<TransactionSigner> =
    signerIndex >= 0
      ? existingSigners.map((signer, index) =>
          index === signerIndex
            ? {...signer, signed: true, ...(walletId && {walletId})}
            : signer,
        )
      : [
          ...existingSigners,
          {
            publicKey: sharedWalletKey,
            signed: true,
            ...(walletId && {walletId}),
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
