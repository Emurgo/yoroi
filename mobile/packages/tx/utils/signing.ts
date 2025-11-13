// Transaction signing utilities
import type {Transaction, WasmModuleProxy} from '@emurgo/cross-csl-core'

import {UnsignedTransaction} from '../transaction-builder/types'

/**
 * Sign an unsigned transaction with private keys
 * Returns a CSL Transaction object
 *
 * NOTE: This function expects to be called within a cslScope.
 * The returned Transaction object will be valid within that same scope.
 */
export function signTransaction(
  csl: WasmModuleProxy,
  unsignedTx: UnsignedTransaction,
  accountPrivateKeyHex: string,
  stakingPrivateKeys?: Array<{keyHex: string}>,
  datumDatas?: Array<{data: string}>,
): Transaction {
  if (!unsignedTx.cbor) {
    throw new Error('UnsignedTransaction must have CBOR to sign')
  }

  const fixedTx = csl.FixedTransaction.fromHex(unsignedTx.cbor!)
  if (!fixedTx) {
    throw new Error('Invalid transaction CBOR')
  }

  // Sign with account key
  const accountPrivateKey = csl.PrivateKey.fromHex(accountPrivateKeyHex)
  fixedTx.signAndAddVkeySignature(accountPrivateKey)

  // Sign with staking keys if provided
  if (stakingPrivateKeys && stakingPrivateKeys.length > 0) {
    for (const stakingKey of stakingPrivateKeys) {
      const stakingPrivateKey = csl.PrivateKey.fromHex(stakingKey.keyHex)
      fixedTx.signAndAddVkeySignature(stakingPrivateKey)
    }
  }

  // Add datum data if provided (for Plutus transactions)
  if (datumDatas && datumDatas.length > 0) {
    // TODO: Handle datum data properly
    // This may require additional WASM calls to add datum to the transaction
    // For now, we'll note that datum data is provided but not yet implemented
  }

  // Convert FixedTransaction to Transaction
  const signedBytes = fixedTx.toBytes()
  return csl.Transaction.fromBytes(signedBytes)
}
