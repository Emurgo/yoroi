import {act, renderHook} from '@testing-library/react-hooks'
import {fireEvent, render} from '@testing-library/react-native'
import * as React from 'react'
import {TextInput} from 'react-native'

import {Button} from '../../../components/Button/Button'
import {mocks} from '../../../yoroi-wallets/mocks'
import {Amounts} from '../../../yoroi-wallets/utils/utils'
import {initialState, SendProvider, useSend} from './SendContext'

const wrapper = ({children}: {children: React.ReactNode}) => <SendProvider>{children}</SendProvider>

describe('SendContext :: ui', () => {
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
      result.current.resetForm()
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
      result.current.tokenSelectedChanged(mocks.wallet.primaryTokenInfo.id)
    })

    expect(result.current.selectedTokenId).toBe(mocks.wallet.primaryTokenInfo.id)
  })

  test('yoroiUnsignedTxChanged', () => {
    const {result} = renderHook(() => useSend(), {wrapper})

    act(() => {
      result.current.yoroiUnsignedTxChanged(mocks.yoroiUnsignedTx)
    })

    expect(result.current.yoroiUnsignedTx).toEqual(mocks.yoroiUnsignedTx)

    act(() => {
      result.current.yoroiUnsignedTxChanged(undefined)
    })

    expect(result.current.yoroiUnsignedTx).toBeUndefined()
  })

  test('receiverChanged', () => {
    const {result} = renderHook(() => useSend(), {wrapper})

    act(() => {
      result.current.receiverChanged('receiver123')
    })

    expect(result.current.targets[0].receiver).toBe('receiver123')
  })

  test('addressChanged', () => {
    const {result} = renderHook(() => useSend(), {wrapper})

    act(() => {
      result.current.addressChanged('address123')
    })

    expect(result.current.targets[0].entry.address).toBe('address123')
  })

  test('amountChanged', () => {
    const {result} = renderHook(() => useSend(), {wrapper})
    const amount = Amounts.getAmount(mocks.balances, mocks.wallet.primaryTokenInfo.id)

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
    const amount = Amounts.getAmount(mocks.balances, mocks.wallet.primaryTokenInfo.id)

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
  const {memoChanged, resetForm, memo} = useSend()

  return (
    <>
      <TextInput testID="memoInput" value={memo} onChangeText={memoChanged} />

      <Button title="Reset" onPress={resetForm} />
    </>
  )
}
