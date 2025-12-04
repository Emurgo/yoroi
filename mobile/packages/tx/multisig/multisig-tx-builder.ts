/**
 * Multisig transaction builder
 * Builds transactions for script wallets with native scripts in witness set
 */
import {CardanoMobileWrapped} from '@yoroi/cardano-wallet'
import {ScriptCbor, TokenId, TransactionCbor} from '@yoroi/types'

import {Buffer} from 'buffer'

import {
  type TransactionBuilderState,
  buildTransaction,
} from '../transaction-builder/builder'
import type {UnsignedTransaction} from '../transaction-builder/types'
import type {CardanoHaskellConfig} from '../types'

/**
 * Parameters for building a multisig transaction
 */
type BuildMultisigTransactionParams = {
  readonly state: TransactionBuilderState
  readonly protocolParams: CardanoHaskellConfig
  readonly paymentScriptCbor: ScriptCbor
  readonly stakingScriptCbor: ScriptCbor
  readonly primaryTokenId?: string
}

/**
 * Build a transaction for a multisig wallet
 * Includes native scripts in the witness set
 */
export const buildMultisigTransaction = async ({
  state,
  protocolParams,
  paymentScriptCbor,
  stakingScriptCbor,
  primaryTokenId,
}: BuildMultisigTransactionParams): Promise<UnsignedTransaction> => {
  // First build the transaction body using the standard builder
  const unsignedTx = await buildTransaction(
    state,
    protocolParams,
    primaryTokenId as TokenId | undefined,
  )

  if (!unsignedTx.cbor) {
    throw new Error('Transaction builder did not return CBOR')
  }

  return CardanoMobileWrapped.cslScope((csl) => {
    // Parse the transaction CBOR to get the full transaction
    if (!unsignedTx.cbor) {
      throw new Error('UnsignedTransaction must have CBOR')
    }
    const fullTx = csl.Transaction.fromHex(unsignedTx.cbor)

    if (!fullTx) {
      throw new Error('Failed to parse transaction CBOR')
    }

    // Get the existing witness set (or create if it doesn't exist)
    let witnessSet = fullTx.witnessSet()

    if (!witnessSet) {
      witnessSet = csl.TransactionWitnessSet.new()
    }

    // Get or create native scripts collection
    let nativeScripts = witnessSet.nativeScripts()

    if (!nativeScripts) {
      nativeScripts = csl.NativeScripts.new()
    }

    // Add payment script to witness set if not already present
    const paymentScript = csl.NativeScript.fromHex(paymentScriptCbor)
    if (!paymentScript) {
      throw new Error('Invalid payment script CBOR')
    }

    // Check if payment script already exists
    let paymentScriptExists = false
    for (let i = 0; i < nativeScripts.len(); i++) {
      const existingScript = nativeScripts.get(i)
      if (existingScript && existingScript.toHex() === paymentScriptCbor) {
        paymentScriptExists = true
        break
      }
    }

    if (!paymentScriptExists) {
      nativeScripts.add(paymentScript)
    }

    // Add staking script to witness set if not already present
    const stakingScript = csl.NativeScript.fromHex(stakingScriptCbor)
    if (!stakingScript) {
      throw new Error('Invalid staking script CBOR')
    }

    // Check if staking script already exists
    let stakingScriptExists = false
    for (let i = 0; i < nativeScripts.len(); i++) {
      const existingScript = nativeScripts.get(i)
      if (existingScript && existingScript.toHex() === stakingScriptCbor) {
        stakingScriptExists = true
        break
      }
    }

    if (!stakingScriptExists) {
      nativeScripts.add(stakingScript)
    }

    // Update witness set with native scripts
    witnessSet.setNativeScripts(nativeScripts)

    // Get transaction body
    const txBody = fullTx.body()

    if (!txBody) {
      throw new Error('Transaction has no body')
    }

    // Get auxiliary data if present
    const auxData = fullTx.auxiliaryData()

    // Create new transaction with updated witness set
    const updatedTx = csl.Transaction.new(txBody, witnessSet, auxData)

    if (!updatedTx) {
      throw new Error('Failed to create updated transaction')
    }

    // Serialize to CBOR
    const txBytes = updatedTx.toBytes()
    const cbor = Buffer.from(txBytes).toString('hex') as TransactionCbor

    return {
      ...unsignedTx,
      cbor,
    }
  })
}
