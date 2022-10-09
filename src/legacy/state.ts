/* eslint-disable @typescript-eslint/no-explicit-any */
import type {CardanoTypes, ServerStatus} from '../yoroi-wallets'
import type {NetworkId, WalletImplementationId, YoroiProvider} from '../yoroi-wallets/types/other'

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
export type State = {
  wallets: Record<string, WalletMeta>
  isAppInitialized: boolean
  isKeyboardOpen: boolean
  appSettings: {
    acceptedTos: boolean
    installationId: string | null | undefined
    customPinHash: string | null | undefined
    isSystemAuthEnabled: boolean
    isBiometricHardwareSupported: boolean
    sendCrashReports: boolean
    canEnableBiometricEncryption: boolean
  }
  // need to add as a non-wallet-specific property to avoid conflict with other
  // actions that may override this property (otherwise more refactoring is needed)
  isFlawedWallet: boolean
  serverStatus: ServerStatus
  isMaintenance: boolean
}
export const getInitialState = (): State => ({
  wallets: {},
  isAppInitialized: false,
  isKeyboardOpen: false,
  appSettings: {
    acceptedTos: false,
    installationId: null,
    customPinHash: null,
    isSystemAuthEnabled: false,
    isBiometricHardwareSupported: false,
    sendCrashReports: false,
    canEnableBiometricEncryption: false,
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
