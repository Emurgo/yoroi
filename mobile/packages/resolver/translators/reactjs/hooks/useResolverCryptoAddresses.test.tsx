import {render, waitFor} from '@testing-library/react-native'
import * as React from 'react'
import {Text, View} from 'react-native'

import {wrapperManagerFixture} from '../../../fixtures/manager-wrapper'
import {resolverManagerMocks} from '../../manager.mocks'
import {useResolverCryptoAddresses} from './useResolverCryptoAddresses'

describe('useResolverCryptoAddresses', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockResolverManager = {...resolverManagerMocks.success}
  const domain = '$test'

  it('success', async () => {
    const TestResolverAddresses = () => {
      const {data} = useResolverCryptoAddresses({resolve: domain})
      return (
        <View>
          <Text testID="addresses">{JSON.stringify(data)}</Text>
        </View>
      )
    }

    mockResolverManager.crypto.getCardanoAddresses = jest
      .fn()
      .mockResolvedValue(
        resolverManagerMocks.getCryptoAddressesResponse.success,
      )

    const wrapper = wrapperManagerFixture({
      resolverManager: mockResolverManager,
    })

    const {getByTestId} = render(<TestResolverAddresses />, {wrapper})

    await waitFor(() => {
      expect(getByTestId('addresses').props.children).toEqual(
        JSON.stringify(resolverManagerMocks.getCryptoAddressesResponse.success),
      )
    })

    expect(
      mockResolverManager.crypto.getCardanoAddresses,
    ).toHaveBeenCalledTimes(1)
  })

  it('error', async () => {
    const TestResolverAddresses = () => {
      const {data, error, isError} = useResolverCryptoAddresses({
        resolve: domain,
      })
      return (
        <View>
          <Text testID="addresses">{JSON.stringify(data)}</Text>
          <Text testID="error">{JSON.stringify(error)}</Text>
          <Text testID="isError">{JSON.stringify(isError)}</Text>
        </View>
      )
    }

    const testError = new Error('Test error')
    mockResolverManager.crypto.getCardanoAddresses = jest
      .fn()
      .mockRejectedValue(testError)

    const wrapper = wrapperManagerFixture({
      resolverManager: mockResolverManager,
    })

    const {getByTestId} = render(<TestResolverAddresses />, {wrapper})

    await waitFor(() => {
      expect(getByTestId('isError').props.children).toBe('true')
    })

    expect(
      mockResolverManager.crypto.getCardanoAddresses,
    ).toHaveBeenCalledTimes(1)
  })
})
