import * as React from 'react'
import {QueryClient} from '@tanstack/react-query'
import {Text, View} from 'react-native'
import {render, waitFor} from '@testing-library/react-native'

import {queryClientFixture} from '../../../fixtures/query-client'
import {mockSwapManager, swapManagerMocks} from '../../../manager.mocks'
import {wrapperManagerFixture} from '../../../fixtures/manager-wrapper'
import {useSwapTokensOnlyVerified} from './useSwapTokensOnlyVerified'

jest.useFakeTimers()

describe('useSwapTokensOnlyVerified', () => {
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
    const TestListToken = () => {
      const tokens = useSwapTokensOnlyVerified()
      return (
        <View>
          <Text testID="tokens">{JSON.stringify(tokens)}</Text>
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

  it('empty result (no-api data) should return []', async () => {
    mockSwapManager.tokens.list.onlyVerified = jest.fn().mockResolvedValue(null)

    const TestListToken = () => {
      const tokens = useSwapTokensOnlyVerified()
      return (
        <View>
          <Text testID="tokens">{JSON.stringify(tokens)}</Text>
        </View>
      )
    }

    const wrapper = wrapperManagerFixture({
      queryClient,
      swapManager: mockSwapManager,
    })
    const {getByTestId} = render(<TestListToken />, {wrapper})

    await waitFor(() => {
      expect(getByTestId('tokens')).toBeDefined()
    })
    expect(getByTestId('tokens').props.children).toEqual(JSON.stringify([]))
  })
})
