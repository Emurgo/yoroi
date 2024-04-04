import * as React from 'react'

import {
  WalletSetupActions,
  WalletSetupActionType,
  WalletSetupContext,
  walletSetupDefaultState,
  walletSetupInitialContext,
  walletSetupReducer,
  WalletSetupState,
} from '../state/state'

export const WalletSetupCtx = React.createContext<WalletSetupContext>(
  walletSetupInitialContext,
)

export const WalletSetupProvider = ({
  children,
  initialState,
}: {
  children: React.ReactNode
  initialState?: Partial<WalletSetupState>
}) => {
  const [state, dispatch] = React.useReducer(walletSetupReducer, {
    ...walletSetupDefaultState,
    ...initialState,
  })

  const actions = React.useRef<WalletSetupActions>({
    mnemonicChanged: (mnemonic: WalletSetupState['mnemonic']) =>
      dispatch({type: WalletSetupActionType.MnemonicChanged, mnemonic}),
    walletNameChanged: (walletName: WalletSetupState['walletName']) =>
      dispatch({type: WalletSetupActionType.WalletNameChanged, walletName}),
    walletPasswordChanged: (
      walletPassword: WalletSetupState['walletPassword'],
    ) =>
      dispatch({
        type: WalletSetupActionType.WalletPasswordChanged,
        walletPassword,
      }),
    networkIdChanged: (networkId: WalletSetupState['networkId']) =>
      dispatch({type: WalletSetupActionType.NetworkIdChanged, networkId}),
    walletImplementationIdChanged: (
      walletImplementationId: WalletSetupState['walletImplementationId'],
    ) =>
      dispatch({
        type: WalletSetupActionType.WalletImplementationIdChanged,
        walletImplementationId,
      }),
    publicKeyHexChanged: (publicKeyHex: WalletSetupState['publicKeyHex']) =>
      dispatch({type: WalletSetupActionType.PublicKeyHexChanged, publicKeyHex}),
    pathChanged: (path: WalletSetupState['path']) =>
      dispatch({type: WalletSetupActionType.PathChanged, path}),
    hwDeviceInfoChanged: (hwDeviceInfo: WalletSetupState['hwDeviceInfo']) =>
      dispatch({type: WalletSetupActionType.HwDeviceInfoChanged, hwDeviceInfo}),
    setUpTypeChanged: (setUpType: WalletSetupState['setUpType']) =>
      dispatch({type: WalletSetupActionType.SetUpTypeChanged, setUpType}),
    mnemonicTypeChanged: (mnemonicType: WalletSetupState['mnemonicType']) =>
      dispatch({type: WalletSetupActionType.MnemonicTypeChanged, mnemonicType}),
    reset: () => dispatch({type: WalletSetupActionType.Reset}),
  }).current

  const context = React.useMemo(
    () => ({
      ...state,
      ...actions,
    }),
    [state, actions],
  )

  return (
    <WalletSetupCtx.Provider value={context}>
      {children}
    </WalletSetupCtx.Provider>
  )
}
