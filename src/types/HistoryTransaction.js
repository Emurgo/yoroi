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
