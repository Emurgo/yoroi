import * as React from 'react'
import {QueryClient} from 'react-query'
import {Text, View} from 'react-native'
import {render, waitFor} from '@testing-library/react-native'
import {queryClientFixture} from '@yoroi/common'
import {Chain} from '@yoroi/types'

import {tokenDiscoveryMocks} from '../../adapters/token-discovery.mocks'
import {usePorfolioTokenDiscovery} from './usePortfolioTokenDiscovery'
import {wrapperMaker} from '../../fixtures/wrapperMaker'

describe('usePortfolioTokenDiscovery', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    jest.clearAllMocks()
    queryClient = queryClientFixture()
  })

  afterEach(() => {
    queryClient.clear()
  })

  it('success', async () => {
    const mockedGetTokenDiscovery = jest
      .fn()
      .mockResolvedValue(tokenDiscoveryMocks.apiResponseResult.success)

    const TestComponent = () => {
      const {data} = usePorfolioTokenDiscovery(
        {
          id: tokenDiscoveryMocks.nftCryptoKitty.id,
          network: Chain.Network.Mainnet,
          getTokenDiscovery: mockedGetTokenDiscovery,
        },
        {
          suspense: true,
        },
      )
      return (
        <View>
          <Text testID="data">{JSON.stringify(data?.id)}</Text>
        </View>
      )
    }
    const wrapper = wrapperMaker({
      queryClient,
    })
    const {getByTestId} = render(<TestComponent />, {wrapper})

    await waitFor(() => {
      expect(getByTestId('data')).toBeDefined()
    })

    expect(getByTestId('data').props.children).toEqual(
      JSON.stringify(tokenDiscoveryMocks.nftCryptoKitty.id),
    )
    expect(mockedGetTokenDiscovery).toHaveBeenCalled()
    expect(mockedGetTokenDiscovery).toHaveBeenCalledWith(
      tokenDiscoveryMocks.nftCryptoKitty.id,
    )
  })

  it('error', async () => {
    const mockedGetTokenDiscovery = jest
      .fn()
      .mockResolvedValue(tokenDiscoveryMocks.apiResponseResult.error)

    const TestComponent = () => {
      const {data} = usePorfolioTokenDiscovery(
        {
          id: tokenDiscoveryMocks.nftCryptoKitty.id,
          network: Chain.Network.Mainnet,
          getTokenDiscovery: mockedGetTokenDiscovery,
        },
        {
          suspense: true,
        },
      )
      return (
        <View>
          <Text testID="data">{JSON.stringify(data?.id)}</Text>
        </View>
      )
    }
    const wrapper = wrapperMaker({
      queryClient,
    })
    const {getByTestId} = render(<TestComponent />, {wrapper})

    await waitFor(() => {
      expect(getByTestId('hasError')).toBeDefined()
    })
  })
})
