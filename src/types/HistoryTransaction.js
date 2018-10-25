// @flow
import {Moment} from 'moment'
import {BigNumber} from 'bignumber.js'

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
  bruttoAmount: number,
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

export type RawUtxo = {|
  amount: string,
  receiver: string,
  tx_hash: string,
  tx_index: number,
  utxo_id: string,
|}

export type TransactionOutput = {|
  address: string,
  value: string,
|}

export type TransactionInput = {|
  ptr: {
    id: string,
    index: number,
  },
  value: {
    address: string,
    value: string,
  },
  addressing: {
    account: number,
    change: number,
    index: number,
  },
|}

export type PreparedTransactionData = {|
  changeAddress: string,
  fee: BigNumber,
  inputs: Array<TransactionInput>,
  outputs: Array<TransactionOutput>,
|}
