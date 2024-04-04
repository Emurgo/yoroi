import {freeze, produce} from 'immer'

export const walletSetupReducer = (
  state: WalletSetupState,
  action: WalletSetupAction,
) => {
  return produce(state, (draft) => {
    switch (action.type) {
      case WalletSetupActionType.MnemonicChanged:
        draft.mnemonic = action.mnemonic
        return

      case WalletSetupActionType.WalletNameChanged:
        draft.walletName = action.walletName
        return

      case WalletSetupActionType.WalletPasswordChanged:
        draft.walletPassword = action.walletPassword
        return

      case WalletSetupActionType.NetworkIdChanged:
        draft.networkId = action.networkId
        return

      case WalletSetupActionType.WalletImplementationIdChanged:
        draft.walletImplementationId = action.walletImplementationId
        return

      case WalletSetupActionType.PublicKeyHexChanged:
        draft.publicKeyHex = action.publicKeyHex
        return

      case WalletSetupActionType.PathChanged:
        draft.path = action.path
        return

      case WalletSetupActionType.HwDeviceInfoChanged:
        draft.hwDeviceInfo = action.hwDeviceInfo
        return

      case WalletSetupActionType.Reset:
        return walletSetupDefaultState

      default:
        throw new Error(`walletSetupReducer invalid action`)
    }
  })
}

export const walletSetupDefaultState: Readonly<WalletSetupState> = freeze(
  {
    mnemonic: '',
    walletName: '',
    walletPassword: '',
    networkId: -1,
    walletImplementationId: '',
    publicKeyHex: '',
    path: [],
    hwDeviceInfo: null,
  },
  true,
)

export type WalletSetupState = {
  mnemonic: string
  walletName: string
  walletPassword: string
  networkId: NetworkId
  walletImplementationId: string
  publicKeyHex: string
  path: Array<number>
  hwDeviceInfo: HWDeviceInfo | null
}

export enum WalletSetupActionType {
  MnemonicChanged = 'mnemonicChanged',
  WalletNameChanged = 'walletNameChanged',
  WalletPasswordChanged = 'walletPasswordChanged',
  NetworkIdChanged = 'networkIdChanged',
  WalletImplementationIdChanged = 'walletImplementationIdChanged',
  PublicKeyHexChanged = 'publicKeyHexChanged',
  PathChanged = 'pathChanged',
  HwDeviceInfoChanged = 'hwDeviceInfoChanged',
  Reset = 'reset',
}

export type WalletSetupAction =
  | {
      type: WalletSetupActionType.MnemonicChanged
      mnemonic: WalletSetupState['mnemonic']
    }
  | {
      type: WalletSetupActionType.WalletNameChanged
      walletName: WalletSetupState['walletName']
    }
  | {
      type: WalletSetupActionType.WalletPasswordChanged
      walletPassword: WalletSetupState['walletPassword']
    }
  | {
      type: WalletSetupActionType.NetworkIdChanged
      networkId: WalletSetupState['networkId']
    }
  | {
      type: WalletSetupActionType.WalletImplementationIdChanged
      walletImplementationId: WalletSetupState['walletImplementationId']
    }
  | {
      type: WalletSetupActionType.PublicKeyHexChanged
      publicKeyHex: WalletSetupState['publicKeyHex']
    }
  | {
      type: WalletSetupActionType.PathChanged
      path: WalletSetupState['path']
    }
  | {
      type: WalletSetupActionType.HwDeviceInfoChanged
      hwDeviceInfo: WalletSetupState['hwDeviceInfo']
    }
  | {
      type: WalletSetupActionType.Reset
    }

export type WalletSetupActions = {
  mnemonicChanged: (mnemonic: WalletSetupState['mnemonic']) => void
  walletNameChanged: (walletName: WalletSetupState['walletName']) => void
  walletPasswordChanged: (
    walletPassword: WalletSetupState['walletPassword'],
  ) => void
  networkIdChanged: (networkId: WalletSetupState['networkId']) => void
  walletImplementationIdChanged: (
    walletImplementationId: WalletSetupState['walletImplementationId'],
  ) => void
  publicKeyHexChanged: (publicKeyHex: WalletSetupState['publicKeyHex']) => void
  pathChanged: (path: WalletSetupState['path']) => void
  hwDeviceInfoChanged: (path: WalletSetupState['hwDeviceInfo']) => void
  reset: () => void
}

export type WalletSetupContext = WalletSetupState & WalletSetupActions
export const walletSetupInitialContext: WalletSetupContext = freeze(
  {
    ...walletSetupDefaultState,
    mnemonicChanged: missingInit,
    walletNameChanged: missingInit,
    walletPasswordChanged: missingInit,
    networkIdChanged: missingInit,
    walletImplementationIdChanged: missingInit,
    publicKeyHexChanged: missingInit,
    pathChanged: missingInit,
    hwDeviceInfoChanged: missingInit,
    reset: missingInit,
  },
  true,
)

/* istanbul ignore next */
function missingInit() {
  console.error('[ExchangeContext] missing initialization')
}

export type HWDeviceInfo = {
  bip44AccountPublic: string
  hwFeatures: HWFeatures
}

type HWFeatures = {
  vendor: string
  model: string
  deviceId: DeviceId | null | undefined
  // for establishing a connection through BLE
  deviceObj: DeviceObj | null | undefined
  // for establishing a connection through USB
  serialHex?: string
}

export type DeviceId = string

export type DeviceObj = {
  vendorId: number
  productId: number
}

export const NETWORK_REGISTRY = {
  BYRON_MAINNET: 0,
  HASKELL_SHELLEY: 1,
  JORMUNGANDR: 100,
  // ERGO: 200,
  HASKELL_SHELLEY_TESTNET: 300,
  UNDEFINED: -1,
  SANCHONET: 450,
} as const
export type NetworkId = (typeof NETWORK_REGISTRY)[keyof typeof NETWORK_REGISTRY]
