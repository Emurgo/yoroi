// @flow
import moment from 'moment'
import _ from 'lodash'

import assert from '../utils/assert'
import {TRANSACTION_STATUS} from '../types/HistoryTransaction'
import {isValidAddress} from '../crypto/util'

import type {Transaction, TransactionStatus} from '../types/HistoryTransaction'

// This is what we expect to get from the API
type RawTransaction = {|
  hash: string,
  inputs_address: Array<string>,
  inputs_amount: Array<string>,
  outputs_address: Array<string>,
  outputs_amount: Array<string>,
  block_num: string,
  time: string,
  tx_state: TransactionStatus,
  last_update: string,
  best_block_num: string,
|}

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

export const checkISO8601Date = (data: string) => {
  // ISO8601 format we want to check is exactly following
  // "2018-11-07T17:10:21.774Z"
  const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/
  if (!regex.test(data)) return false
  if (!moment(data).isValid()) return false
  return data === moment(data).toISOString()
}

export const checkValidHash = (data: string) => {
  const regex = /^[0-9a-f]{64}$/
  return regex.test(data)
}

export const checkAndFacadeTransactionAsync = async (
  tx: RawTransaction,
): Promise<Transaction> => {
  assert.assert(
    tx.inputs_address.length === tx.inputs_amount.length,
    'Invalid data from server (inputs mismatch)',
    tx.inputs_address,
    tx.inputs_amount,
  )
  assert.assert(
    tx.outputs_address.length === tx.outputs_amount.length,
    'Invalid data from server (outputs mismatch)',
    tx.outputs_address,
    tx.outputs_amount,
  )

  assert.assert(
    checkNonNegativeInt(tx.best_block_num),
    'Invalid best_block_num',
    tx.best_block_num,
  )
  const bestBlockNum = parseInt(tx.best_block_num, 10)

  assert.assert(
    tx.tx_state !== 'Successful' || checkNonNegativeInt(tx.block_num),
    'Invalid block_num',
    tx.block_num,
  )

  const blockNum = tx.block_num ? parseInt(tx.block_num, 10) : null

  tx.inputs_amount.forEach((amount) => {
    assert.assert(checkNonNegativeInt(amount), 'Invalid input amount', amount)
  })

  tx.outputs_amount.forEach((amount) => {
    assert.assert(checkNonNegativeInt(amount), 'Invalid output amount', amount)
  })

  await Promise.all(
    tx.inputs_address.map(async (address) => {
      assert.assert(
        await isValidAddress(address),
        'Invalid input address',
        address,
      )
    }),
  )

  await Promise.all(
    tx.outputs_address.map(async (address) => {
      assert.assert(
        await isValidAddress(address),
        'Invalid output address',
        address,
      )
    }),
  )

  assert.assert(checkISO8601Date(tx.time), 'Invalid time', tx.time)

  assert.assert(
    checkISO8601Date(tx.last_update),
    'Invalid last_update',
    tx.last_update,
  )

  assert.assert(checkValidHash(tx.hash), 'Invalid hash', tx.hash)

  const mapAddressAmount = ([address, amount]) => ({
    address,
    amount,
  })

  return {
    id: tx.hash,
    status: checkAndFacadeStatus(tx.tx_state),
    inputs: _.zip(tx.inputs_address, tx.inputs_amount).map(mapAddressAmount),
    outputs: _.zip(tx.outputs_address, tx.outputs_amount).map(mapAddressAmount),
    blockNum,
    submittedAt: tx.time,
    lastUpdatedAt: tx.last_update,
    bestBlockNum,
  }
}
