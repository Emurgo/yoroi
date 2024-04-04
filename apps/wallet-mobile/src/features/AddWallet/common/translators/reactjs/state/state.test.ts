import {
  HWDeviceInfo,
  WalletSetupAction,
  WalletSetupActionType,
  walletSetupDefaultState,
  walletSetupReducer,
} from './state'

describe('State Actions', () => {
  it('unknown', () => {
    const action = {type: 'UNKNOWN'} as unknown as WalletSetupAction

    expect(() => walletSetupReducer(walletSetupDefaultState, action)).toThrow('walletSetupReducer invalid action')
  })

  it('MnemonicChanged', () => {
    const action: WalletSetupAction = {
      type: WalletSetupActionType.MnemonicChanged,
      mnemonic: 'fake-mnemonic',
    }

    const state = walletSetupReducer(walletSetupDefaultState, action)

    expect(state.mnemonic).toBe(action.mnemonic)
  })

  it('WalletNameChanged', () => {
    const action: WalletSetupAction = {
      type: WalletSetupActionType.WalletNameChanged,
      walletName: 'fancy-name',
    }

    const state = walletSetupReducer(walletSetupDefaultState, action)

    expect(state.walletName).toBe(action.walletName)
  })

  it('WalletPasswordChanged', () => {
    const action: WalletSetupAction = {
      type: WalletSetupActionType.WalletPasswordChanged,
      walletPassword: 'fake-password',
    }

    const state = walletSetupReducer(walletSetupDefaultState, action)

    expect(state.walletPassword).toBe(action.walletPassword)
  })

  it('NetworkIdChanged', () => {
    const action: WalletSetupAction = {
      type: WalletSetupActionType.NetworkIdChanged,
      networkId: 0,
    }

    const state = walletSetupReducer(walletSetupDefaultState, action)

    expect(state.networkId).toBe(action.networkId)
  })

  it('WalletImplementationIdChanged', () => {
    const action: WalletSetupAction = {
      type: WalletSetupActionType.WalletImplementationIdChanged,
      walletImplementationId: 'wallet-implementation-id',
    }

    const state = walletSetupReducer(walletSetupDefaultState, action)

    expect(state.walletImplementationId).toBe(action.walletImplementationId)
  })

  it('Reset', () => {
    const action: WalletSetupAction = {
      type: WalletSetupActionType.Reset,
    }

    const state = walletSetupReducer(
      {
        mnemonic: 'fake-mnemonic',
        walletName: 'fake-wallet-name',
        walletPassword: 'fake-password',
        networkId: 1,
        walletImplementationId: 'fake-wallet-implementation-id',
        publicKeyHex: 'asdd',
        path: [11344, 1325, 6],
        hwDeviceInfo: {foo: 'bar'} as unknown as HWDeviceInfo,
      },
      action,
    )

    expect(state).toEqual(walletSetupDefaultState)
  })
})
