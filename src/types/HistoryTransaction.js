// @flow
import {BigNumber} from 'bignumber.js'

import type {RemoteCertificateMeta} from '../api/types'

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
  confirmations: number,
  submittedAt: ?string,
  lastUpdatedAt: string,
  status: TransactionStatus,
  assurance: TransactionAssurance,
|}

export const TRANSACTION_TYPE = {
  BYRON: 'byron',
  SHELLEY: 'shelley',
}
export type TransactionType = $Values<typeof TRANSACTION_TYPE>

export type Transaction = {|
  id: string,
  type?: TransactionType,
  fee?: string,
  status: TransactionStatus,
  inputs: Array<{address: string, amount: string}>,
  outputs: Array<{address: string, amount: string}>,
  blockNum: ?number,
  blockHash: ?string,
  txOrdinal: ?number,
  submittedAt: ?string,
  lastUpdatedAt: string,
  epoch: ?number,
  slot: ?number,
  withdrawals: Array<{|
    address: string, // hex
    amount: string,
  |}>,
  certificates: Array<RemoteCertificateMeta>,
|}

export const AMOUNT_FORMAT = {
  ADA: 'ADA',
  LOVELACE: 'LOVELACE',
}
export type AmountFormat = $Values<typeof AMOUNT_FORMAT>
