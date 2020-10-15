// @flow
import {BigNumber} from 'bignumber.js'

import {NETWORK_REGISTRY} from './config/types'

import type {RawUtxo, RemotePoolMetaSuccess} from './api/types'
import type {Transaction} from './types/HistoryTransaction'
import type {HWDeviceInfo} from './crypto/shelley/ledgerUtils'
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
    networkId: NetworkId,
    walletImplementationId: WalletImplementationId,
    isHW: boolean,
    hwDeviceInfo: ?HWDeviceInfo,
    isEasyConfirmationEnabled: boolean,
    transactions: Dict<Transaction>,
    internalAddresses: Array<string>,
    externalAddresses: Array<string>,
    confirmationCounts: Dict<number>,
    isUsedAddressIndex: Dict<boolean>,
    numReceiveAddresses: number,
    canGenerateNewReceiveAddress: boolean,
    checksum: WalletChecksum,
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
    isDelegating: boolean,
    lastFetchingError: any,
    totalDelegated: BigNumber,
    value: BigNumber,
    poolOperator: any, // TODO: type
  },
  poolInfo: {
    isFetching: boolean,
    lastFetchingError: any,
    meta: ?RemotePoolMetaSuccess,
  },
  isOnline: boolean,
  isAppInitialized: boolean,
  isKeyboardOpen: boolean,
  tos: string,
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
    walletImplementationId: '',
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
    checksum: {ImagePart: '', TextPart: ''},
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
    isDelegating: false,
    lastFetchingError: null,
    totalDelegated: new BigNumber(0),
    value: new BigNumber(0),
    poolOperator: null,
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
