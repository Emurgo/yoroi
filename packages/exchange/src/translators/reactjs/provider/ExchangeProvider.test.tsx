import {act, renderHook} from '@testing-library/react-hooks'
import * as React from 'react'
import {ExchangeProvider} from './ExchangeProvider'
import {successManagerMock} from '../../../manager.mocks'
import {useExchange} from '../hooks/useExchange'

const wrapper: React.FC<React.PropsWithChildren> = ({children}) => (
  <ExchangeProvider manager={successManagerMock}>{children}</ExchangeProvider>
)

describe('ExchangeContext :: hooks', () => {
  test('orderTypeChanged', () => {
    const {result} = renderHook(() => useExchange(), {wrapper})

    act(() => {
      result.current.orderTypeChanged('sell')
    })

    expect(result.current.orderType).toBe('sell')
  })

  test('amountInputChanged', () => {
    const {result} = renderHook(() => useExchange(), {wrapper})

    const amount = {
      disabled: true,
      error: 'fake-error',
      displayValue: '123',
      value: 321,
    }
    const canExchange = true
    act(() => {
      result.current.amountInputChanged(amount, canExchange)
    })

    expect(result.current.amount).toEqual(amount)
    expect(result.current.canExchange).toBe(canExchange)
  })

  test('providerIdChanged', () => {
    const {result} = renderHook(() => useExchange(), {wrapper})

    act(() => {
      result.current.providerIdChanged('encryptus')
    })

    expect(result.current.providerId).toEqual('encryptus')
  })
})
