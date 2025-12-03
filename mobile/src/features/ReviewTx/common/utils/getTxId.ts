import {calculateTxId} from '@yoroi/tx'

import {Transaction, WasmModuleProxy} from '@emurgo/cross-csl-core'
import {Buffer} from 'buffer'

import {CardanoMobileWrapped} from '@yoroi/cardano-wallet/wrappedCsl'

/**
 * Safe extraction of transaction ID from callback arguments
 *
 * Priority order:
 * 1. args?.txId (already calculated, preferred)
 * 2. fallbackCbor (unsigned CBOR - safe, body hash is same for signed/unsigned)
 * 3. args?.signedTx or args?.tx (last resort, with null checks)
 *
 * @param args - Callback arguments from useOnConfirm
 * @param fallbackCbor - Optional unsigned CBOR to use as safe fallback
 * @returns Transaction ID string, or undefined if not available
 */
export const getTxIdFromArgs = async (
  args?: {
    txId?: string
    signedTx?: Transaction | ((csl: WasmModuleProxy) => Transaction)
    tx?: Transaction
  },
  fallbackCbor?: string,
): Promise<string | undefined> => {
  // 1. Prefer txId from args (already calculated)
  if (args?.txId) {
    return args.txId
  }

  // 2. Use unsigned CBOR if provided (safe - body hash is same for signed/unsigned)
  if (fallbackCbor) {
    try {
      return await CardanoMobileWrapped.cslScope(async (csl) => {
        return await calculateTxId(csl, fallbackCbor, 'hex')
      })
    } catch (error) {
      // If calculation fails, continue to next fallback
    }
  }

  // 3. Last resort: try to calculate from signedTx (with null checks)
  const signedTx = args?.signedTx ?? args?.tx
  if (signedTx) {
    try {
      // If signedTx is a function, call it with CSL to get Transaction
      const tx: Transaction | null =
        typeof signedTx === 'function'
          ? await CardanoMobileWrapped.cslScope((csl) => signedTx(csl))
          : signedTx

      if (tx) {
        const txBytes = tx.toBytes()
        return await CardanoMobileWrapped.cslScope(async (csl) => {
          return await calculateTxId(
            csl,
            Buffer.from(txBytes).toString('hex'),
            'hex',
          )
        })
      }
    } catch (error) {
      // If calculation fails, return undefined
    }
  }

  return undefined
}
