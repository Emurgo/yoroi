// @flow
import {Moment} from 'moment'


export const TRANSACTION_DIRECTION = {
  SENT: 'SENT',
  RECEIVED: 'RECEIVED',
  SELF: 'SELF', // intra-wallet
}


export type TransactionDirection = $Values<typeof TRANSACTION_DIRECTION>


export const TRANSACTION_STATUS = {
  SUCCESSFUL: 'Successful',
  PENDING: 'Pending',
  FAILED: 'Failed',
}

export type TransactionStatus = $Values<typeof TRANSACTION_STATUS>

export type HistoryTransaction = {
  id: string,
  fromAddresses: Array<string>,
  toAddresses: Array<string>,
  amount: number,
  fee: number,
  direction: TransactionDirection,
  confirmations: number,
  timestamp: Moment,
  updatedAt: Moment,
  status: TransactionStatus,
}

export type RawTransaction = {|
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
