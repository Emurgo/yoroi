// @flow
import type {RawTransaction} from './types/HistoryTransaction'
import trans from './l10n'
import type {Translation} from './l10n/type'

export type Dict<T> = {[string]: T}

export type State = {
  languageCode: string,
  transactions: {
    isFetching: boolean,
    data: Dict<RawTransaction>,
  },
  generatedReceiveAddresses: Array<{address: string, isUsed: boolean}>,
  trans: Translation,
  isOnline: boolean,
}

export const getInitialState = (): State => ({
  languageCode: 'en-US',
  transactions: {
    data: {},
    isFetching: false,
  },
  generatedReceiveAddresses: [],
  trans,
  isOnline: true, // we are online by default
})

export default getInitialState
