// @flow
import {BigNumber} from 'bignumber.js'

import {NETWORK_REGISTRY} from './config/types'

import type {AccountState, RawUtxo} from './api/types'
import type {Transaction} from './types/HistoryTransaction'
import type {HWDeviceInfo} from './crypto/byron/ledgerUtils'
import type {NetworkId, WalletImplementationId} from './config/types'
import type {WalletChecksum} from '@emurgo/cip4-js'

export type Dict<T> = {[string]: T}

export type WalletMeta = {
  id: string,
  name: string,
  networkId: NetworkId,
  walletImplementationId: WalletImplementationId,
  isHW: boolean,
  isShelley?: ?boolean, // legacy jormungandr
  isEasyConfirmationEnabled: boolean,
  checksum: WalletChecksum,
}

export type State = {
  wallets: Dict<WalletMeta>,
  wallet: {
    name: string,
    isInitialized: boolean,
    networkId: ?NetworkId,
    isHW: boolean,
    hwDeviceInfo: ?HWDeviceInfo,
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
    meta: any,
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
    currentVersion: ?string,
  },
  // need to add as a non-wallet-specific property to avoid conflict with other
  // actions that may override this property (otherwise more refactoring is needed)
  isFlawedWallet: boolean,
  isMaintenance: boolean,
}

export const getInitialState = (): State => ({
  wallets: {},
  wallet: {
    name: '',
    isInitialized: false,
    networkId: NETWORK_REGISTRY.UNDEFINED,
    isHW: false,
    hwDeviceInfo: null,
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
    currentVersion: null,
  },
  isFlawedWallet: false,
  isMaintenance: false,
})

export default getInitialState
