// @flow
import type {RawTransaction} from './types/HistoryTransaction'
import historyData from './mockData/history.json'
import receiveAddresses from './mockData/addresses.json'
import trans from './l10n'
import type {Translation} from './l10n/type'

import _ from 'lodash'

export type Dict<T> = {[string]: T}

export type State = {
  languageCode: string,
  rawTransactions: Dict<RawTransaction>,
  receiveAddresses: Array<string>,
  trans: Translation,
}

export const getInitialState = (): State => ({
  languageCode: 'en-US',
  receiveAddresses,
  rawTransactions: _.keyBy(historyData, (t) => t.hash),
  trans,
})

export default getInitialState
