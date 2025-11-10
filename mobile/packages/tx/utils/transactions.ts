// Cardano transaction utilities
// Functions for transaction hashing, ID calculation, etc.
import {bech32ToHex, isHex} from '@yoroi/common'

import {TransactionHash} from '@emurgo/cross-csl-core'
import {BigNumber} from 'bignumber.js'

import {CardanoMobileWrapped} from '../../../src/wallets/cardano/wrappedCsl'

/**
 * Hash a transaction to get its transaction hash
 */
export async function hashTransaction(
  csl,
  transactionBytes: Uint8Array,
): Promise<TransactionHash> {
  const fixed = csl.FixedTransaction.fromBytes(transactionBytes)
  return fixed.transactionHash()
}

/**
 * Calculate transaction ID from encoded transaction
 */
export async function calculateTxId(
  encodedTx: string,
  encoding: 'base64' | 'hex',
): Promise<string> {
  return CardanoMobileWrapped.cslScope(async (csl) => {
    const txBuffer = Buffer.from(encodedTx, encoding)
    const hash = await hashTransaction(csl, txBuffer)
    return hash.toHex()
  })
}

/**
 * Get balance for staking credentials from UTXOs
 */
export async function getBalanceForStakingCredentials(
  utxos: Array<{receiver: string; amount: string}>,
): Promise<Record<string, string>> {
  return CardanoMobileWrapped.cslScope(async (csl) => {
    const balances = await utxos.reduce(
      async (prevPromise, curr) => {
        const prev = await prevPromise
        const hex = isHex(curr.receiver)
          ? curr.receiver
          : bech32ToHex(curr.receiver)

        if (!hex) return prev
        if (!hex.match(/^[0-3]/)) return prev

        try {
          const baseAddress = csl.BaseAddress.fromAddress(
            csl.Address.fromBytes(Buffer.from(hex, 'hex')),
          )
          if (!baseAddress) {
            throw new Error('getBalanceForStakingCredentials: invalid address')
          }
          const stakeCred = baseAddress.stakeCred()
          const stakeCredHex = Buffer.from(stakeCred.toBytes()).toString('hex')
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
  })
}
