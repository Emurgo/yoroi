import * as React from 'react'
import {QueryClient} from '@tanstack/react-query'
import {Text, View} from 'react-native'
import {render, waitFor} from '@testing-library/react-native'

import {queryClientFixture} from '../../../fixtures/query-client'
import {mockSwapManager, swapManagerMocks} from '../../../manager.mocks'
import {wrapperManagerFixture} from '../../../fixtures/manager-wrapper'
import {useSwapOrdersByStatusOpen} from './useSwapOrdersByStatusOpen'

describe('useSwapOrdersByStatusOpen', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    jest.clearAllMocks()
    queryClient = queryClientFixture()
  })

  afterEach(() => {
    queryClient.clear()
  })

  it('success', async () => {
    const TestOpenedOrders = () => {
      const orders = useSwapOrdersByStatusOpen()
      return (
        <View>
          <Text testID="orders">{JSON.stringify(orders)}</Text>
        </View>
      )
    }
    mockSwapManager.order.list.byStatusOpen = jest
      .fn()
      .mockResolvedValue(swapManagerMocks.listOrdersByStatusOpenResponse)
    const wrapper = wrapperManagerFixture({
      queryClient,
      swapManager: mockSwapManager,
    })
    const {getByTestId} = render(<TestOpenedOrders />, {wrapper})

    await waitFor(() => {
      expect(getByTestId('orders')).toBeDefined()
    })

    expect(getByTestId('orders').props.children).toEqual(
      JSON.stringify(swapManagerMocks.listOrdersByStatusOpenResponse),
    )
    expect(mockSwapManager.order.list.byStatusOpen).toHaveBeenCalled()
  })

  it('error', async () => {
    const spy = jest.spyOn(console, 'error')
    spy.mockImplementation(() => {})
    const TestOpenedOrders = () => {
      const orders = useSwapOrdersByStatusOpen()
      return (
        <View>
          <Text testID="order">{JSON.stringify(orders)}</Text>
        </View>
      )
    }
    mockSwapManager.order.list.byStatusOpen = jest.fn().mockResolvedValue(null)
    const wrapper = wrapperManagerFixture({
      queryClient,
      swapManager: mockSwapManager,
    })
    const {getByTestId} = render(<TestOpenedOrders />, {wrapper})

    await waitFor(() => {
      expect(getByTestId('hasError')).toBeDefined()
    })
    spy.mockRestore()
  })
})
