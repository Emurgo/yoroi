import {Exchange} from '@yoroi/types'

import {QueryClient} from '@tanstack/react-query'
import {render, waitFor} from '@testing-library/react-native'
import * as React from 'react'
import {Text, View} from 'react-native'

import {providers} from '../../../adapters/api'
import {queryClientFixture} from '../../../fixtures/query-client'
import {wrapper as wrapperFixture} from '../../../fixtures/wrapper'
import {exchangeManagerMaker} from '../../../manager'
import {useExchangeProvidersByOrderType} from './useExchangeProvidersByOrderType'

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
