// @flow

import type {WalletChecksum} from '@emurgo/cip4-js'
import {BigNumber} from 'bignumber.js'

import type {RawUtxo, RemotePoolMetaSuccess} from './api/types'
import type {NetworkId, WalletImplementationId, YoroiProvider} from './config/types'
import {ISignRequest} from './crypto/ISignRequest'
import type {HWDeviceInfo} from './crypto/shelley/ledgerUtils'
import type {Token, Transaction} from './types/HistoryTransaction'

// prettier-ignore
export type ServerStatusCache = {
  isServerOk: boolean,
  isMaintenance: boolean,
  serverTime: Date | void | null,
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
export type State = {
  wallets: Record<string, WalletMeta>,
  wallet: {
    name: string, // note: comes from WalletMeta, exposed by walletManager only
    isInitialized: boolean,
    networkId: NetworkId,
    walletImplementationId: WalletImplementationId,
    provider?: YoroiProvider,
    isHW: boolean,
    hwDeviceInfo?: HWDeviceInfo,
    isReadOnly: boolean,
    isEasyConfirmationEnabled: boolean,
    transactions: Record<string, Transaction>,
    internalAddresses: Array<string>,
    externalAddresses: Array<string>,
    rewardAddressHex: string | void | null,
    confirmationCounts: Record<string, number>,
    isUsedAddressIndex: Record<string, boolean>,
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
    utxos: Array<RawUtxo> | void | null,
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
    currentVersion: string | void | null,
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
