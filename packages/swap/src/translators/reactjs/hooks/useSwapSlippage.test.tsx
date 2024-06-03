import * as React from 'react'
import {QueryClient} from '@tanstack/react-query'
import {Text, View} from 'react-native'
import {render, waitFor} from '@testing-library/react-native'

import {queryClientFixture} from '../../../fixtures/query-client'
import {mockSwapManager} from '../../../manager.mocks'
import {useSwapSlippage} from './useSwapSlippage'
import {wrapperManagerFixture} from '../../../fixtures/manager-wrapper'

describe('useSwapSlippage', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    jest.clearAllMocks()
    queryClient = queryClientFixture()
  })

  afterEach(() => {
    queryClient.clear()
  })

  it('success', async () => {
    const TestSwapSlippage = () => {
      const slippage = useSwapSlippage()
      return (
        <View>
          <Text testID="slippage">{slippage}</Text>
        </View>
      )
    }
    const wrapper = wrapperManagerFixture({
      queryClient,
      swapManager: mockSwapManager,
    })

    const {getByTestId} = render(<TestSwapSlippage />, {wrapper})

    await waitFor(() => {
      expect(getByTestId('slippage')).toBeDefined()
    })

    expect(getByTestId('slippage').props.children).toBe(0.1)
  })

  it('error', async () => {
    const TestSwapSlippage = () => {
      const slippage = useSwapSlippage()
      return (
        <View>
          <Text testID="slippage">{slippage}</Text>
        </View>
      )
    }
    mockSwapManager.slippage.read = jest.fn().mockResolvedValue(null)

    const wrapper = wrapperManagerFixture({
      queryClient,
      swapManager: mockSwapManager,
    })
    const {getByTestId} = render(<TestSwapSlippage />, {wrapper})

    await waitFor(() => {
      expect(getByTestId('hasError')).toBeDefined()
    })
  })
})
