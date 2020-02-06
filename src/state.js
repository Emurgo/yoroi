// @flow
import {BigNumber} from 'bignumber.js'

import type {
  AccountState,
  Transaction,
  RawUtxo,
} from './types/HistoryTransaction'

export type Dict<T> = {[string]: T}

export type State = {
  wallets: Dict<{
    id: string,
    name: string,
    isShelley: boolean,
  }>,
  wallet: {
    name: string,
    isInitialized: boolean,
    isShelley: boolean,
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
  accountState: {
    isFetching: boolean,
    lastFetchingError: any,
    totalDelegated: BigNumber,
    ...AccountState,
  },
  poolInfo: {
    isFetching: boolean,
    lastFetchingError: any,
    meta: any, // TODO(v-almonacid): type me
  },
  isOnline: boolean,
  isAppInitialized: boolean,
  isKeyboardOpen: boolean,
  appSettings: {
    acceptedTos: boolean,
    installationId: ?string,
    languageCode: string,
    customPinHash: ?string,
    isSystemAuthEnabled: boolean,
    isBiometricHardwareSupported: boolean,
    sendCrashReports: boolean,
    canEnableBiometricEncryption: boolean,
  },
}

export const getInitialState = (): State => ({
  wallets: {},
  wallet: {
    name: '',
    isInitialized: false,
    isShelley: false,
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
  accountState: {
    isFetching: false,
    lastFetchingError: null,
    totalDelegated: new BigNumber(0),
    delegation: {pools: []},
    value: 0,
    counter: 0,
    last_rewards: {
      epoch: 0,
      reward: 0,
    },
  },
  poolInfo: {
    isFetching: false,
    lastFetchingError: null,
    meta: null,
  },
  isOnline: true, // we are online by default
  isAppInitialized: false,
  isKeyboardOpen: false,
  tos: '',
  appSettings: {
    acceptedTos: false,
    languageCode: 'en-US',
    installationId: null,
    customPinHash: null,
    isSystemAuthEnabled: false,
    isBiometricHardwareSupported: false,
    sendCrashReports: false,
    canEnableBiometricEncryption: false,
  },
})

export default getInitialState
