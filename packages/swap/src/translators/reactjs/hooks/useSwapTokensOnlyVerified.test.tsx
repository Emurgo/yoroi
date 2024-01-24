import * as React from 'react'
import {QueryClient} from 'react-query'
import {Text, View} from 'react-native'
import {render, waitFor} from '@testing-library/react-native'

import {queryClientFixture} from '../../../fixtures/query-client'
import {mockSwapManager, swapManagerMocks} from '../../../manager.mocks'
import {wrapperManagerFixture} from '../../../fixtures/manager-wrapper'
import {useSwapTokensOnlyVerified} from './useSwapTokensOnlyVerified'

describe('useSwapTokensOnlyVerified', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    jest.clearAllMocks()
    queryClient = queryClientFixture()
  })

  afterEach(() => {
    queryClient.clear()
  })

  it('success', async () => {
    const TestListToken = () => {
      const tokens = useSwapTokensOnlyVerified()
      return (
        <View>
          <Text testID="tokens">{JSON.stringify(tokens.data)}</Text>
        </View>
      )
    }

    mockSwapManager.tokens.list.onlyVerified = jest
      .fn()
      .mockResolvedValue(swapManagerMocks.listOnlyVerifiedTokensResponse)
    const wrapper = wrapperManagerFixture({
      queryClient,
      swapManager: mockSwapManager,
    })
    const {getByTestId} = render(<TestListToken />, {wrapper})

    await waitFor(() => {
      expect(getByTestId('tokens')).toBeDefined()
    })

    expect(getByTestId('tokens').props.children).toEqual(
      JSON.stringify(swapManagerMocks.listOnlyVerifiedTokensResponse),
    )
    expect(mockSwapManager.tokens.list.onlyVerified).toHaveBeenCalled()
  })
})
