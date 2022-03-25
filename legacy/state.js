// @flow

import type {WalletChecksum} from '@emurgo/cip4-js'
import {BigNumber} from 'bignumber.js'

// $FlowExpectedError
import type {WalletInterface} from '../src/yoroi-wallets'
import type {RawUtxo, RemotePoolMetaSuccess} from './api/types'
import type {NetworkId, WalletImplementationId, YoroiProvider} from './config/types'
import {NETWORK_REGISTRY} from './config/types'
import {ISignRequest} from './crypto/ISignRequest'
import {mockReduxWallet} from './mockWallet'
import type {Token} from './types/HistoryTransaction'

export type ServerStatusCache = {|
  +isServerOk: boolean,
  +isMaintenance: boolean,
  +serverTime: Date | void,
  +isQueueOnline?: boolean,
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
  provider?: ?YoroiProvider,
}

export type ReduxWallet = {
  isEasyConfirmationEnabled: $PropertyType<WalletInterface, 'isEasyConfirmationEnabled'>,
  networkId: $PropertyType<WalletInterface, 'networkId'>,
  walletImplementationId: $PropertyType<WalletInterface, 'walletImplementationId'>,
  isHW: $PropertyType<WalletInterface, 'isHW'>,
  hwDeviceInfo: $PropertyType<WalletInterface, 'hwDeviceInfo'>,
  isReadOnly: $PropertyType<WalletInterface, 'isReadOnly'>,
  transactions: $PropertyType<WalletInterface, 'transactions'>,
  internalAddresses: $PropertyType<WalletInterface, 'internalAddresses'>,
  externalAddresses: $PropertyType<WalletInterface, 'externalAddresses'>,
  rewardAddressHex: $PropertyType<WalletInterface, 'rewardAddressHex'>,
  confirmationCounts: $PropertyType<WalletInterface, 'confirmationCounts'>,
  isUsedAddressIndex: $PropertyType<WalletInterface, 'isUsedAddressIndex'>,
  numReceiveAddresses: $PropertyType<WalletInterface, 'numReceiveAddresses'>,
  checksum: $PropertyType<WalletInterface, 'checksum'>,
  provider?: $PropertyType<WalletInterface, 'provider'>,
  isInitialized: $PropertyType<WalletInterface, 'isInitialized'>,

  name: string,
  canGenerateNewReceiveAddress: boolean,
}
export type State = {
  wallets: Dict<WalletMeta>,
  wallet: ReduxWallet,
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
    poolOperator: string | null,
  },
  poolInfo: {
    isFetching: boolean,
    lastFetchingError: any,
    meta: ?RemotePoolMetaSuccess,
  },
  tokenInfo: {
    isFetching: boolean,
    lastFetchingError: any,
    tokens: Dict<Token>,
  },
  isOnline: boolean,
  isAppInitialized: boolean,
  isAuthenticated: boolean,
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
  serverStatus: ServerStatusCache,
  isMaintenance: boolean,
  voting: {
    pin: Array<number>,
    encryptedKey: ?string,
    catalystPrivateKey: ?string,
    // TODO: it's in general not recommended to use non-plain objects in store
    unsignedTx: ?ISignRequest<mixed>,
  },
}

export const getInitialState = (): State => ({
  wallets: {},
  wallet: {
    name: '',
    isInitialized: false,
    networkId: NETWORK_REGISTRY.UNDEFINED,
    walletImplementationId: '',
    provider: null,
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
  tokenInfo: {
    isFetching: false,
    lastFetchingError: null,
    tokens: {},
  },
  isOnline: true, // we are online by default
  isAppInitialized: false,
  isAuthenticated: false,
  isKeyboardOpen: false,
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
    isQueueOnline: false,
  },
  isMaintenance: false,
  voting: {
    pin: [],
    encryptedKey: null,
    catalystPrivateKey: undefined,
    unsignedTx: null,
  },
})

export const mockState = (mockedState: ?State): State => {
  if (!__DEV__) {
    throw new Error('calling mockState in a production build')
  }
  return {
    ...getInitialState(),
    voting: {
      pin: [1, 2, 3, 4],
      catalystPrivateKey: 'catalystPrivateKey',
      encryptedKey:
        'encryptedKey-' +
        '29ct472073n40t2nc0tyxin347ytco127iy3n4cotimxy3' +
        '29ct472073n40t2nc0tyxin347ytco127iy3n4cotimxy3' +
        '29ct472073n40t2nc0tyxin347ytco127iy3n4cotimxy3' +
        '29ct472073n40t2nc0tyxin347ytco127iy3n4cotimxy3' +
        '-encryptedKey',
      unsignedTx: undefined,
    },
    wallet: mockReduxWallet,
    wallets: {
      '6cad6524-55bf-4ff8-903e-eb8af29b1b60': {
        id: '6cad6524-55bf-4ff8-903e-eb8af29b1b60',
        name: '1',
        networkId: 300,
        walletImplementationId: 'haskell-shelley',
        isHW: false,
        checksum: {
          ImagePart:
            'f54591c27ce0049ff4bb84c07f570d5c5c976bc03bcca77cac1c608aea75e766a5806bb8542c4e04e1a98e066ee639478521eccba5450aca0afb25fd929bbcba',
          TextPart: 'BJNB-3359',
        },
        isEasyConfirmationEnabled: false,
      },
    },
    tokenInfo: {
      isFetching: false,
      lastFetchingError: null,
      tokens: assetTokenInfos,
    },
    ...mockedState,
  }
}

export default getInitialState

const assetTokenInfos: Dict<Token> = {
  ['']: {
    networkId: 300,
    isDefault: false,
    identifier: '',
    metadata: {
      assetName: 'assetName',
      longName: 'longName',
      maxSupply: 'maxSupply',
      numberOfDecimals: 10,
      policyId: 'policyId',
      ticker: 'ticker',
      type: 'Cardano',
    },
  },
  policyId123assetName123: {
    networkId: 123,
    isDefault: false,
    identifier: 'policyId123assetName123',
    metadata: {
      assetName: 'assetName123',
      longName: 'longName123',
      maxSupply: 'maxSupply123',
      numberOfDecimals: 10,
      policyId: 'policyId1233',
      ticker: 'ticker123',
      type: 'Cardano',
    },
  },
  policyId456assetName456: {
    networkId: 456,
    isDefault: true,
    identifier: 'policyId456assetName456',
    metadata: {
      assetName: 'assetName456',
      longName: 'longName456',
      maxSupply: 'maxSupply456',
      numberOfDecimals: 10,
      policyId: 'policyId4566',
      ticker: 'ticker456',
      type: 'Cardano',
    },
  },
  policyId789assetName789: {
    networkId: 789,
    isDefault: false,
    identifier: 'policyId789assetName789',
    metadata: {
      assetName: 'assetName789',
      longName: 'longName789',
      maxSupply: 'maxSupply789',
      numberOfDecimals: 10,
      policyId: 'policyId7899',
      ticker: 'ticker789',
      type: 'Cardano',
    },
  },
  policyId111assetName111: {
    networkId: 111,
    isDefault: false,
    identifier: 'policyId111assetName111',
    metadata: {
      assetName: 'assetName111',
      longName: 'longName111',
      maxSupply: 'maxSupply111',
      numberOfDecimals: 10,
      policyId: 'policyId1119',
      ticker: 'ticker111',
      type: 'Cardano',
    },
  },
  policyId222assetName222: {
    networkId: 222,
    isDefault: false,
    identifier: 'policyId222assetName222',
    metadata: {
      assetName: 'assetName222',
      longName: 'longName222',
      maxSupply: 'maxSupply222',
      numberOfDecimals: 10,
      policyId: 'policyId2229',
      ticker: 'ticker222',
      type: 'Cardano',
    },
  },
  policyId333assetName333: {
    networkId: 333,
    isDefault: false,
    identifier: 'policyId333assetName333',
    metadata: {
      assetName: 'assetName333',
      longName: 'longName333',
      maxSupply: 'maxSupply333',
      numberOfDecimals: 10,
      policyId: 'policyId3339',
      ticker: 'ticker333',
      type: 'Cardano',
    },
  },
  policyId444assetName444: {
    networkId: 444,
    isDefault: false,
    identifier: 'policyId444assetName444',
    metadata: {
      assetName: 'assetName444',
      longName: 'longName444',
      maxSupply: 'maxSupply444',
      numberOfDecimals: 10,
      policyId: 'policyId4449',
      ticker: 'ticker444',
      type: 'Cardano',
    },
  },
  policyId555assetName555: {
    networkId: 555,
    isDefault: false,
    identifier: 'policyId555assetName555',
    metadata: {
      assetName: 'assetName555',
      longName: 'longName555',
      maxSupply: 'maxSupply555',
      numberOfDecimals: 10,
      policyId: 'policyId5559',
      ticker: 'ticker555',
      type: 'Cardano',
    },
  },
}
