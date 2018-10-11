// @flow
import {Moment} from 'moment'

export type TransactionType = 'SENT' | 'RECEIVED'

export type HistoryTransaction = {
  id: string,
  fromAddresses: Array<string>,
  toAddresses: Array<string>,
  amount: number,
  type: TransactionType,
  confirmations: number,
  timestamp: Moment,
  updatedAt: Moment,
  isIntraWallet: boolean,
}

export type RawTransaction = {|
  hash: string,
  inputs_address: Array<string>,
  inputs_amount: Array<string>,
  outputs_address: Array<string>,
  outputs_amount: Array<string>,
  block_num: string,
  time: string,
  tx_state: string,
  last_update: string,
  best_block_num: string,
|}
