import {act, renderHook} from '@testing-library/react-hooks'
import * as React from 'react'

import {useSetupWallet} from '../hooks/useSetupWallet'
import {HWDeviceInfo, setupWalletDefaultState} from '../state/state'
import {SetupWalletProvider} from './SetupWalletProvider'

const wrapper: React.FC<React.PropsWithChildren> = ({children}) => (
  <SetupWalletProvider>{children}</SetupWalletProvider>
)

describe('SetupWalletContext :: hooks', () => {
  test('mnemonicChanged', () => {
    const {result} = renderHook(() => useSetupWallet(), {wrapper})

    act(() => {
      result.current.mnemonicChanged('fake-mnemonic')
    })

    expect(result.current.mnemonic).toBe('fake-mnemonic')
  })

  test('walletNameChanged', () => {
    const {result} = renderHook(() => useSetupWallet(), {wrapper})

    act(() => {
      result.current.walletNameChanged('fake-walletName')
    })

    expect(result.current.walletName).toBe('fake-walletName')
  })

  test('walletPasswordChanged', () => {
    const {result} = renderHook(() => useSetupWallet(), {wrapper})

    act(() => {
      result.current.walletPasswordChanged('fake-walletPassword')
    })

    expect(result.current.walletPassword).toBe('fake-walletPassword')
  })

  test('networkIdChanged', () => {
    const {result} = renderHook(() => useSetupWallet(), {wrapper})

    act(() => {
      result.current.networkIdChanged(1)
    })

    expect(result.current.networkId).toBe(1)
  })

  test('walletImplementationIdChanged', () => {
    const {result} = renderHook(() => useSetupWallet(), {wrapper})

    act(() => {
      result.current.walletImplementationIdChanged(
        'fake-walletImplementationId',
      )
    })

    expect(result.current.walletImplementationId).toBe(
      'fake-walletImplementationId',
    )
  })

  test('publicKeyHexChanged', () => {
    const {result} = renderHook(() => useSetupWallet(), {wrapper})

    act(() => {
      result.current.publicKeyHexChanged('fake-fake-key')
    })

    expect(result.current.publicKeyHex).toBe('fake-fake-key')
  })

  test('pathChanged', () => {
    const {result} = renderHook(() => useSetupWallet(), {wrapper})

    act(() => {
      result.current.pathChanged([3838388338])
    })

    expect(result.current.path).toEqual([3838388338])
  })

  test('setUpTypeChanged', () => {
    const {result} = renderHook(() => useSetupWallet(), {wrapper})

    act(() => {
      result.current.setUpTypeChanged('create')
    })

    expect(result.current.setUpType).toBe('create')
  })

  test('mnemonicTypeChanged', () => {
    const {result} = renderHook(() => useSetupWallet(), {wrapper})

    act(() => {
      result.current.mnemonicTypeChanged(15)
    })

    expect(result.current.mnemonicType).toBe(15)
  })

  test('useUSBChanged', () => {
    const {result} = renderHook(() => useSetupWallet(), {wrapper})

    act(() => {
      result.current.useUSBChanged(true)
    })

    expect(result.current.useUSB).toBe(true)
  })

  test('showRestoreWalletInfoModalChanged', () => {
    const {result} = renderHook(() => useSetupWallet(), {wrapper})

    act(() => {
      result.current.showRestoreWalletInfoModalChanged(true)
    })

    expect(result.current.showRestoreWalletInfoModal).toBe(true)
  })

  test('walletIdChanged', () => {
    const {result} = renderHook(() => useSetupWallet(), {wrapper})

    act(() => {
      result.current.walletIdChanged('1')
    })

    expect(result.current.walletId).toBe('1')
  })

  test('showCreateWalletInfoModalChanged', () => {
    const {result} = renderHook(() => useSetupWallet(), {wrapper})

    act(() => {
      result.current.showCreateWalletInfoModalChanged(true)
    })

    expect(result.current.showCreateWalletInfoModal).toBe(true)
  })

  test('reset', () => {
    const {result} = renderHook(() => useSetupWallet(), {wrapper})

    act(() => {
      result.current.mnemonicChanged('fake-mnemonic')
      result.current.walletNameChanged('fake-walletName')
      result.current.walletPasswordChanged('fake-walletPassword')
      result.current.networkIdChanged(1)
      result.current.walletImplementationIdChanged(
        'fake-walletImplementationId',
      )
      result.current.hwDeviceInfoChanged({
        foo: 'bar',
      } as unknown as HWDeviceInfo)
    })

    expect(result.current.mnemonic).toBe('fake-mnemonic')
    expect(result.current.walletName).toBe('fake-walletName')
    expect(result.current.walletPassword).toBe('fake-walletPassword')
    expect(result.current.networkId).toBe(1)
    expect(result.current.walletImplementationId).toBe(
      'fake-walletImplementationId',
    )
    expect(result.current.hwDeviceInfo).toEqual({
      foo: 'bar',
    })

    act(() => {
      result.current.reset()
    })

    expect(result.current.mnemonic).toBe(setupWalletDefaultState.mnemonic)
    expect(result.current.walletName).toBe(setupWalletDefaultState.walletName)
    expect(result.current.walletPassword).toBe(
      setupWalletDefaultState.walletPassword,
    )
    expect(result.current.networkId).toBe(setupWalletDefaultState.networkId)
    expect(result.current.walletImplementationId).toBe(
      setupWalletDefaultState.walletImplementationId,
    )
    expect(result.current.hwDeviceInfo).toBe(
      setupWalletDefaultState.hwDeviceInfo,
    )
  })
})
