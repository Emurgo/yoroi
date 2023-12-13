import {act, renderHook} from '@testing-library/react-hooks'
import {fireEvent, render} from '@testing-library/react-native'
import {Resolver} from '@yoroi/types'
import * as React from 'react'
import {TextInput} from 'react-native'

import {Button} from '../../../components/Button/Button'
import {mocks as walletMocks} from '../../../yoroi-wallets/mocks'
import {Amounts} from '../../../yoroi-wallets/utils/utils'
import {mocks as sendMocks} from './mocks'
import {initialState, SendProvider, useSelectedSecondaryAmountsCounter, useSend} from './SendContext'

const wrapper: React.FC<React.PropsWithChildren> = ({children}) => <SendProvider>{children}</SendProvider>

describe('SendContext', () => {
  test('resetForm', () => {
    const {getByTestId, getByText} = render(
      <SendProvider>
        <ResetFormTest />
      </SendProvider>,
    )

    const memoInput = getByTestId('memoInput')
    fireEvent.changeText(memoInput, 'Test memo')
    expect(memoInput.props.value).toEqual('Test memo')

    const resetButton = getByText('Reset')
    fireEvent.press(resetButton)

    expect(getByTestId('memoInput').props.value).toEqual('')
  })
})

describe('SendContext :: hooks', () => {
  test('resetForm', () => {
    const {result} = renderHook(() => useSend(), {wrapper})

    act(() => {
      result.current.memoChanged('Test memo')
    })

    expect(result.current.memo).toBe('Test memo')

    act(() => {
      result.current.reset()
    })

    expect(result.current.targets).toEqual(initialState.targets)
    expect(result.current.memo).toEqual(initialState.memo)
    expect(result.current.yoroiUnsignedTx).toEqual(initialState.yoroiUnsignedTx)
    expect(result.current.selectedTargetIndex).toEqual(initialState.selectedTargetIndex)
    expect(result.current.selectedTokenId).toEqual(initialState.selectedTokenId)
  })

  test('memoChanged', () => {
    const {result} = renderHook(() => useSend(), {wrapper})

    act(() => {
      result.current.memoChanged('Test memo')
    })

    expect(result.current.memo).toBe('Test memo')
  })

  test('tokenSelectedChanged', () => {
    const {result} = renderHook(() => useSend(), {wrapper})

    act(() => {
      result.current.tokenSelectedChanged(walletMocks.wallet.primaryTokenInfo.id)
    })

    expect(result.current.selectedTokenId).toBe(walletMocks.wallet.primaryTokenInfo.id)
  })

  test('yoroiUnsignedTxChanged', () => {
    const {result} = renderHook(() => useSend(), {wrapper})

    act(() => {
      result.current.yoroiUnsignedTxChanged(walletMocks.yoroiUnsignedTx)
    })

    expect(result.current.yoroiUnsignedTx).toEqual(walletMocks.yoroiUnsignedTx)

    act(() => {
      result.current.yoroiUnsignedTxChanged(undefined)
    })

    expect(result.current.yoroiUnsignedTx).toBeUndefined()
  })

  test('receiverResolveChanged', () => {
    const {result} = renderHook(() => useSend(), {wrapper})

    act(() => {
      result.current.receiverResolveChanged('address')
    })

    expect(result.current.targets[0].receiver).toEqual<Resolver.Receiver>({
      resolve: 'address',
      as: 'address',
      selectedNameServer: undefined,
      addressRecords: undefined,
    })
  })

  test('amountChanged', () => {
    const {result} = renderHook(() => useSend(), {wrapper})
    const amount = Amounts.getAmount(walletMocks.balances, walletMocks.wallet.primaryTokenInfo.id)

    act(() => {
      result.current.tokenSelectedChanged(amount.tokenId)
    })

    act(() => {
      result.current.amountChanged('100')
    })

    expect(result.current.targets[0].entry.amounts).toEqual({[amount.tokenId]: '100'})
  })

  test('amountRemoved', () => {
    const {result} = renderHook(() => useSend(), {wrapper})
    const amount = Amounts.getAmount(walletMocks.balances, walletMocks.wallet.primaryTokenInfo.id)

    act(() => {
      result.current.tokenSelectedChanged(amount.tokenId)
    })

    act(() => {
      result.current.amountChanged('100')
    })

    expect(result.current.targets[0].entry.amounts).toEqual({[amount.tokenId]: '100'})

    act(() => {
      result.current.amountRemoved(amount.tokenId)
    })

    expect(result.current.targets[0].entry.amounts).toEqual({})
  })

  test('missingProvider', () => {
    const {result} = renderHook(() => useSend())

    expect(result.error).toEqual(Error('SendProvider is missing'))
  })
})

const ResetFormTest = () => {
  const {memoChanged, reset, memo} = useSend()

  return (
    <>
      <TextInput testID="memoInput" value={memo} onChangeText={memoChanged} />

      <Button title="Reset" onPress={reset} />
    </>
  )
}

describe('useSelectedSecondaryAmountsCounter', () => {
  it('empty', () => {
    const {result} = renderHook(() => useSelectedSecondaryAmountsCounter(walletMocks.wallet), {
      wrapper: ({children}: {children: React.ReactNode}) => <SendProvider>{children}</SendProvider>,
    })

    expect(result.current).toEqual(0)
  })

  it('only secondary token(s)', () => {
    const {result} = renderHook(() => useSelectedSecondaryAmountsCounter(walletMocks.wallet), {
      wrapper: ({children}: {children: React.ReactNode}) => (
        <SendProvider initialState={sendMocks.counters.onlySecondary}>{children}</SendProvider>
      ),
    })

    expect(result.current).toEqual(3)
  })

  it('both token(s)', () => {
    const {result} = renderHook(() => useSelectedSecondaryAmountsCounter(walletMocks.wallet), {
      wrapper: ({children}: {children: React.ReactNode}) => (
        <SendProvider initialState={sendMocks.counters.both}>{children}</SendProvider>
      ),
    })

    expect(result.current).toEqual(4)
  })

  it('only primary token(s)', () => {
    const {result} = renderHook(() => useSelectedSecondaryAmountsCounter(walletMocks.wallet), {
      wrapper: ({children}: {children: React.ReactNode}) => (
        <SendProvider initialState={sendMocks.counters.onlyPrimary}>{children}</SendProvider>
      ),
    })

    expect(result.current).toEqual(0)
  })
})
