import * as React from 'react'
import {QueryClient} from 'react-query'
import {Text, View} from 'react-native'
import {render, waitFor} from '@testing-library/react-native'

import {queryClientFixture} from '../../../fixtures/query-client'
import {wrapperManagerFixture} from '../../../fixtures/manager-wrapper'
import {resolverModuleMocks} from '../../module.mocks'
import {useResolverShowNotice} from './useResolverShowNotice'

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

  it('success', async () => {
    const TestResolver = () => {
      const showNotice = useResolverShowNotice()
      return (
        <View>
          <Text testID="showNotice">{JSON.stringify(showNotice.data)}</Text>
        </View>
      )
    }

    mockResolverModule.showNotice.read = jest.fn().mockResolvedValue(false)
    const wrapper = wrapperManagerFixture({
      queryClient,
      resolverModule: mockResolverModule,
    })
    const {getByTestId} = render(<TestResolver />, {wrapper})

    await waitFor(() => {
      expect(getByTestId('showNotice')).toBeDefined()
    })

    expect(getByTestId('showNotice').props.children).toEqual(
      JSON.stringify(false),
    )
    expect(mockResolverModule.showNotice.read).toHaveBeenCalledTimes(1)
  })

  it('error', async () => {
    const TestResolver = () => {
      const showNotice = useResolverShowNotice()
      return (
        <View>
          <Text testID="showNotifce">{JSON.stringify(showNotice)}</Text>
        </View>
      )
    }
    mockResolverModule.showNotice.read = jest.fn().mockRejectedValue('error')

    const wrapper = wrapperManagerFixture({
      queryClient,
      resolverModule: mockResolverModule,
    })
    const {getByTestId} = render(<TestResolver />, {wrapper})

    await waitFor(() => {
      expect(getByTestId('hasError')).toBeDefined()
    })
  })
})
