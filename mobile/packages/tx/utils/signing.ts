// Transaction signing utilities
import type {PrivateKey, Transaction, WasmModuleProxy} from '@emurgo/cross-csl-core'
import {Buffer} from 'buffer'

import {UnsignedTransaction} from '../transaction-builder/types'

/**
 * Sign an unsigned transaction with private keys
 * Returns a CSL Transaction object
 */
export async function signTransaction(
  wasm: WasmModuleProxy,
  unsignedTx: UnsignedTransaction,
  accountPrivateKeyHex: string,
  stakingPrivateKeys?: Array<{keyHex: string}>,
  datumDatas?: Array<{data: string}>,
): Promise<Transaction> {
  if (!unsignedTx.cbor) {
    throw new Error('UnsignedTransaction must have CBOR to sign')
  }

  const fixedTx = await wasm.FixedTransaction.fromHex(unsignedTx.cbor)
  if (!fixedTx) {
    throw new Error('Invalid transaction CBOR')
  }

  // Sign with account key
  const accountPrivateKey = await wasm.PrivateKey.fromHex(accountPrivateKeyHex)
  await fixedTx.signAndAddVkeySignature(accountPrivateKey)

  // Sign with staking keys if provided
  if (stakingPrivateKeys && stakingPrivateKeys.length > 0) {
    for (const stakingKey of stakingPrivateKeys) {
      const stakingPrivateKey = await wasm.PrivateKey.fromHex(stakingKey.keyHex)
      await fixedTx.signAndAddVkeySignature(stakingPrivateKey)
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
  return await wasm.Transaction.fromBytes(signedBytes)
}

