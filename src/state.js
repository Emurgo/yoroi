// @flow
import type {RawTransaction, RawUtxo} from './types/HistoryTransaction'
import trans from './l10n'
import type {Translation} from './l10n/type'

export type Dict<T> = {[string]: T}

export type State = {
  languageCode: string,
  wallet: {
    transactions: Dict<RawTransaction>,
  },
  txHistory: {
    isSynchronizing: boolean,
    lastSyncError: any, // TODO(ppershing): type me
  },
  balance: {
    isFetching: boolean,
    lastFetchingError: any,
    utxos: ?Array<RawUtxo>,
  },
  generatedReceiveAddresses: Array<{address: string, isUsed: boolean}>,
  trans: Translation,
  isOnline: boolean,
}

export const getInitialState = (): State => ({
  languageCode: 'en-US',
  wallet: {
    transactions: {},
  },
  txHistory: {
    isSynchronizing: false,
    lastSyncError: null,
  },
  balance: {
    isFetching: false,
    lastFetchingError: null,
    utxos: null,
  },
  generatedReceiveAddresses: [],
  trans,
  isOnline: true, // we are online by default
})

export default getInitialState
