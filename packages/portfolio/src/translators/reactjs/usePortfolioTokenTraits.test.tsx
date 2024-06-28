import * as React from 'react'
import {QueryClient} from 'react-query'
import {Text, View} from 'react-native'
import {render, waitFor} from '@testing-library/react-native'
import {queryClientFixture} from '@yoroi/common'
import {Chain} from '@yoroi/types'

import {usePorfolioTokenTraits} from './usePortfolioTokenTraits'
import {wrapperMaker} from '../../fixtures/wrapperMaker'
import {tokenMocks} from '../../adapters/token.mocks'
import {tokenTraitsMocks} from '../../adapters/token-traits.mocks'

describe('usePortfolioTokenTraits', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    jest.clearAllMocks()
    queryClient = queryClientFixture()
  })

  afterEach(() => {
    queryClient.clear()
  })

  it('success', async () => {
    const mockedGetTokenTraits = jest
      .fn()
      .mockResolvedValue(tokenTraitsMocks.apiResponse.success)

    const TestComponent = () => {
      const {data} = usePorfolioTokenTraits(
        {
          id: tokenMocks.nftCryptoKitty.info.id,
          network: Chain.Network.Mainnet,
          getTokenTraits: mockedGetTokenTraits,
        },
        {
          suspense: true,
        },
      )
      return (
        <View>
          <Text testID="data">{JSON.stringify(data?.totalItems)}</Text>
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

    expect(getByTestId('data').props.children).toEqual(JSON.stringify(1))
    expect(mockedGetTokenTraits).toHaveBeenCalledWith(
      tokenMocks.nftCryptoKitty.info.id,
    )
  })

  it('error', async () => {
    const mockedGetTokenTraits = jest
      .fn()
      .mockResolvedValue(tokenTraitsMocks.apiResponse.error)

    const TestComponent = () => {
      const {data} = usePorfolioTokenTraits(
        {
          id: tokenMocks.nftCryptoKitty.info.id,
          network: Chain.Network.Mainnet,
          getTokenTraits: mockedGetTokenTraits,
        },
        {
          suspense: true,
        },
      )
      return (
        <View>
          <Text testID="data">{JSON.stringify(data?.totalItems)}</Text>
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
