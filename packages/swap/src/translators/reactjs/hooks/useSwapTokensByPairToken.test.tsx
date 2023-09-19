import * as React from 'react'
import {QueryClient} from 'react-query'
import {Text, View} from 'react-native'
import {render, waitFor} from '@testing-library/react-native'

import {queryClientFixture} from '../../../fixtures/query-client'
import {mockSwapManager, swapManagerMocks} from '../../../manager.mocks'
import {wrapperManagerFixture} from '../../../fixtures/manager-wrapper'
import {useSwapTokensByPairToken} from './useSwapTokensByPairToken'

describe('useSwapTokensByPairToken', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    jest.clearAllMocks()
    queryClient = queryClientFixture()
  })

  afterEach(() => {
    queryClient.clear()
  })

  it('success', async () => {
    const TestPairListToken = () => {
      const tokens = useSwapTokensByPairToken('tokenIdBase')
      return (
        <View>
          <Text testID="tokens">{JSON.stringify(tokens.data)}</Text>
        </View>
      )
    }

    mockSwapManager.pairs.list.byToken = jest
      .fn()
      .mockResolvedValue(swapManagerMocks.listPairsByTokenResponse)
    const wrapper = wrapperManagerFixture({
      queryClient,
      swapManager: mockSwapManager,
    })
    const {getByTestId} = render(<TestPairListToken />, {wrapper})

    await waitFor(() => {
      expect(getByTestId('tokens')).toBeDefined()
    })

    expect(getByTestId('tokens').props.children).toEqual(
      JSON.stringify(swapManagerMocks.listPairsByTokenResponse),
    )
    expect(mockSwapManager.pairs.list.byToken).toHaveBeenCalled()
    expect(mockSwapManager.pairs.list.byToken).toHaveBeenCalledWith(
      'tokenIdBase',
    )
  })
})
