import * as React from 'react'
import {QueryClient} from 'react-query'
import {Text, View} from 'react-native'
import {render, waitFor} from '@testing-library/react-native'

import {queryClientFixture} from '../../../fixtures/query-client'
import {mockSwapManager, swapManagerMocks} from '../../../manager.mocks'
import {wrapperManagerFixture} from '../../../fixtures/manager-wrapper'
import {useSwapPoolsByPair} from './useSwapPoolsByPair'
import {storageSerializer} from '@yoroi/common'

describe('useSwapPoolsByPair', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    jest.clearAllMocks()
    queryClient = queryClientFixture()
  })

  afterEach(() => {
    queryClient.clear()
  })

  it('success', async () => {
    const TestPoolsByPair = () => {
      const pools = useSwapPoolsByPair({
        tokenA: 'token.A',
        tokenB: 'token.B',
      })
      return (
        <View>
          <Text testID="pools">{storageSerializer(pools.data)}</Text>
        </View>
      )
    }
    mockSwapManager.pools.list.byPair = jest
      .fn()
      .mockResolvedValue(swapManagerMocks.listPoolsByPairResponse)
    const wrapper = wrapperManagerFixture({
      queryClient,
      swapManager: mockSwapManager,
    })
    const {getByTestId} = render(<TestPoolsByPair />, {wrapper})

    await waitFor(() => {
      expect(getByTestId('pools')).toBeDefined()
    })

    expect(getByTestId('pools').props.children).toEqual(
      storageSerializer(swapManagerMocks.listPoolsByPairResponse),
    )
    expect(mockSwapManager.pools.list.byPair).toHaveBeenCalled()
    expect(mockSwapManager.pools.list.byPair).toHaveBeenCalledWith({
      tokenA: 'token.A',
      tokenB: 'token.B',
    })
  })
})
