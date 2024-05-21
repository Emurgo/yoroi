import {freeze, produce} from 'immer'

export const setupWalletReducer = (
  state: SetupWalletState,
  action: SetupWalletAction,
) => {
  return produce(state, (draft) => {
    switch (action.type) {
      case SetupWalletActionType.MnemonicChanged:
        draft.mnemonic = action.mnemonic
        return

      case SetupWalletActionType.WalletNameChanged:
        draft.walletName = action.walletName
        return

      case SetupWalletActionType.WalletPasswordChanged:
        draft.walletPassword = action.walletPassword
        return

      case SetupWalletActionType.NetworkIdChanged:
        draft.networkId = action.networkId
        return

      case SetupWalletActionType.WalletImplementationIdChanged:
        draft.walletImplementationId = action.walletImplementationId
        return

      case SetupWalletActionType.PublicKeyHexChanged:
        draft.publicKeyHex = action.publicKeyHex
        return

      case SetupWalletActionType.PathChanged:
        draft.path = action.path
        return

      case SetupWalletActionType.HwDeviceInfoChanged:
        draft.hwDeviceInfo = action.hwDeviceInfo
        return

      case SetupWalletActionType.SetUpTypeChanged:
        draft.setUpType = action.setUpType
        return

      case SetupWalletActionType.MnemonicTypeChanged:
        draft.mnemonicType = action.mnemonicType
        return

      case SetupWalletActionType.UseUSBChanged:
        draft.useUSB = action.useUSB
        return

      case SetupWalletActionType.ShowCreateWalletInfoModalChanged:
        draft.showCreateWalletInfoModal = action.showCreateWalletInfoModal
        return

      case SetupWalletActionType.ShowRestoreWalletInfoModalChanged:
        draft.showRestoreWalletInfoModal = action.showRestoreWalletInfoModal
        return

      case SetupWalletActionType.Reset:
        return setupWalletDefaultState

      default:
        throw new Error(`setupWalletReducer invalid action`)
    }
  })
}

export const setupWalletDefaultState: Readonly<SetupWalletState> = freeze(
  {
    mnemonic: '',
    walletName: '',
    walletPassword: '',
    networkId: -1,
    walletImplementationId: '',
    publicKeyHex: '',
    path: [],
    hwDeviceInfo: null,
    setUpType: null,
    mnemonicType: null,
    useUSB: false,
    showRestoreWalletInfoModal: true,
    showCreateWalletInfoModal: true,
  },
  true,
)

export type SetupWalletState = {
  mnemonic: string
  walletName: string
  walletPassword: string
  networkId: NetworkId
  walletImplementationId: string
  publicKeyHex: string
  path: Array<number>
  hwDeviceInfo: HWDeviceInfo | null
  setUpType: 'restore' | 'create' | 'hw' | null
  mnemonicType: 15 | 24 | null
  useUSB: boolean
  showRestoreWalletInfoModal: boolean
  showCreateWalletInfoModal: boolean
}

export enum SetupWalletActionType {
  MnemonicChanged = 'mnemonicChanged',
  WalletNameChanged = 'walletNameChanged',
  WalletPasswordChanged = 'walletPasswordChanged',
  NetworkIdChanged = 'networkIdChanged',
  WalletImplementationIdChanged = 'walletImplementationIdChanged',
  PublicKeyHexChanged = 'publicKeyHexChanged',
  PathChanged = 'pathChanged',
  HwDeviceInfoChanged = 'hwDeviceInfoChanged',
  SetUpTypeChanged = 'setUpTypeChanged',
  MnemonicTypeChanged = 'mnemonicTypeChanged',
  UseUSBChanged = 'useUSBChanged',
  Reset = 'reset',
  ShowRestoreWalletInfoModalChanged = 'showRestoreWalletInfoModalChanged',
  ShowCreateWalletInfoModalChanged = 'showCreateWalletInfoModalChanged',
}

export type SetupWalletAction =
  | {
      type: SetupWalletActionType.MnemonicChanged
      mnemonic: SetupWalletState['mnemonic']
    }
  | {
      type: SetupWalletActionType.WalletNameChanged
      walletName: SetupWalletState['walletName']
    }
  | {
      type: SetupWalletActionType.WalletPasswordChanged
      walletPassword: SetupWalletState['walletPassword']
    }
  | {
      type: SetupWalletActionType.NetworkIdChanged
      networkId: SetupWalletState['networkId']
    }
  | {
      type: SetupWalletActionType.WalletImplementationIdChanged
      walletImplementationId: SetupWalletState['walletImplementationId']
    }
  | {
      type: SetupWalletActionType.PublicKeyHexChanged
      publicKeyHex: SetupWalletState['publicKeyHex']
    }
  | {
      type: SetupWalletActionType.PathChanged
      path: SetupWalletState['path']
    }
  | {
      type: SetupWalletActionType.HwDeviceInfoChanged
      hwDeviceInfo: SetupWalletState['hwDeviceInfo']
    }
  | {
      type: SetupWalletActionType.SetUpTypeChanged
      setUpType: SetupWalletState['setUpType']
    }
  | {
      type: SetupWalletActionType.MnemonicTypeChanged
      mnemonicType: SetupWalletState['mnemonicType']
    }
  | {
      type: SetupWalletActionType.UseUSBChanged
      useUSB: SetupWalletState['useUSB']
    }
  | {
      type: SetupWalletActionType.Reset
    }
  | {
      type: SetupWalletActionType.ShowRestoreWalletInfoModalChanged
      showRestoreWalletInfoModal: SetupWalletState['showRestoreWalletInfoModal']
    }
  | {
      type: SetupWalletActionType.ShowCreateWalletInfoModalChanged
      showCreateWalletInfoModal: SetupWalletState['showCreateWalletInfoModal']
    }

export type SetupWalletActions = {
  mnemonicChanged: (mnemonic: SetupWalletState['mnemonic']) => void
  walletNameChanged: (walletName: SetupWalletState['walletName']) => void
  walletPasswordChanged: (
    walletPassword: SetupWalletState['walletPassword'],
  ) => void
  networkIdChanged: (networkId: SetupWalletState['networkId']) => void
  walletImplementationIdChanged: (
    walletImplementationId: SetupWalletState['walletImplementationId'],
  ) => void
  publicKeyHexChanged: (publicKeyHex: SetupWalletState['publicKeyHex']) => void
  pathChanged: (path: SetupWalletState['path']) => void
  hwDeviceInfoChanged: (hwDeviceInfo: SetupWalletState['hwDeviceInfo']) => void
  setUpTypeChanged: (setUpType: SetupWalletState['setUpType']) => void
  mnemonicTypeChanged: (mnemonicType: SetupWalletState['mnemonicType']) => void
  useUSBChanged: (useUSB: SetupWalletState['useUSB']) => void
  reset: () => void
  showRestoreWalletInfoModalChanged: (
    showRestoreWalletInfoModal: boolean,
  ) => void
  showCreateWalletInfoModalChanged: (showCreateWalletInfoModal: boolean) => void
}

export type SetupWalletContext = SetupWalletState & SetupWalletActions
export const setupWalletInitialContext: SetupWalletContext = freeze(
  {
    ...setupWalletDefaultState,
    mnemonicChanged: missingInit,
    walletNameChanged: missingInit,
    walletPasswordChanged: missingInit,
    networkIdChanged: missingInit,
    walletImplementationIdChanged: missingInit,
    publicKeyHexChanged: missingInit,
    pathChanged: missingInit,
    hwDeviceInfoChanged: missingInit,
    setUpTypeChanged: missingInit,
    mnemonicTypeChanged: missingInit,
    useUSBChanged: missingInit,
    reset: missingInit,
    showRestoreWalletInfoModalChanged: missingInit,
    showCreateWalletInfoModalChanged: missingInit,
  },
  true,
)

/* istanbul ignore next */
function missingInit() {
  console.error('[ExchangeContext] missing initialization')
}

// TODO: @yoroi/types
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
  HASKELL_SHELLEY_TESTNET: 300,
  UNDEFINED: -1,
  SANCHONET: 450,
} as const
export type NetworkId = (typeof NETWORK_REGISTRY)[keyof typeof NETWORK_REGISTRY]
