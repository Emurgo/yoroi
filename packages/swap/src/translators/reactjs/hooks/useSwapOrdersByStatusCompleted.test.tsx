import * as React from 'react'
import {QueryClient} from '@tanstack/react-query'
import {Text, View} from 'react-native'
import {render, waitFor} from '@testing-library/react-native'

import {queryClientFixture} from '../../../fixtures/query-client'
import {mockSwapManager, swapManagerMocks} from '../../../manager.mocks'
import {wrapperManagerFixture} from '../../../fixtures/manager-wrapper'
import {useSwapOrdersByStatusCompleted} from './useSwapOrdersByStatusCompleted'

describe('useSwapOrdersByStatusCompleted', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    jest.clearAllMocks()
    queryClient = queryClientFixture()
  })

  afterEach(() => {
    queryClient.clear()
  })

  it('success', async () => {
    const TestCompletedOrders = () => {
      const orders = useSwapOrdersByStatusCompleted()
      return (
        <View>
          <Text testID="orders">{JSON.stringify(orders)}</Text>
        </View>
      )
    }
    mockSwapManager.order.list.byStatusCompleted = jest
      .fn()
      .mockResolvedValue(swapManagerMocks.listOrdersByStatusCompletedResponse)
    const wrapper = wrapperManagerFixture({
      queryClient,
      swapManager: mockSwapManager,
    })
    const {getByTestId} = render(<TestCompletedOrders />, {wrapper})

    await waitFor(() => {
      expect(getByTestId('orders')).toBeDefined()
    })

    expect(getByTestId('orders').props.children).toEqual(
      JSON.stringify(swapManagerMocks.listOrdersByStatusCompletedResponse),
    )
  })

  it('error', async () => {
    const TestCompletedOrders = () => {
      const orders = useSwapOrdersByStatusCompleted()
      return (
        <View>
          <Text testID="order">{JSON.stringify(orders)}</Text>
        </View>
      )
    }
    mockSwapManager.order.list.byStatusCompleted = jest
      .fn()
      .mockResolvedValue(null)
    const wrapper = wrapperManagerFixture({
      queryClient,
      swapManager: mockSwapManager,
    })
    const {getByTestId} = render(<TestCompletedOrders />, {wrapper})

    await waitFor(() => {
      expect(getByTestId('hasError')).toBeDefined()
    })
  })
})
