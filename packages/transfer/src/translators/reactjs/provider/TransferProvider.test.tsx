import {act, renderHook} from '@testing-library/react-hooks'
import {Resolver, Transfer} from '@yoroi/types'
import * as React from 'react'
import {useTransfer} from '../hooks/useTransfer'
import {defaultTransferState} from '../state/state'

import {TransferProvider} from './TransferProvider'

const wrapper: React.FC<React.PropsWithChildren> = ({children}) => (
  <TransferProvider>{children}</TransferProvider>
)

describe('SendContext :: hooks', () => {
  test('resetForm', () => {
    const {result} = renderHook(() => useTransfer(), {wrapper})

    act(() => {
      result.current.memoChanged('Test memo')
    })

    expect(result.current.memo).toBe('Test memo')

    act(() => {
      result.current.reset()
    })

    expect(result.current.targets).toEqual(defaultTransferState.targets)
    expect(result.current.memo).toEqual(defaultTransferState.memo)
    expect(result.current.unsignedTx).toEqual(defaultTransferState.unsignedTx)
    expect(result.current.selectedTargetIndex).toEqual(
      defaultTransferState.selectedTargetIndex,
    )
    expect(result.current.selectedTokenId).toEqual(
      defaultTransferState.selectedTokenId,
    )
  })

  test('memoChanged', () => {
    const {result} = renderHook(() => useTransfer(), {wrapper})

    act(() => {
      result.current.memoChanged('Test memo')
    })

    expect(result.current.memo).toBe('Test memo')
  })

  test('tokenSelectedChanged', () => {
    const {result} = renderHook(() => useTransfer(), {wrapper})

    act(() => {
      result.current.tokenSelectedChanged('')
    })

    expect(result.current.selectedTokenId).toBe('')
  })

  test('yoroiUnsignedTxChanged', () => {
    const {result} = renderHook(() => useTransfer(), {wrapper})

    act(() => {
      result.current.unsignedTxChanged(yoroiUnsignedTx)
    })

    expect(result.current.unsignedTx).toEqual(yoroiUnsignedTx)

    act(() => {
      result.current.unsignedTxChanged(undefined)
    })

    expect(result.current.unsignedTx).toBeUndefined()
  })

  test('receiverResolveChanged', () => {
    const {result} = renderHook(() => useTransfer(), {wrapper})

    act(() => {
      result.current.receiverResolveChanged('address')
    })

    expect(result.current.targets[0]?.receiver).toEqual<Resolver.Receiver>({
      resolve: 'address',
      as: 'address',
      selectedNameServer: undefined,
      addressRecords: undefined,
    })
  })

  test('amountChanged', () => {
    const {result} = renderHook(() => useTransfer(), {wrapper})

    act(() => {
      result.current.tokenSelectedChanged('id')
    })

    act(() => {
      result.current.amountChanged('100')
    })

    expect(result.current.targets[0]?.entry.amounts).toEqual({
      id: '100',
    })
  })

  test('amountRemoved', () => {
    const {result} = renderHook(() => useTransfer(), {wrapper})

    act(() => {
      result.current.tokenSelectedChanged('id')
    })

    act(() => {
      result.current.amountChanged('100')
    })

    expect(result.current.targets[0]?.entry.amounts).toEqual({
      id: '100',
    })

    act(() => {
      result.current.amountRemoved('id')
    })

    expect(result.current.targets[0]?.entry.amounts).toEqual({})
  })

  test('missingProvider', () => {
    const {result} = renderHook(() => useTransfer())

    expect(result.error).toEqual(Error('TransferProvider is missing'))
  })
})

const yoroiUnsignedTx: Transfer.UnsignedTx & {mock: true} = {
  entries: [
    {
      address: 'address1',
      amounts: {'': '99999'},
    },
  ],
  fee: {'': '12345'},
  metadata: {},
  change: [{address: 'change_address', amounts: {'': '1'}}],
  staking: {
    registrations: [],
    deregistrations: [],
    delegations: [],
    withdrawals: [],
  },
  voting: {},
  unsignedTx: {} as any,
  mock: true,
  governance: false,
}
