// @flow
import type {HistoryTransaction} from './types/HistoryTransaction'
import historyData from './mockData/history.json'
import receiveAddresses from './mockData/addresses.json'
import {processTxHistoryData} from './utils/transactions'
import trans from './l10n'
import type {Translation} from './l10n/type'

export type State = {
  languageCode: string,
  transactions: Array<HistoryTransaction>,
  receiveAddresses: Array<string>,
  trans: Translation,
}

export const getInitialState = (): State => ({
  languageCode: 'en-US',
  receiveAddresses,
  transactions: historyData.map((data) => processTxHistoryData(data, receiveAddresses)),
  trans,
})

export default getInitialState
