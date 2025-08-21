import {Exchange} from '@yoroi/types'

import {QueryClient} from '@tanstack/react-query'
import {render, waitFor, fireEvent} from '@testing-library/react-native'
import * as React from 'react'
import {Text, View, TouchableOpacity} from 'react-native'

import {queryClientFixture} from '../../../fixtures/query-client'
import {wrapper as wrapperFixture} from '../../../fixtures/wrapper'
import {useCreateReferralLink} from './useCreateReferralLink'

describe('useCreateReferralLink', () => {
  let queryClient: QueryClient
  beforeEach(() => {
    jest.clearAllMocks()
    queryClient = queryClientFixture()
  })

  afterEach(() => {
    queryClient.clear()
  })

  it('success', async () => {
    const mockReferralLinkCreate = jest
      .fn()
      .mockResolvedValue(new URL('https://example.com'))

    const TestReferralLink = () => {
      const providerId = 'banxa'
      const queries: Exchange.ReferralUrlQueryStringParams = {
        orderType: 'buy',
        fiatType: 'USD',
        coinType: 'ADA',
        walletAddress: 'address',
      }

      const {referralLink, createReferralLink, isPending} =
        useCreateReferralLink({
          providerId,
          queries,
          referralLinkCreate: mockReferralLinkCreate,
        })

      return (
        <View>
          <Text testID="link">{JSON.stringify(referralLink)}</Text>
          <Text testID="pending">{isPending.toString()}</Text>
          <TouchableOpacity testID="button" onPress={createReferralLink} />
        </View>
      )
    }

    const wrapper = wrapperFixture({
      queryClient,
    })
    const {getByTestId} = render(<TestReferralLink />, {wrapper})

    // Initially should be empty and not pending
    expect(getByTestId('link').props.children).toEqual(JSON.stringify(''))
    expect(getByTestId('pending').props.children).toEqual('false')

    // Trigger the mutation
    fireEvent.press(getByTestId('button'))

    // Should be pending
    await waitFor(() => {
      expect(getByTestId('pending').props.children).toEqual('true')
    })

    // Should resolve with the URL
    await waitFor(() => {
      expect(getByTestId('link').props.children).toEqual(
        JSON.stringify('https://example.com/'),
      )
    })

    expect(mockReferralLinkCreate).toHaveBeenCalledWith(
      {
        providerId: 'banxa',
        queries: {
          orderType: 'buy',
          fiatType: 'USD',
          coinType: 'ADA',
          walletAddress: 'address',
        },
      },
      undefined,
    )
  })

  it('empty', async () => {
    const mockReferralLinkCreate = jest.fn().mockResolvedValue(null)

    const TestReferralLink = () => {
      const {referralLink, createReferralLink} = useCreateReferralLink({
        providerId: 'banxa',
        queries: {} as any,
        referralLinkCreate: mockReferralLinkCreate,
      })

      return (
        <View>
          <Text testID="link">{JSON.stringify(referralLink)}</Text>
          <TouchableOpacity testID="button" onPress={createReferralLink} />
        </View>
      )
    }

    const wrapper = wrapperFixture({
      queryClient,
    })
    const {getByTestId} = render(<TestReferralLink />, {wrapper})

    // Initially should be empty
    expect(getByTestId('link').props.children).toEqual(JSON.stringify(''))

    // Trigger the mutation
    fireEvent.press(getByTestId('button'))

    // Should resolve with empty string
    await waitFor(() => {
      expect(getByTestId('link').props.children).toEqual(JSON.stringify(''))
    })
  })
})
