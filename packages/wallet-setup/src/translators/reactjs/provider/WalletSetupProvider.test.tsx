import {act, renderHook} from '@testing-library/react-hooks'
import * as React from 'react'

import {useWalletSetup} from '../hooks/useWalletSetup'
import {HWDeviceInfo, walletSetupDefaultState} from '../state/state'
import {WalletSetupProvider} from './WalletSetupProvider'

const wrapper: React.FC<React.PropsWithChildren> = ({children}) => (
  <WalletSetupProvider>{children}</WalletSetupProvider>
)

describe('WalletSetupContext :: hooks', () => {
  test('mnemonicChanged', () => {
    const {result} = renderHook(() => useWalletSetup(), {wrapper})

    act(() => {
      result.current.mnemonicChanged('fake-mnemonic')
    })

    expect(result.current.mnemonic).toBe('fake-mnemonic')
  })

  test('walletNameChanged', () => {
    const {result} = renderHook(() => useWalletSetup(), {wrapper})

    act(() => {
      result.current.walletNameChanged('fake-walletName')
    })

    expect(result.current.walletName).toBe('fake-walletName')
  })

  test('walletPasswordChanged', () => {
    const {result} = renderHook(() => useWalletSetup(), {wrapper})

    act(() => {
      result.current.walletPasswordChanged('fake-walletPassword')
    })

    expect(result.current.walletPassword).toBe('fake-walletPassword')
  })

  test('networkIdChanged', () => {
    const {result} = renderHook(() => useWalletSetup(), {wrapper})

    act(() => {
      result.current.networkIdChanged(1)
    })

    expect(result.current.networkId).toBe(1)
  })

  test('walletImplementationIdChanged', () => {
    const {result} = renderHook(() => useWalletSetup(), {wrapper})

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
    const {result} = renderHook(() => useWalletSetup(), {wrapper})

    act(() => {
      result.current.publicKeyHexChanged('fake-fake-key')
    })

    expect(result.current.publicKeyHex).toBe('fake-fake-key')
  })

  test('pathChanged', () => {
    const {result} = renderHook(() => useWalletSetup(), {wrapper})

    act(() => {
      result.current.pathChanged([3838388338])
    })

    expect(result.current.path).toEqual([3838388338])
  })

  test('setUpTypeChanged', () => {
    const {result} = renderHook(() => useWalletSetup(), {wrapper})

    act(() => {
      result.current.setUpTypeChanged('create')
    })

    expect(result.current.setUpType).toBe('create')
  })

  test('mnemonicTypeChanged', () => {
    const {result} = renderHook(() => useWalletSetup(), {wrapper})

    act(() => {
      result.current.mnemonicTypeChanged(15)
    })

    expect(result.current.mnemonicType).toBe(15)
  })

  test('useUSBChanged', () => {
    const {result} = renderHook(() => useWalletSetup(), {wrapper})

    act(() => {
      result.current.useUSBChanged(true)
    })

    expect(result.current.useUSB).toBe(true)
  })

  test('reset', () => {
    const {result} = renderHook(() => useWalletSetup(), {wrapper})

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

    expect(result.current.mnemonic).toBe(walletSetupDefaultState.mnemonic)
    expect(result.current.walletName).toBe(walletSetupDefaultState.walletName)
    expect(result.current.walletPassword).toBe(
      walletSetupDefaultState.walletPassword,
    )
    expect(result.current.networkId).toBe(walletSetupDefaultState.networkId)
    expect(result.current.walletImplementationId).toBe(
      walletSetupDefaultState.walletImplementationId,
    )
    expect(result.current.hwDeviceInfo).toBe(
      walletSetupDefaultState.hwDeviceInfo,
    )
  })
})
