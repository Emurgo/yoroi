import * as React from 'react'
import {QueryClient} from '@tanstack/react-query'
import {Text, View} from 'react-native'
import {render, waitFor} from '@testing-library/react-native'

import {queryClientFixture} from '../../../fixtures/query-client'
import {mockSwapManager, swapManagerMocks} from '../../../manager.mocks'
import {wrapperManagerFixture} from '../../../fixtures/manager-wrapper'
import {useSwapTokensByPair} from './useSwapTokensByPair'

jest.useFakeTimers()

describe('useSwapTokensByPair', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
    queryClient = queryClientFixture()
  })

  afterEach(() => {
    queryClient.clear()
  })

  it('success', async () => {
    const TestPairListToken = () => {
      const tokens = useSwapTokensByPair('.')
      return (
        <View>
          <Text testID="tokens">{JSON.stringify(tokens.data)}</Text>
        </View>
      )
    }

    mockSwapManager.tokens.list.byPair = jest
      .fn()
      .mockResolvedValue(swapManagerMocks.listTokensByPairResponse)
    const wrapper = wrapperManagerFixture({
      queryClient,
      swapManager: mockSwapManager,
    })
    const {getByTestId} = render(<TestPairListToken />, {wrapper})

    await waitFor(() => {
      expect(getByTestId('tokens')).toBeDefined()
    })

    expect(getByTestId('tokens').props.children).toEqual(
      JSON.stringify(swapManagerMocks.listTokensByPairResponse),
    )
    expect(mockSwapManager.tokens.list.byPair).toHaveBeenCalled()
    expect(mockSwapManager.tokens.list.byPair).toHaveBeenCalledWith('.')
  })
})
