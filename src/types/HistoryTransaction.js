// @flow
import {Moment} from 'moment'

export type HistoryTransaction = {
  id: string,
  fromAddresses: Array<string>,
  toAddresses: Array<string>,
  amount: number,
  type: "SENT" | "RECEIVED",
  confirmations: number,
  timestamp: Moment,
  updatedAt: Moment,
  isIntraWallet: boolean,
}
