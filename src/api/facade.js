// @flow
import assert from '../utils/assert'
import {TRANSACTION_STATUS} from '../types/HistoryTransaction'
import moment from 'moment'
import _ from 'lodash'
import BigNumber from 'bignumber.js'

import type {
  RawTransaction,
  TransactionStatus,
} from '../types/HistoryTransaction'

type WireTransaction = {|
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

const facadeStatus = (status: string) => {
  const mapping = {
    Successful: TRANSACTION_STATUS.SUCCESSFUL,
    Pending: TRANSACTION_STATUS.PENDING,
    Failed: TRANSACTION_STATUS.FAILED,
  }
  assert.assert(mapping[status] != null)
  return mapping[status]
}

export const facadeTransaction = (tx: WireTransaction): RawTransaction => {
  assert.assert(
    tx.inputs_address.length === tx.inputs_amount.length,
    'Invalid data from server (inputs mismatch)',
  )
  assert.assert(
    tx.outputs_address.length === tx.outputs_amount.length,
    'Invalid data from server (outputs mismatch)',
  )

  const blockNum = tx.block_num ? parseInt(tx.block_num, 10) : null
  assert.assert(
    tx.block_num ? blockNum : true,
    `Invalid data from server (block num ${tx.block_num})`,
  )

  const bestBlockNum = parseInt(tx.best_block_num, 10)
  assert.assert(bestBlockNum, 'Invalid data from server (best block num)')

  const mapAddressAmount = ([address, amount]) => ({
    address,
    amount: new BigNumber(amount, 10),
  })

  return {
    id: tx.hash,
    status: facadeStatus(tx.tx_state),
    inputs: _.zip(tx.inputs_address, tx.inputs_amount).map(mapAddressAmount),
    outputs: _.zip(tx.outputs_address, tx.outputs_amount).map(mapAddressAmount),
    blockNum,
    submittedAt: moment(tx.time),
    lastUpdatedAt: moment(tx.last_update),
    bestBlockNum,
  }
}
