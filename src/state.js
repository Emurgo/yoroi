// @flow
import type {RawTransaction} from './types/HistoryTransaction'
import receiveAddresses from './mockData/addresses.json'
import trans from './l10n'
import type {Translation} from './l10n/type'

export type Dict<T> = {[string]: T}

export type State = {
  languageCode: string,
  transactions: {
    isFetching: boolean,
    data: Dict<RawTransaction>,
  },
  receiveAddresses: Array<string>,
  trans: Translation,
}

export const getInitialState = (): State => ({
  languageCode: 'en-US',
  receiveAddresses,
  transactions: {
    data: {},
    isFetching: false,
  },
  trans,
})

export default getInitialState
