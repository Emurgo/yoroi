import * as React from 'react'
import {QueryClient} from 'react-query'
import {Text, View} from 'react-native'
import {render, waitFor} from '@testing-library/react-native'

import {queryClientFixture} from '../../../fixtures/query-client'
import {wrapperManagerFixture} from '../../../fixtures/manager-wrapper'
import {useResolverCryptoAddresses} from './useResolverCryptoAddresses'
import {resolverModuleMocks} from '../../module.mocks'

describe('useResolverCryptoAddresses', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    jest.clearAllMocks()
    queryClient = queryClientFixture()
  })

  afterEach(() => {
    queryClient.clear()
  })

  const mockResolverModule = {...resolverModuleMocks.success}
  const domain = '$test'

  it('success', async () => {
    const TestResolverAddresss = () => {
      const addresses = useResolverCryptoAddresses({receiver: domain})
      return (
        <View>
          <Text testID="addresses">{JSON.stringify(addresses.data)}</Text>
        </View>
      )
    }

    mockResolverModule.crypto.getCardanoAddresses = jest
      .fn()
      .mockResolvedValue(resolverModuleMocks.getCryptoAddressesResponse.success)
    const wrapper = wrapperManagerFixture({
      queryClient,
      resolverModule: mockResolverModule,
    })
    const {getByTestId} = render(<TestResolverAddresss />, {wrapper})

    await waitFor(() => {
      expect(getByTestId('addresses')).toBeDefined()
    })

    expect(getByTestId('addresses').props.children).toEqual(
      JSON.stringify(resolverModuleMocks.getCryptoAddressesResponse.success),
    )
    expect(mockResolverModule.crypto.getCardanoAddresses).toHaveBeenCalledWith(
      domain,
      'all',
    )
  })
})
