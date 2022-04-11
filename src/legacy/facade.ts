import moment from 'moment'

import assert from './assert'
import type {Transaction, TransactionStatus} from './HistoryTransaction'
import {TRANSACTION_STATUS} from './HistoryTransaction'
import type {RawTransaction} from './types'
import {normalizeToAddress} from './utils'

const checkAndFacadeStatus = (status: string): TransactionStatus => {
  const mapping = {
    Successful: TRANSACTION_STATUS.SUCCESSFUL,
    Pending: TRANSACTION_STATUS.PENDING,
    Failed: TRANSACTION_STATUS.FAILED,
  }
  assert.assert(mapping[status], 'Invalid status', status)
  return mapping[status]
}

export const checkNonNegativeInt = (data: string) => {
  // rest of the code does not catch negative values
  const regex = /^\d+/
  if (!regex.test(data)) return false
  const parsed = parseInt(data, 10)
  return data === parsed.toString()
}
export const checkISO8601Date = (data: null | undefined | string) => {
  if (data == null) return false
  // ISO8601 format we want to check is exactly following
  // "2018-11-07T17:10:21.774Z"
  const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/
  if (!regex.test(data)) return false
  if (!moment(data).isValid()) return false
  return data === moment(data).toISOString()
}
export const checkValidHash = (data: string | null | undefined) => {
  if (data == null) return false
  const regex = /^[0-9a-f]{64}$/
  return regex.test(data)
}
export const checkAndFacadeTransactionAsync = async (tx: RawTransaction): Promise<Transaction> => {
  tx.inputs.forEach((i) => {
    assert.assert(checkNonNegativeInt(i.amount), 'Invalid input amount', i.amount)
  })
  tx.outputs.forEach((o) => {
    assert.assert(checkNonNegativeInt(o.amount), 'Invalid output amount', o.amount)
  })
  await Promise.all(
    tx.inputs.map(async (input) => {
      assert.assert((await normalizeToAddress(input.address)) != null, 'Invalid input address', input.address)
    }),
  )
  await Promise.all(
    tx.outputs.map(async (output) => {
      assert.assert((await normalizeToAddress(output.address)) != null, 'Invalid output address', output.address)
    }),
  )
  assert.assert(checkISO8601Date(tx.last_update), 'Invalid last_update', tx.last_update)
  assert.assert(checkValidHash(tx.hash), 'Invalid hash', tx.hash)

  /**
   * all of the following parameters must exist if the tx was successful
   */
  assert.assert(tx.tx_state !== 'Successful' || checkISO8601Date(tx.time), 'Invalid time', tx.time)
  assert.assert(tx.tx_state !== 'Successful' || checkValidHash(tx.block_hash), 'Invalid block_hash', tx.block_hash)
  assert.assert(
    tx.tx_state !== 'Successful' ||
      (tx.block_num != null && tx.tx_ordinal != null && tx.epoch != null && tx.slot != null),
    'Successful tx must include full metadata',
    tx.time,
  )
  return {
    id: tx.hash,
    type: tx.type,
    fee: tx.fee ?? undefined,
    status: checkAndFacadeStatus(tx.tx_state),
    inputs: tx.inputs.map((i) => ({
      address: i.address,
      amount: i.amount,
      assets: (i.assets ?? []).map((a) => ({
        amount: a.amount,
        assetId: a.assetId,
        policyId: a.policyId,
        name: a.name,
      })),
    })),
    outputs: tx.outputs.map((o) => ({
      address: o.address,
      amount: o.amount,
      assets: (o.assets ?? []).map((a) => ({
        amount: a.amount,
        assetId: a.assetId,
        policyId: a.policyId,
        name: a.name,
      })),
    })),
    lastUpdatedAt: tx.last_update,
    // all of these can be null
    submittedAt: tx.time,
    blockNum: tx.block_num,
    blockHash: tx.block_hash,
    txOrdinal: tx.tx_ordinal,
    epoch: tx.epoch,
    slot: tx.slot,
    withdrawals: tx.withdrawals,
    certificates: tx.certificates,
    validContract: tx.valid_contract,
    scriptSize: tx.script_size,
    collateralInputs: (tx.collateral_inputs ?? []).map((i) => ({
      address: i.address,
      amount: i.amount,
      assets: (i.assets ?? []).map((a) => ({
        amount: a.amount,
        assetId: a.assetId,
        policyId: a.policyId,
        name: a.name,
      })),
    })),
  }
}
