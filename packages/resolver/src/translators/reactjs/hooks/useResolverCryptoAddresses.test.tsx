import * as React from 'react'
import {QueryClient} from 'react-query'
import {Text, View} from 'react-native'
import {render, waitFor} from '@testing-library/react-native'

import {queryClientFixture} from '../../../fixtures/query-client'
import {wrapperManagerFixture} from '../../../fixtures/manager-wrapper'
import {useResolverCryptoAddresses} from './useResolverCryptoAddresses'
import {resolverManagerMocks} from '../../manager.mocks'

describe('useResolverCryptoAddresses', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    jest.clearAllMocks()
    queryClient = queryClientFixture()
  })

  afterEach(() => {
    queryClient.clear()
  })

  const mockResolverManager = {...resolverManagerMocks.success}
  const domain = '$test'

  it('success', async () => {
    const TestResolverAddresss = () => {
      const addresses = useResolverCryptoAddresses({resolve: domain})
      return (
        <View>
          <Text testID="addresses">{JSON.stringify(addresses.data)}</Text>
        </View>
      )
    }

    mockResolverManager.crypto.getCardanoAddresses = jest
      .fn()
      .mockResolvedValue(
        resolverManagerMocks.getCryptoAddressesResponse.success,
      )
    const wrapper = wrapperManagerFixture({
      queryClient,
      resolverManager: mockResolverManager,
    })
    const {getByTestId} = render(<TestResolverAddresss />, {wrapper})

    await waitFor(() => {
      expect(getByTestId('addresses')).toBeDefined()
    })

    expect(getByTestId('addresses').props.children).toEqual(
      JSON.stringify(resolverManagerMocks.getCryptoAddressesResponse.success),
    )
    expect(
      mockResolverManager.crypto.getCardanoAddresses,
    ).toHaveBeenCalledTimes(1)
  })
})
