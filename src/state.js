// @flow
import l10n from './l10n'

import type {Transaction, RawUtxo} from './types/HistoryTransaction'
import type {Translation} from './l10n/type'

export type Dict<T> = {[string]: T}

export type State = {
  wallets: Dict<{
    id: string,
    name: string,
  }>,
  wallet: {
    name: string,
    isInitialized: boolean,
    isEasyConfirmationEnabled: boolean,
    transactions: Dict<Transaction>,
    internalAddresses: Array<string>,
    externalAddresses: Array<string>,
    isUsedAddressIndex: Dict<boolean>,
    confirmationCounts: Dict<number>,
    numReceiveAddresses: number,
    canGenerateNewReceiveAddress: boolean,
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
  trans: Translation,
  isOnline: boolean,
  isAppInitialized: boolean,
  isKeyboardOpen: boolean,
  appSettings: {
    acceptedTos: boolean,
    installationId: ?string,
    languageCode: string,
    customPinHash: ?string,
    isSystemAuthEnabled: boolean,
    isFingerprintsHardwareSupported: boolean,
    sendCrashReports: boolean,
    canEnableFingerprintEncryption: boolean,
  },
}

export const getInitialState = (): State => ({
  wallets: {},
  wallet: {
    name: '',
    isInitialized: false,
    isEasyConfirmationEnabled: false,
    transactions: {},
    internalAddresses: [],
    externalAddresses: [],
    confirmationCounts: {},
    isUsedAddressIndex: {},
    numReceiveAddresses: 0,
    canGenerateNewReceiveAddress: false,
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
  trans: l10n.translations,
  isOnline: true, // we are online by default
  isAppInitialized: false,
  isKeyboardOpen: false,
  appSettings: {
    acceptedTos: false,
    languageCode: 'en-US',
    installationId: null,
    customPinHash: null,
    isSystemAuthEnabled: false,
    isFingerprintsHardwareSupported: false,
    sendCrashReports: false,
    canEnableFingerprintEncryption: false,
  },
})

export default getInitialState
