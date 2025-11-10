// Cardano transaction utilities
// Functions for transaction hashing, ID calculation, etc.
import {bech32ToHex, isHex} from '@yoroi/common'

import {TransactionHash, WasmModuleProxy} from '@emurgo/cross-csl-core'
import {BigNumber} from 'bignumber.js'

/**
 * Hash a transaction to get its transaction hash
 */
export async function hashTransaction(
  wasm: WasmModuleProxy,
  transactionBytes: Uint8Array,
): Promise<TransactionHash> {
  const fixed = await wasm.FixedTransaction.fromBytes(transactionBytes)
  return await fixed.transactionHash()
}

/**
 * Calculate transaction ID from encoded transaction
 */
export async function calculateTxId(
  wasm: WasmModuleProxy,
  encodedTx: string,
  encoding: 'base64' | 'hex',
): Promise<string> {
  const txBuffer = Buffer.from(encodedTx, encoding)
  const hash = await hashTransaction(wasm, txBuffer)
  return await hash.toHex()
}

/**
 * Get balance for staking credentials from UTXOs
 */
export async function getBalanceForStakingCredentials(
  wasm: WasmModuleProxy,
  utxos: Array<{receiver: string; amount: string}>,
): Promise<Record<string, string>> {
  const balances = await utxos.reduce(
    async (prevPromise, curr) => {
      const prev = await prevPromise
      const hex = isHex(curr.receiver)
        ? curr.receiver
        : bech32ToHex(curr.receiver)

      if (!hex) return prev
      if (!hex.match(/^[0-3]/)) return prev

      try {
        const baseAddress = await wasm.BaseAddress.fromAddress(
          await wasm.Address.fromBytes(Buffer.from(hex, 'hex')),
        )
        if (!baseAddress) {
          throw new Error('getBalanceForStakingCredentials: invalid address')
        }
        const stakeCred = await baseAddress.stakeCred()
        const stakeCredHex = Buffer.from(await stakeCred.toBytes()).toString(
          'hex',
        )
        if (!prev[stakeCredHex]) {
          prev[stakeCredHex] = '0'
        }

        const prevAmount = new BigNumber(prev[stakeCredHex])
        const currAmount = new BigNumber(curr.amount)

        prev[stakeCredHex] = prevAmount.plus(currAmount).toString()
      } catch {
        /** */
      }

      return prev
    },
    Promise.resolve({} as {[key: string]: string}),
  )
  return balances
}
