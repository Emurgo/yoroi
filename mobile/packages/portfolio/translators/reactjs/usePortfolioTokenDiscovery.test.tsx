import {Chain} from '@yoroi/types'

import {QueryClient} from '@tanstack/react-query'
import {render, waitFor} from '@testing-library/react-native'
import * as React from 'react'
import {Text, View} from 'react-native'

import {tokenDiscoveryMocks} from '../../adapters/token-discovery.mocks'
import {queryClientFixture} from '../../fixtures/query-client'
import {wrapperMaker} from '../../fixtures/wrapperMaker'
import {usePortfolioTokenDiscovery} from './usePortfolioTokenDiscovery'

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
      const {data} = usePortfolioTokenDiscovery({
        id: tokenDiscoveryMocks.nftCryptoKitty.id,
        network: Chain.Network.Mainnet,
        getTokenDiscovery: mockedGetTokenDiscovery,
      })
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
      const {error} = usePortfolioTokenDiscovery({
        id: tokenDiscoveryMocks.nftCryptoKitty.id,
        network: Chain.Network.Mainnet,
        getTokenDiscovery: mockedGetTokenDiscovery,
      })
      return (
        <View>
          <Text testID="error">{error?.message}</Text>
        </View>
      )
    }
    const wrapper = wrapperMaker({
      queryClient,
    })
    const {getByTestId, debug} = render(<TestComponent />, {wrapper})

    debug()
    await waitFor(() => {
      expect(getByTestId('hasError')).toBeDefined()
    })
  })
})
