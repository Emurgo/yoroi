import * as React from 'react'
import {QueryClient} from '@tanstack/react-query'
import {Text, View} from 'react-native'
import {render, waitFor} from '@testing-library/react-native'
import {queryClientFixture} from '@yoroi/common'
import {Chain} from '@yoroi/types'

import {wrapperMaker} from '../../fixtures/wrapperMaker'
import {tokenMocks} from '../../adapters/token.mocks'
import {tokenInfoMocks} from '../../adapters/token-info.mocks'
import {usePortfolioTokenInfo} from './usePortfolioTokenInfo'
import {createUnknownTokenInfo} from '../../helpers/create-unknown-token-info'
import {primaryTokenId} from '../../constants'

describe('usePortfolioTokenInfo', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    jest.clearAllMocks()
    queryClient = queryClientFixture()
  })

  afterEach(() => {
    queryClient.clear()
  })

  it('success', async () => {
    const mockedGetTokenInfo = jest
      .fn()
      .mockResolvedValue(tokenInfoMocks.apiReponse.nftCryptoKitty.success)

    const TestComponent = () => {
      const {data} = usePortfolioTokenInfo(
        {
          id: tokenMocks.nftCryptoKitty.info.id,
          network: Chain.Network.Mainnet,
          getTokenInfo: mockedGetTokenInfo,
          primaryTokenInfo: tokenInfoMocks.primaryETH,
        },
        {
          suspense: true,
        },
      )
      return (
        <View>
          <Text testID="data">{JSON.stringify(data)}</Text>
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
      JSON.stringify(tokenInfoMocks.nftCryptoKitty),
    )
    expect(mockedGetTokenInfo).toHaveBeenCalledWith(
      tokenMocks.nftCryptoKitty.info.id,
    )
  })

  it('success when PT', async () => {
    const mockedGetTokenInfo = jest
      .fn()
      .mockResolvedValue(tokenInfoMocks.primaryETH)

    const TestComponent = () => {
      const {data} = usePortfolioTokenInfo(
        {
          id: primaryTokenId,
          network: Chain.Network.Mainnet,
          getTokenInfo: mockedGetTokenInfo,
          primaryTokenInfo: tokenInfoMocks.primaryETH,
        },
        {
          suspense: true,
        },
      )
      return (
        <View>
          <Text testID="data">{JSON.stringify(data)}</Text>
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
      JSON.stringify(tokenInfoMocks.primaryETH),
    )
    expect(mockedGetTokenInfo).not.toHaveBeenCalled()
  })

  it('error should return unknonw token', async () => {
    const unknownTokenInfo = createUnknownTokenInfo({
      id: tokenMocks.nftCryptoKitty.info.id,
      name: tokenInfoMocks.nftCryptoKitty.id.split('.')[1] ?? '',
    })
    const mockedGetTokenInfo = jest.fn().mockResolvedValue(unknownTokenInfo)

    const TestComponent = () => {
      const {data} = usePortfolioTokenInfo(
        {
          id: tokenMocks.nftCryptoKitty.info.id,
          network: Chain.Network.Mainnet,
          getTokenInfo: mockedGetTokenInfo,
          primaryTokenInfo: tokenInfoMocks.primaryETH,
        },
        {
          suspense: true,
        },
      )
      return (
        <View>
          <Text testID="data">{JSON.stringify(data)}</Text>
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
      JSON.stringify(unknownTokenInfo),
    )
  })
})
