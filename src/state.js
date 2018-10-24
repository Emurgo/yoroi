// @flow
import type {RawTransaction} from './types/HistoryTransaction'
import usedReceiveAddresses from './mockData/usedAddresses.json'
import trans from './l10n'
import type {Translation} from './l10n/type'

export type Dict<T> = {[string]: T}

export type State = {
  languageCode: string,
  transactions: {
    isFetching: boolean,
    data: Dict<RawTransaction>,
  },
  usedReceiveAddresses: Array<string>,
  trans: Translation,
  isOnline: boolean,
}

export const getInitialState = (): State => ({
  languageCode: 'en-US',
  usedReceiveAddresses,
  transactions: {
    data: {},
    isFetching: false,
  },
  trans,
  isOnline: true, // we are online by default
})

export default getInitialState
