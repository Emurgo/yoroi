// @flow
import type {RawTransaction} from './types/HistoryTransaction'
import receiveAddresses from './mockData/addresses.json'
import receiveAddressesUsed from './mockData/addressesUsed.json'
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
  receiveAddressesUsed: Array<string>,
  trans: Translation,
  isOnline: boolean,
}

export const getInitialState = (): State => ({
  languageCode: 'en-US',
  receiveAddresses,
  receiveAddressesUsed,
  transactions: {
    data: {},
    isFetching: false,
  },
  trans,
  isOnline: true, // we are online by default
})

export default getInitialState
