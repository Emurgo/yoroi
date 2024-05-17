import * as React from 'react'

import {
  SetupWalletActions,
  SetupWalletActionType,
  SetupWalletContext,
  setupWalletDefaultState,
  setupWalletInitialContext,
  setupWalletReducer,
  SetupWalletState,
} from '../state/state'

export const SetupWalletCtx = React.createContext<SetupWalletContext>(
  setupWalletInitialContext,
)

export const SetupWalletProvider = ({
  children,
  initialState,
}: {
  children: React.ReactNode
  initialState?: Partial<SetupWalletState>
}) => {
  const [state, dispatch] = React.useReducer(setupWalletReducer, {
    ...setupWalletDefaultState,
    ...initialState,
  })

  const actions = React.useRef<SetupWalletActions>({
    mnemonicChanged: (mnemonic: SetupWalletState['mnemonic']) =>
      dispatch({type: SetupWalletActionType.MnemonicChanged, mnemonic}),
    walletNameChanged: (walletName: SetupWalletState['walletName']) =>
      dispatch({type: SetupWalletActionType.WalletNameChanged, walletName}),
    walletPasswordChanged: (
      walletPassword: SetupWalletState['walletPassword'],
    ) =>
      dispatch({
        type: SetupWalletActionType.WalletPasswordChanged,
        walletPassword,
      }),
    networkIdChanged: (networkId: SetupWalletState['networkId']) =>
      dispatch({type: SetupWalletActionType.NetworkIdChanged, networkId}),
    walletImplementationIdChanged: (
      walletImplementationId: SetupWalletState['walletImplementationId'],
    ) =>
      dispatch({
        type: SetupWalletActionType.WalletImplementationIdChanged,
        walletImplementationId,
      }),
    publicKeyHexChanged: (publicKeyHex: SetupWalletState['publicKeyHex']) =>
      dispatch({type: SetupWalletActionType.PublicKeyHexChanged, publicKeyHex}),
    pathChanged: (path: SetupWalletState['path']) =>
      dispatch({type: SetupWalletActionType.PathChanged, path}),
    hwDeviceInfoChanged: (hwDeviceInfo: SetupWalletState['hwDeviceInfo']) =>
      dispatch({type: SetupWalletActionType.HwDeviceInfoChanged, hwDeviceInfo}),
    setUpTypeChanged: (setUpType: SetupWalletState['setUpType']) =>
      dispatch({type: SetupWalletActionType.SetUpTypeChanged, setUpType}),
    mnemonicTypeChanged: (mnemonicType: SetupWalletState['mnemonicType']) =>
      dispatch({type: SetupWalletActionType.MnemonicTypeChanged, mnemonicType}),
    useUSBChanged: (useUSB: SetupWalletState['useUSB']) =>
      dispatch({type: SetupWalletActionType.UseUSBChanged, useUSB}),
    reset: () => dispatch({type: SetupWalletActionType.Reset}),
    showRestoreWalletInfoModalChanged: (
      showRestoreWalletInfoModal: SetupWalletState['showRestoreWalletInfoModal'],
    ) =>
      dispatch({
        type: SetupWalletActionType.ShowRestoreWalletInfoModalChanged,
        showRestoreWalletInfoModal,
      }),
    showCreateWalletInfoModalChanged: (
      showCreateWalletInfoModal: SetupWalletState['showCreateWalletInfoModal'],
    ) =>
      dispatch({
        type: SetupWalletActionType.ShowCreateWalletInfoModalChanged,
        showCreateWalletInfoModal,
      }),
  }).current

  const context = React.useMemo(
    () => ({
      ...state,
      ...actions,
    }),
    [state, actions],
  )

  return (
    <SetupWalletCtx.Provider value={context}>
      {children}
    </SetupWalletCtx.Provider>
  )
}
