// @flow

import type {WalletChecksum} from '@emurgo/cip4-js'
import {BigNumber} from 'bignumber.js'

import type {RawUtxo, RemotePoolMetaSuccess} from './api/types'
import type {NetworkId, WalletImplementationId, YoroiProvider} from './config/types'
import {ISignRequest} from './crypto/ISignRequest'
import type {WalletInterface} from './crypto/WalletInterface'
import type {Token} from './types/HistoryTransaction'

// prettier-ignore
export type ServerStatusCache = {
  isServerOk: boolean,
  isMaintenance: boolean,
  serverTime: Date | null,
}

// prettier-ignore
export type WalletMeta = {
  id: string,
  name: string,
  networkId: NetworkId,
  walletImplementationId: WalletImplementationId,
  isHW: boolean,
  isShelley?: boolean | void | null, // legacy jormungandr
  isEasyConfirmationEnabled: boolean,
  checksum: WalletChecksum,
  provider?: YoroiProvider,
}

// prettier-ignore
export type ReduxWallet = {
  isEasyConfirmationEnabled: WalletInterface['isEasyConfirmationEnabled'],
  networkId: WalletInterface['networkId'],
  walletImplementationId: WalletInterface['walletImplementationId'],
  isHW: WalletInterface['isHW'],
  hwDeviceInfo: WalletInterface['hwDeviceInfo'],
  isReadOnly: WalletInterface['isReadOnly'],
  transactions: WalletInterface['transactions'],
  internalAddresses: WalletInterface['internalAddresses'],
  externalAddresses: WalletInterface['externalAddresses'],
  rewardAddressHex: WalletInterface['rewardAddressHex'],
  confirmationCounts: WalletInterface['confirmationCounts'],
  isUsedAddressIndex: WalletInterface['isUsedAddressIndex'],
  numReceiveAddresses: WalletInterface['numReceiveAddresses'],
  checksum: WalletInterface['checksum'],
  provider?: WalletInterface['provider'],
  isInitialized?: WalletInterface['isInitialized'],

  name: string,
  canGenerateNewReceiveAddress: boolean,
}

// prettier-ignore
export type State = {
  wallets: Record<string, WalletMeta>,
  wallet: ReduxWallet,
  txHistory: {
    isSynchronizing: boolean,
    lastSyncError: any, // TODO(ppershing): type me
  },
  balance: {
    isFetching: boolean,
    lastFetchingError: any,
    utxos: Array<RawUtxo> | null,
  },
  accountState: {
    isFetching: boolean,
    isDelegating: boolean,
    lastFetchingError: any,
    totalDelegated: BigNumber,
    value: BigNumber,
    poolOperator: string | null,
  },
  poolInfo: {
    isFetching: boolean,
    lastFetchingError: any,
    meta?: RemotePoolMetaSuccess,
  },
  tokenInfo: {
    isFetching: boolean,
    lastFetchingError: any,
    tokens: Record<string, Token>,
  },
  isOnline: boolean,
  isAppInitialized: boolean,
  isAuthenticated: boolean,
  isKeyboardOpen: boolean,
  appSettings: {
    acceptedTos: boolean,
    installationId: string | void | null,
    languageCode: string,
    customPinHash: string | void | null,
    isSystemAuthEnabled: boolean,
    isBiometricHardwareSupported: boolean,
    sendCrashReports: boolean,
    canEnableBiometricEncryption: boolean,
  },
  // need to add as a non-wallet-specific property to avoid conflict with other
  // actions that may override this property (otherwise more refactoring is needed)
  isFlawedWallet: boolean,
  serverStatus: ServerStatusCache,
  isMaintenance: boolean,
  voting: {
    pin: Array<number>,
    encryptedKey: string | void | null,
    catalystPrivateKey?: string,
    // TODO: it's in general not recommended to use non-plain objects in store
    unsignedTx?: ISignRequest<unknown>,
  },
}
