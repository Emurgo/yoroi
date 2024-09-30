import * as React from 'react'
import {Text, View} from 'react-native'
import {render, waitFor} from '@testing-library/react-native'
import {Exchange} from '@yoroi/types'
import {QueryClient} from '@tanstack/react-query'
import {queryClientFixture} from '@yoroi/common'

import {useExchangeProvidersByOrderType} from './useExchangeProvidersByOrderType'
import {exchangeManagerMaker} from '../../../manager'
import {providers} from '../../../adapters/api'
import {wrapper as wrapperFixture} from '../../../fixtures/wrapper'

describe('useExchangeProvidersByOrderType', () => {
  let queryClient: QueryClient
  beforeEach(() => {
    jest.clearAllMocks()
    queryClient = queryClientFixture()
  })

  afterEach(() => {
    queryClient.clear()
  })

  it('success', async () => {
    const api = {
      getProviders: jest.fn(() => Promise.resolve(providers)),
    } as unknown as Exchange.Api

    const manager = exchangeManagerMaker({api})

    const TestProviders = () => {
      const result = useExchangeProvidersByOrderType({
        orderType: 'buy',
        providerListByOrderType: manager.provider.list.byOrderType,
      })

      return (
        <View>
          <Text testID="providers">{JSON.stringify(result)}</Text>
        </View>
      )
    }

    const wrapper = wrapperFixture({
      queryClient,
    })
    const {getByTestId} = render(<TestProviders />, {wrapper})

    await waitFor(() => {
      expect(getByTestId('providers')).toBeDefined()
    })
    expect(getByTestId('providers').props.children).toEqual(
      JSON.stringify([['banxa', providers.banxa]]),
    )
  })

  it('empty', async () => {
    const TestProviders = () => {
      const result = useExchangeProvidersByOrderType({
        orderType: 'buy',
        providerListByOrderType: jest.fn().mockResolvedValue(null),
      })

      return (
        <View>
          <Text testID="providers">{JSON.stringify(result)}</Text>
        </View>
      )
    }

    const wrapper = wrapperFixture({
      queryClient,
    })
    const {getByTestId} = render(<TestProviders />, {wrapper})

    await waitFor(() => {
      expect(getByTestId('providers')).toBeDefined()
    })
    expect(getByTestId('providers').props.children).toEqual(JSON.stringify([]))
  })
})
