// @flow

import type {WalletChecksum} from '@emurgo/cip4-js'
import {BigNumber} from 'bignumber.js'

import {ISignRequest, RawUtxo, RemotePoolMetaSuccess, ServerStatus, Token, WalletInterface} from '../src/types'
import type {NetworkId, WalletImplementationId, YoroiProvider} from './config/types'

export var mockState = () => State

// prettier-ignore
export type WalletMeta = {
  id: string,
  name: string,
  networkId: NetworkId,
  walletImplementationId: WalletImplementationId,
  isHW: boolean,
  isShelley?: boolean | undefined | null, // legacy jormungandr
  isEasyConfirmationEnabled: boolean,
  checksum: WalletChecksum,
  provider?: YoroiProvider,
}

// prettier-ignore
export type ReduxWallet = Pick<
  WalletInterface,
  | 'id'
  | 'isEasyConfirmationEnabled'
  | 'networkId'
  | 'walletImplementationId'
  | 'isHW'
  | 'hwDeviceInfo'
  | 'isReadOnly'
  | 'transactions'
  | 'internalAddresses'
  | 'externalAddresses'
  | 'rewardAddressHex'
  | 'confirmationCounts'
  | 'isUsedAddressIndex'
  | 'numReceiveAddresses'
  | 'checksum'
  | 'provider'
  | 'isInitialized'
> & {
  name: string,
  canGenerateNewReceiveAddress: boolean
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
    installationId: string | undefined | null,
    languageCode: string,
    customPinHash: string | undefined | null,
    isSystemAuthEnabled: boolean,
    isBiometricHardwareSupported: boolean,
    sendCrashReports: boolean,
    canEnableBiometricEncryption: boolean,
    currentVersion: string | undefined | null,
  },
  // need to add as a non-wallet-specific property to avoid conflict with other
  // actions that may override this property (otherwise more refactoring is needed)
  isFlawedWallet: boolean,
  serverStatus: ServerStatus,
  isMaintenance: boolean,
  voting: {
    pin: Array<number>,
    encryptedKey: string | undefined | null,
    catalystPrivateKey?: string,
    // TODO: it's in general not recommended to use non-plain objects in store
    unsignedTx?: ISignRequest<unknown>,
  },
}
