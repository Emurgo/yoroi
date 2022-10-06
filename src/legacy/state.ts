/* eslint-disable @typescript-eslint/no-explicit-any */
import type {CardanoTypes, ServerStatus, WalletInterface} from '../yoroi-wallets'
import type {NetworkId, RawUtxo, WalletImplementationId, YoroiProvider} from '../yoroi-wallets/types/other'
import {NETWORK_REGISTRY} from '../yoroi-wallets/types/other'
import {mockReduxWallet} from './mockWallet'

export type WalletMeta = {
  id: string
  name: string
  networkId: NetworkId
  walletImplementationId: WalletImplementationId
  isHW: boolean
  isShelley?: boolean | null | undefined
  // legacy jormungandr
  isEasyConfirmationEnabled: boolean
  checksum: CardanoTypes.WalletChecksum
  provider?: YoroiProvider | null | undefined
}
export type ReduxWallet = {
  id: WalletInterface['id']
  networkId: WalletInterface['networkId']
  walletImplementationId: WalletInterface['walletImplementationId']
  isHW: WalletInterface['isHW']
  isReadOnly: WalletInterface['isReadOnly']
  transactions: WalletInterface['transactions']
  internalAddresses: WalletInterface['internalAddresses']
  externalAddresses: WalletInterface['externalAddresses']
  rewardAddressHex: WalletInterface['rewardAddressHex']
  confirmationCounts: WalletInterface['confirmationCounts']
  isUsedAddressIndex: WalletInterface['isUsedAddressIndex']
  numReceiveAddresses: WalletInterface['numReceiveAddresses']
  checksum: WalletInterface['checksum']
  provider?: WalletInterface['provider']
  isInitialized: WalletInterface['isInitialized']
  name: string
  canGenerateNewReceiveAddress: boolean
}
export type State = {
  wallets: Record<string, WalletMeta>
  wallet: ReduxWallet
  txHistory: {
    isSynchronizing: boolean
    lastSyncError: any // TODO(ppershing): type me
  }
  balance: {
    isFetching: boolean
    lastFetchingError: any
    utxos: Array<RawUtxo> | null | undefined
  }
  isAppInitialized: boolean
  isKeyboardOpen: boolean
  appSettings: {
    acceptedTos: boolean
    installationId: string | null | undefined
    customPinHash: string | null | undefined
    sendCrashReports: boolean
  }
  // need to add as a non-wallet-specific property to avoid conflict with other
  // actions that may override this property (otherwise more refactoring is needed)
  isFlawedWallet: boolean
  serverStatus: ServerStatus
  isMaintenance: boolean
}
export const getInitialState = (): State => ({
  wallets: {},
  wallet: {
    id: '',
    name: '',
    isInitialized: false,
    networkId: NETWORK_REGISTRY.UNDEFINED,
    walletImplementationId: '',
    provider: null,
    isHW: false,
    isReadOnly: false,
    transactions: {},
    internalAddresses: [],
    externalAddresses: [],
    rewardAddressHex: null,
    confirmationCounts: {},
    isUsedAddressIndex: {},
    numReceiveAddresses: 0,
    canGenerateNewReceiveAddress: false,
    checksum: {
      ImagePart: '',
      TextPart: '',
    },
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
  isAppInitialized: false,
  isKeyboardOpen: false,
  appSettings: {
    acceptedTos: false,
    installationId: null,
    customPinHash: null,
    sendCrashReports: false,
  },
  isFlawedWallet: false,
  serverStatus: {
    isServerOk: true,
    isMaintenance: false,
    serverTime: undefined,
    isQueueOnline: false,
  },
  isMaintenance: false,
})
export const mockState = (mockedState?: State | null | undefined): State => {
  if (!__DEV__) {
    throw new Error('calling mockState in a production build')
  }

  return {
    ...getInitialState(),
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
    ...mockedState,
  }
}
export default getInitialState
