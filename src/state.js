// @flow
import {BigNumber} from 'bignumber.js'

import {NETWORK_REGISTRY} from './config/types'
import {CONFIG} from './config/config'

import type {RawUtxo, RemotePoolMetaSuccess} from './api/types'
import type {Transaction} from './types/HistoryTransaction'
import type {HWDeviceInfo} from './crypto/shelley/ledgerUtils'
import {ISignRequest} from './crypto/ISignRequest'
import type {NetworkId, WalletImplementationId} from './config/types'
import type {WalletChecksum} from '@emurgo/cip4-js'

export type ServerStatusCache = {|
  +isServerOk: boolean,
  +isMaintenance: boolean,
  +serverTime: Date | void,
|}

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
    name: string, // note: comes from WalletMeta, exposed by walletManager only
    isInitialized: boolean,
    networkId: NetworkId,
    walletImplementationId: WalletImplementationId,
    isHW: boolean,
    hwDeviceInfo: ?HWDeviceInfo,
    isReadOnly: boolean,
    isEasyConfirmationEnabled: boolean,
    transactions: Dict<Transaction>,
    internalAddresses: Array<string>,
    externalAddresses: Array<string>,
    rewardAddressHex: ?string,
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
    utxos: ?Array<RawUtxo>, // TODO(multi-asset)
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
    meta: ?RemotePoolMetaSuccess,
  },
  isOnline: boolean,
  isAppInitialized: boolean,
  isAuthenticated: boolean,
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
  serverStatus: ServerStatusCache,
  isMaintenance: boolean,
  voting: {
    pin: Array<number>,
    encryptedKey: ?string,
    catalystPrivateKey: ?string,
    // TODO: it's in general not recommended to use non-plain objects in store
    unSignedTx: ?ISignRequest<mixed>,
  },
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
    isReadOnly: false,
    isEasyConfirmationEnabled: false,
    transactions: {},
    internalAddresses: [],
    externalAddresses: [],
    rewardAddressHex: null,
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
  isAuthenticated: false,
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
  serverStatus: {
    isServerOk: true,
    isMaintenance: false,
    serverTime: undefined,
  },
  isMaintenance: false,
  voting: {
    pin: [],
    encryptedKey: null,
    catalystPrivateKey: undefined,
    unSignedTx: null,
  },
})

export const mockState = (): State => {
  if (!__DEV__) {
    throw new Error('calling mockState in a production build')
  }
  return {
    ...getInitialState(),
    wallet: {
      name: 'My wallet',
      isInitialized: true,
      networkId: CONFIG.NETWORKS.HASKELL_SHELLEY.NETWORK_ID,
      walletImplementationId:
        CONFIG.WALLETS.HASKELL_SHELLEY.WALLET_IMPLEMENTATION_ID,
      isHW: false,
      hwDeviceInfo: null,
      isReadOnly: false,
      isEasyConfirmationEnabled: false,
      transactions: {},
      internalAddresses: [],
      externalAddresses: [],
      rewardAddressHex: null,
      confirmationCounts: {},
      isUsedAddressIndex: {},
      numReceiveAddresses: 0,
      canGenerateNewReceiveAddress: false,
      checksum: {
        ImagePart:
          '1deb1b34689642510afc68cdf6427fd8d24e87869d5be2c1294ded9d1155b47567e' +
          '0825024bdf0c2ef704f52277fb020972d476425f5723270e4f05f70e58517',
        TextPart: 'ZNXA-1056',
      },
    },
  }
}

export default getInitialState
