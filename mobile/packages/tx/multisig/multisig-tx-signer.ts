/**
 * Multisig transaction signing
 * Handles signing transactions with multiple co-signers and tracking signatures
 */
import {CardanoMobileWrapped} from '@yoroi/cardano-wallet'
import {
  paymentScriptKeyPath,
  stakingScriptKeyPath,
} from '@yoroi/cardano-wallet/multisig/script-derivation'
import {
  type SignPolicy,
  getSharedWalletSignPolicy,
  hasSigned,
} from '@yoroi/cardano-wallet/multisig/script-utils'
import {getLogger} from '@yoroi/common'
import {Wallet} from '@yoroi/types'

import * as CSL from '@emurgo/cross-csl-core'
import {Buffer} from 'buffer'

import type {UnsignedTransaction} from '../transaction-builder/types'

/**
 * Parameters for signing a multisig transaction
 */
type SignMultisigTransactionParams = {
  readonly unsignedTx: UnsignedTransaction
  readonly coSignerKey: Wallet.Bip32PublicKeyHex
  readonly parentWalletRootKeyHex: string
  readonly accountVisual: number
  readonly paymentScriptCbor: Wallet.ScriptCbor
  readonly stakingScriptCbor: Wallet.ScriptCbor
}

/**
 * Result of signing a multisig transaction
 */
type MultisigSignResult = {
  readonly signedTx: CSL.Transaction
  readonly signedBy: Wallet.Bip32PublicKeyHex
  readonly cborHex: Wallet.TransactionCbor
}

/**
 * Sign a multisig transaction with a co-signer's key
 * Derives the appropriate signing key from the parent wallet root key
 */
export const signMultisigTransaction = async ({
  unsignedTx,
  coSignerKey,
  parentWalletRootKeyHex,
  accountVisual,
  paymentScriptCbor,
  stakingScriptCbor,
}: SignMultisigTransactionParams): Promise<MultisigSignResult> => {
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

    // Get the witness set (or create if it doesn't exist)
    let witnessSet = tx.witnessSet()
    if (!witnessSet) {
      witnessSet = csl.TransactionWitnessSet.new()
    }

    // Derive the payment signing key from the parent wallet root key
    // Following CIP-1854: MULTI_SIG_PURPOSE / COIN_TYPE / ACCOUNT / role / index
    const rootKey = csl.Bip32PrivateKey.fromBytes(
      Buffer.from(parentWalletRootKeyHex, 'hex'),
    )

    // Derive to the multisig account level
    const MULTI_SIG_PURPOSE = 2_147_485_500 // CIP-1854
    const COIN_TYPE = 2_147_485_463 // Cardano
    const accountKey = rootKey
      .derive(MULTI_SIG_PURPOSE)
      .derive(COIN_TYPE)
      .derive(accountVisual + 2_147_483_648) // hardStart

    // Derive payment key (role 0, index 0)
    const paymentKey = accountKey
      .derive(paymentScriptKeyPath.role)
      .derive(paymentScriptKeyPath.index)
      .toRawKey()

    // Derive staking key (role 2, index 0) if needed
    const needsStakingKey =
      unsignedTx.certificates.length > 0 || unsignedTx.withdrawals.length > 0

    let stakingKey: CSL.PrivateKey | undefined
    if (needsStakingKey) {
      stakingKey = accountKey
        .derive(stakingScriptKeyPath.role)
        .derive(stakingScriptKeyPath.index)
        .toRawKey()
    }

    // Create FixedTransaction for signing
    const fixedTx = csl.FixedTransaction.fromHex(unsignedTx.cbor)

    if (!fixedTx) {
      throw new Error('Failed to create FixedTransaction from CBOR')
    }

    // Sign with payment key
    fixedTx.signAndAddVkeySignature(paymentKey)

    // Sign with staking key if needed
    if (stakingKey) {
      fixedTx.signAndAddVkeySignature(stakingKey)
    }

    // Ensure native scripts are in the witness set
    let nativeScripts = witnessSet.nativeScripts()
    if (!nativeScripts) {
      nativeScripts = csl.NativeScripts.new()
    }

    // Add payment script if not already present
    const paymentScript = csl.NativeScript.fromHex(paymentScriptCbor)
    if (paymentScript) {
      // Check if script already exists
      let scriptExists = false
      for (let i = 0; i < nativeScripts.len(); i++) {
        const existingScript = nativeScripts.get(i)
        if (existingScript && existingScript.toHex() === paymentScriptCbor) {
          scriptExists = true
          break
        }
      }
      if (!scriptExists) {
        nativeScripts.add(paymentScript)
      }
    }

    // Add staking script if not already present
    const stakingScript = csl.NativeScript.fromHex(stakingScriptCbor)
    if (stakingScript) {
      // Check if script already exists
      let scriptExists = false
      for (let i = 0; i < nativeScripts.len(); i++) {
        const existingScript = nativeScripts.get(i)
        if (existingScript && existingScript.toHex() === stakingScriptCbor) {
          scriptExists = true
          break
        }
      }
      if (!scriptExists) {
        nativeScripts.add(stakingScript)
      }
    }

    witnessSet.setNativeScripts(nativeScripts)

    // Get the updated vkey witnesses from FixedTransaction
    const signedBytes = fixedTx.toBytes()
    const signedTx = csl.Transaction.fromBytes(signedBytes)

    if (!signedTx) {
      throw new Error('Failed to create signed transaction')
    }

    // Merge witness sets (vkey witnesses from FixedTransaction + native scripts)
    const signedWitnessSet = signedTx.witnessSet()
    if (signedWitnessSet) {
      // Copy vkey witnesses from signed transaction
      const vkeys = signedWitnessSet.vkeys()
      if (vkeys) {
        witnessSet.setVkeys(vkeys)
      }

      // Copy bootstrap witnesses if any
      const bootstraps = signedWitnessSet.bootstraps()
      if (bootstraps) {
        witnessSet.setBootstraps(bootstraps)
      }
    }

    // Create final transaction with merged witness set
    const txBody = tx.body()
    const auxData = tx.auxiliaryData()
    const finalTx = csl.Transaction.new(txBody, witnessSet, auxData)

    if (!finalTx) {
      throw new Error('Failed to create final transaction')
    }

    const cborHex = Buffer.from(finalTx.toBytes()).toString(
      'hex',
    ) as Wallet.TransactionCbor

    logger.debug('signMultisigTransaction: Transaction signed', {
      coSignerKey: coSignerKey.substring(0, 16) + '...',
      hasStakingKey: needsStakingKey,
    })

    return {
      signedTx: finalTx,
      signedBy: coSignerKey,
      cborHex,
    }
  })
}

/**
 * Check if a transaction has been signed by a specific co-signer
 */
export const checkCoSignerSignature = async (
  signedTxCbor: Wallet.TransactionCbor,
  coSignerKey: Wallet.Bip32PublicKeyHex,
  paymentScriptCbor: Wallet.ScriptCbor,
  stakingScriptCbor: Wallet.ScriptCbor,
): Promise<boolean> => {
  return CardanoMobileWrapped.cslScope(async (csl) => {
    const tx = csl.Transaction.fromHex(signedTxCbor)
    if (!tx) {
      return false
    }

    const witnessSet = tx.witnessSet()
    if (!witnessSet) {
      return false
    }

    // Get vkey witnesses
    const vkeys = witnessSet.vkeys()
    if (!vkeys) {
      return false
    }

    // Derive payment key hash
    const paymentDerivationPath = paymentScriptKeyPath
    const bip32PublicKey = csl.Bip32PublicKey.fromBytes(
      Buffer.from(coSignerKey, 'hex'),
    )
    if (!bip32PublicKey) {
      return false
    }

    const paymentDerivedKey = bip32PublicKey
      .derive(paymentDerivationPath.role)
      .derive(paymentDerivationPath.index)
    const paymentKeyHash = paymentDerivedKey.toRawKey().hash().toHex()

    // Derive staking key hash
    const stakingDerivationPath = stakingScriptKeyPath
    const stakingDerivedKey = bip32PublicKey
      .derive(stakingDerivationPath.role)
      .derive(stakingDerivationPath.index)
    const stakingKeyHash = stakingDerivedKey.toRawKey().hash().toHex()

    // Check if any vkey witness matches the payment or staking key hash
    for (let i = 0; i < vkeys.len(); i++) {
      const vkey = vkeys.get(i)
      if (!vkey) continue

      const publicKey = vkey.vkey().publicKey()
      const keyHash = publicKey.hash().toHex()

      if (keyHash === paymentKeyHash || keyHash === stakingKeyHash) {
        return true
      }
    }

    return false
  })
}

/**
 * Get all co-signers who have signed a transaction
 */
export const getSignedCoSigners = async (
  signedTxCbor: Wallet.TransactionCbor,
  expectedCoSigners: ReadonlyArray<Wallet.Bip32PublicKeyHex>,
  paymentScriptCbor: Wallet.ScriptCbor,
  stakingScriptCbor: Wallet.ScriptCbor,
): Promise<ReadonlyArray<Wallet.Bip32PublicKeyHex>> => {
  const signedCoSigners: Wallet.Bip32PublicKeyHex[] = []

  for (const coSignerKey of expectedCoSigners) {
    const hasSigned = await checkCoSignerSignature(
      signedTxCbor,
      coSignerKey,
      paymentScriptCbor,
      stakingScriptCbor,
    )

    if (hasSigned) {
      signedCoSigners.push(coSignerKey)
    }
  }

  return signedCoSigners
}

/**
 * Validate that a multisig transaction meets quorum requirements
 */
export const validateMultisigQuorum = (
  signedCoSigners: ReadonlyArray<Wallet.Bip32PublicKeyHex>,
  signPolicy: SignPolicy,
): boolean => {
  const signedCount = signedCoSigners.length
  const requiredCount = signPolicy.requiredCosigners

  return signedCount >= requiredCount
}

/**
 * Get quorum status for a multisig transaction
 */
export const getQuorumStatus = (
  signedCoSigners: ReadonlyArray<Wallet.Bip32PublicKeyHex>,
  signPolicy: SignPolicy,
): {
  readonly signed: number
  readonly required: number
  readonly meetsQuorum: boolean
  readonly missingSigners: ReadonlyArray<Wallet.Bip32PublicKeyHex>
} => {
  const signed = signedCoSigners.length
  const required = signPolicy.requiredCosigners
  const meetsQuorum = signed >= required

  // Find missing signers
  const missingSigners = signPolicy.signers
    .map((signer) => {
      // Find the corresponding Bip32PublicKeyHex for this key hash
      // This requires matching the key hash to the co-signer key
      // For now, we'll return all signers as potentially missing
      // In practice, you'd need to match keyHash to Bip32PublicKeyHex
      return undefined
    })
    .filter((key): key is Wallet.Bip32PublicKeyHex => key !== undefined)

  return {
    signed,
    required,
    meetsQuorum,
    missingSigners: [], // TODO: Implement proper missing signer detection
  }
}
