import {
  SetupWalletAction,
  SetupWalletActionType,
  setupWalletDefaultState,
  setupWalletReducer,
} from './state'

describe('State Actions', () => {
  it('unknown', () => {
    const action = {type: 'UNKNOWN'} as unknown as SetupWalletAction

    expect(() => setupWalletReducer(setupWalletDefaultState, action)).toThrow(
      'setupWalletReducer invalid action',
    )
  })

  it('MnemonicChanged', () => {
    const action: SetupWalletAction = {
      type: SetupWalletActionType.MnemonicChanged,
      mnemonic: 'fake-mnemonic',
    }

    const state = setupWalletReducer(setupWalletDefaultState, action)

    expect(state.mnemonic).toBe(action.mnemonic)
  })

  it('WalletNameChanged', () => {
    const action: SetupWalletAction = {
      type: SetupWalletActionType.WalletNameChanged,
      walletName: 'fancy-name',
    }

    const state = setupWalletReducer(setupWalletDefaultState, action)

    expect(state.walletName).toBe(action.walletName)
  })

  it('WalletPasswordChanged', () => {
    const action: SetupWalletAction = {
      type: SetupWalletActionType.WalletPasswordChanged,
      walletPassword: 'fake-password',
    }

    const state = setupWalletReducer(setupWalletDefaultState, action)

    expect(state.walletPassword).toBe(action.walletPassword)
  })

  it('AccountVisualChanged', () => {
    const action: SetupWalletAction = {
      type: SetupWalletActionType.AccountVisualChanged,
      accountVisual: 1,
    }

    const state = setupWalletReducer(setupWalletDefaultState, action)

    expect(state.accountVisual).toBe(action.accountVisual)
  })

  it('WalletIdChanged', () => {
    const action: SetupWalletAction = {
      type: SetupWalletActionType.WalletIdChanged,
      walletId: '1',
    }

    const state = setupWalletReducer(setupWalletDefaultState, action)

    expect(state.walletId).toBe(action.walletId)
  })

  it('WalletImplementationIdChanged', () => {
    const action: SetupWalletAction = {
      type: SetupWalletActionType.WalletImplementationChanged,
      walletImplementation: 'cardano-cip1852',
    }

    const state = setupWalletReducer(setupWalletDefaultState, action)

    expect(state.walletImplementation).toBe(action.walletImplementation)
  })

  it('HwDeviceInfoChanged', () => {
    const action: SetupWalletAction = {
      type: SetupWalletActionType.HwDeviceInfoChanged,
      hwDeviceInfo: {
        bip44AccountPublic: 'fake-key',
        hwFeatures: {
          deviceId: 'fake-sevice-id',
          deviceObj: null,
          model: 'Nano',
          serialHex: 'aqerkfofk',
          vendor: 'ledger.com',
        },
      },
    }

    const state = setupWalletReducer(setupWalletDefaultState, action)

    expect(state.hwDeviceInfo).toBe(action.hwDeviceInfo)
  })

  it('SetUpTypeChanged', () => {
    const action: SetupWalletAction = {
      type: SetupWalletActionType.SetUpTypeChanged,
      setUpType: 'restore',
    }

    const state = setupWalletReducer(setupWalletDefaultState, action)

    expect(state.setUpType).toBe(action.setUpType)
  })

  it('MnemonicTypeChanged', () => {
    const action: SetupWalletAction = {
      type: SetupWalletActionType.MnemonicTypeChanged,
      mnemonicType: 15,
    }

    const state = setupWalletReducer(setupWalletDefaultState, action)

    expect(state.mnemonicType).toBe(action.mnemonicType)
  })

  it('UseUSBChanged', () => {
    const action: SetupWalletAction = {
      type: SetupWalletActionType.UseUSBChanged,
      useUSB: true,
    }

    const state = setupWalletReducer(
      {...setupWalletDefaultState, useUSB: false},
      action,
    )

    expect(state.useUSB).toBe(action.useUSB)
  })

  it('ShowCreateWalletInfoModalChanged', () => {
    const action: SetupWalletAction = {
      type: SetupWalletActionType.ShowCreateWalletInfoModalChanged,
      showCreateWalletInfoModal: true,
    }

    const state = setupWalletReducer(
      {...setupWalletDefaultState, showCreateWalletInfoModal: false},
      action,
    )

    expect(state.showCreateWalletInfoModal).toBe(
      action.showCreateWalletInfoModal,
    )
  })

  it('ShowRestoreWalletInfoModalChanged', () => {
    const action: SetupWalletAction = {
      type: SetupWalletActionType.ShowRestoreWalletInfoModalChanged,
      showRestoreWalletInfoModal: true,
    }

    const state = setupWalletReducer(
      {...setupWalletDefaultState, showRestoreWalletInfoModal: false},
      action,
    )

    expect(state.showRestoreWalletInfoModal).toBe(
      action.showRestoreWalletInfoModal,
    )
  })

  it('Reset', () => {
    const action: SetupWalletAction = {
      type: SetupWalletActionType.Reset,
    }

    const state = setupWalletReducer(
      {
        mnemonic: 'fake-mnemonic',
        walletName: 'fake-wallet-name',
        walletPassword: 'fake-password',
        walletImplementation: 'cardano-cip1852',
        publicKeyHex: 'asdd',
        path: [11344, 1325, 6],
        hwDeviceInfo: {
          bip44AccountPublic: 'fake-key',
          hwFeatures: {
            deviceId: 'fake-sevice-id',
            deviceObj: null,
            model: 'Nano',
            serialHex: 'aqerkfofk',
            vendor: 'ledger.com',
          },
        },
        setUpType: 'restore',
        mnemonicType: 15,
        useUSB: true,
        showCreateWalletInfoModal: true,
        showRestoreWalletInfoModal: true,
        walletId: null,
        accountVisual: 0,
      },
      action,
    )

    expect(state).toEqual(setupWalletDefaultState)
  })
})
