// Adapter to convert new UnsignedTransaction format to legacy UnsignedTx format
// This is a temporary adapter for backward compatibility during migration
import type {Withdrawals} from '@emurgo/cross-csl-core'
import {BigNumber} from 'bignumber.js'

import {CardanoMobileWrapped} from '../../../src/wallets/cardano/wrappedCsl'
import {UnsignedTransaction} from '../transaction-builder/types'
import type {Token} from '../types'
import {MultiToken} from '../types/multi-token'

/**
 * Legacy UnsignedTx format (from yoroi-lib)
 * This matches what yoroiUnsignedTx() expects
 */
export type LegacyUnsignedTx = {
  fee: {
    values: Array<{
      identifier: string
      amount: {toString(): string}
    }>
  }
  change: Array<{
    address: string
    values: MultiToken
  }>
  outputs: Array<{
    address: string
    value: MultiToken
    datum?: unknown
  }>
  withdrawals?: Withdrawals | null
  registrations: Array<{
    stakeCredential(): unknown
  }>
  deregistrations: Array<{
    stakeCredential(): unknown
  }>
  delegations: Array<{
    poolKeyhash(): unknown
  }>
  metadata: Array<{
    label: number
    data: unknown
  }>
}

/**
 * Convert new UnsignedTransaction to legacy UnsignedTx format
 * This adapter allows yoroiUnsignedTx() to work with the new format
 * @deprecated This will be removed once yoroiUnsignedTx is updated
 */
export async function adaptUnsignedTransaction(
  unsignedTx: UnsignedTransaction,
  defaultToken: Token,
): Promise<LegacyUnsignedTx> {
  return CardanoMobileWrapped.cslScope((wasm) => {
    // Convert fee from Balance.Amounts to MultiToken
    const feeMultiToken = new MultiToken([], defaultToken)
    for (const [tokenId, quantity] of Object.entries(
      unsignedTx.options.manualFee || {},
    )) {
      feeMultiToken.add({
        amount: new BigNumber(quantity),
        identifier: tokenId,
      })
    }

    // Convert outputs
    const outputs = unsignedTx.outputs.map((output) => {
      const multiToken = new MultiToken([], defaultToken)
      for (const [tokenId, quantity] of Object.entries(output.amounts)) {
        multiToken.add({
          amount: new BigNumber(quantity),
          identifier: tokenId,
        })
      }
      return {
        address: output.address,
        value: multiToken,
        datum: output.datum,
      }
    })

    // Convert change (from manualChangeOutput or calculate from inputs/outputs)
    const change: Array<{address: string; values: MultiToken}> = []
    if (unsignedTx.options.manualChangeOutput) {
      const changeMultiToken = new MultiToken([], defaultToken)
      for (const [tokenId, quantity] of Object.entries(
        unsignedTx.options.manualChangeOutput.amounts,
      )) {
        changeMultiToken.add({
          amount: new BigNumber(quantity),
          identifier: tokenId,
        })
      }
      change.push({
        address: unsignedTx.options.manualChangeOutput.address,
        values: changeMultiToken,
      })
    } else if (unsignedTx.options.changeAddress) {
      // Calculate change from inputs - outputs - fee
      // This is a simplified calculation - in practice, change is already in outputs
      // We'll extract it by checking if output address matches change address
      const changeOutput = unsignedTx.outputs.find(
        (output) => output.address === unsignedTx.options.changeAddress,
      )
      if (changeOutput) {
        const changeMultiToken = new MultiToken([], defaultToken)
        for (const [tokenId, quantity] of Object.entries(
          changeOutput.amounts,
        )) {
          changeMultiToken.add({
            amount: new BigNumber(quantity),
            identifier: tokenId,
          })
        }
        change.push({
          address: changeOutput.address,
          values: changeMultiToken,
        })
      }
    }

    // Convert withdrawals
    let withdrawals: Withdrawals | null = null
    if (unsignedTx.withdrawals.length > 0) {
      withdrawals = wasm.Withdrawals.new()
      for (const withdrawal of unsignedTx.withdrawals) {
        const rewardAddr = wasm.RewardAddress.fromAddress(
          wasm.Address.fromBech32(withdrawal.rewardAddress),
        )
        if (!rewardAddr) {
          throw new Error(`Invalid reward address: ${withdrawal.rewardAddress}`)
        }
        const amount = wasm.BigNum.fromStr(withdrawal.amount)
        withdrawals.insert(rewardAddr, amount)
      }
    }

    // Extract registrations, deregistrations, and delegations from certificates
    const registrations: Array<{stakeCredential(): unknown}> = []
    const deregistrations: Array<{stakeCredential(): unknown}> = []
    const delegations: Array<{poolKeyhash(): unknown}> = []

    for (const certWrapper of unsignedTx.certificates) {
      const cert = certWrapper.cert

      // Check if it's a stake registration
      const stakeReg = cert.asStakeRegistration()
      if (stakeReg != null && stakeReg.hasValue()) {
        registrations.push(stakeReg)
        continue
      }

      // Check if it's a stake deregistration
      const stakeDereg = cert.asStakeDeregistration()
      if (stakeDereg != null && stakeDereg.hasValue()) {
        deregistrations.push(stakeDereg)
        continue
      }

      // Check if it's a stake delegation
      const stakeDeleg = cert.asStakeDelegation()
      if (stakeDeleg != null && stakeDeleg.hasValue()) {
        delegations.push(stakeDeleg)
        continue
      }
    }

    // Convert metadata
    const metadata = (unsignedTx.metadata || []).map((meta) => ({
      label:
        typeof meta.label === 'string' ? parseInt(meta.label, 10) : meta.label,
      data: meta.data,
    }))

    return {
      fee: {
        values: feeMultiToken.values.map((entry) => ({
          identifier: entry.identifier,
          amount: {
            toString: () => entry.amount.toString(),
          },
        })),
      },
      change,
      outputs,
      withdrawals,
      registrations,
      deregistrations,
      delegations,
      metadata,
    }
  })
}
