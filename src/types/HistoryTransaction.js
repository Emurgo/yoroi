// @flow
import {BigNumber} from 'bignumber.js'

export const TRANSACTION_DIRECTION = {
  SENT: 'SENT',
  RECEIVED: 'RECEIVED',
  SELF: 'SELF', // intra-wallet
  MULTI: 'MULTI', // multi-party
}

export type TransactionDirection = $Values<typeof TRANSACTION_DIRECTION>

export const TRANSACTION_STATUS = {
  SUCCESSFUL: 'Successful',
  PENDING: 'Pending',
  FAILED: 'Failed',
}

export type TransactionStatus = $Values<typeof TRANSACTION_STATUS>
export type TransactionAssurance =
  | 'PENDING'
  | 'FAILED'
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'

export type TransactionInfo = {|
  id: string,
  fromAddresses: Array<string>,
  toAddresses: Array<string>,
  amount: ?BigNumber,
  fee: ?BigNumber,
  bruttoAmount: BigNumber,
  bruttoFee: BigNumber,
  direction: TransactionDirection,
  // TODO(ppershing): why this can't be typical number?
  confirmations: BigNumber,
  submittedAt: string,
  lastUpdatedAt: string,
  status: TransactionStatus,
  assurance: TransactionAssurance,
|}

export type Transaction = {|
  id: string,
  status: TransactionStatus,
  inputs: Array<{address: string, amount: string}>,
  outputs: Array<{address: string, amount: string}>,
  blockNum: ?number,
  bestBlockNum: number,
  submittedAt: string,
  lastUpdatedAt: string,
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
