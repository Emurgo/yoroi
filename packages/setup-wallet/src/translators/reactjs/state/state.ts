import {HW, Wallet} from '@yoroi/types'
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

      case SetupWalletActionType.WalletImplementationChanged:
        draft.walletImplementation = action.walletImplementation
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

      case SetupWalletActionType.WalletIdChanged:
        draft.walletId = action.walletId
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
    walletImplementation: 'cardano-cip1852',
    publicKeyHex: '',
    path: [],
    hwDeviceInfo: null,
    setUpType: null,
    mnemonicType: null,
    useUSB: false,
    showRestoreWalletInfoModal: true,
    showCreateWalletInfoModal: true,
    walletId: null,
  },
  true,
)

export type SetupWalletState = {
  mnemonic: string
  walletName: string
  walletPassword: string
  walletImplementation: Wallet.Implementation
  publicKeyHex: string
  path: Array<number>
  hwDeviceInfo: HW.DeviceInfo | null
  setUpType: 'restore' | 'create' | 'hw' | null
  mnemonicType: 12 | 15 | 24 | null
  useUSB: boolean
  showRestoreWalletInfoModal: boolean
  showCreateWalletInfoModal: boolean
  walletId: string | null
}

export enum SetupWalletActionType {
  MnemonicChanged = 'mnemonicChanged',
  WalletNameChanged = 'walletNameChanged',
  WalletPasswordChanged = 'walletPasswordChanged',
  WalletImplementationChanged = 'walletImplementationChanged',
  PublicKeyHexChanged = 'publicKeyHexChanged',
  PathChanged = 'pathChanged',
  HwDeviceInfoChanged = 'hwDeviceInfoChanged',
  SetUpTypeChanged = 'setUpTypeChanged',
  MnemonicTypeChanged = 'mnemonicTypeChanged',
  WalletIdChanged = 'walletIdChanged',
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
      type: SetupWalletActionType.WalletImplementationChanged
      walletImplementation: SetupWalletState['walletImplementation']
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
  | {
      type: SetupWalletActionType.WalletIdChanged
      walletId: SetupWalletState['walletId']
    }

export type SetupWalletActions = {
  mnemonicChanged: (mnemonic: SetupWalletState['mnemonic']) => void
  walletNameChanged: (walletName: SetupWalletState['walletName']) => void
  walletPasswordChanged: (
    walletPassword: SetupWalletState['walletPassword'],
  ) => void
  walletImplementationChanged: (
    walletImplementation: SetupWalletState['walletImplementation'],
  ) => void
  publicKeyHexChanged: (publicKeyHex: SetupWalletState['publicKeyHex']) => void
  pathChanged: (path: SetupWalletState['path']) => void
  hwDeviceInfoChanged: (hwDeviceInfo: SetupWalletState['hwDeviceInfo']) => void
  setUpTypeChanged: (setUpType: SetupWalletState['setUpType']) => void
  mnemonicTypeChanged: (mnemonicType: SetupWalletState['mnemonicType']) => void
  useUSBChanged: (useUSB: SetupWalletState['useUSB']) => void
  walletIdChanged: (walletId: SetupWalletState['walletId']) => void
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
    walletImplementationChanged: missingInit,
    publicKeyHexChanged: missingInit,
    pathChanged: missingInit,
    hwDeviceInfoChanged: missingInit,
    setUpTypeChanged: missingInit,
    mnemonicTypeChanged: missingInit,
    useUSBChanged: missingInit,
    reset: missingInit,
    showRestoreWalletInfoModalChanged: missingInit,
    showCreateWalletInfoModalChanged: missingInit,
    walletIdChanged: missingInit,
  },
  true,
)

/* istanbul ignore next */
function missingInit() {
  console.error('[SetupWallet] missing initialization')
}
