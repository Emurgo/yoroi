import * as React from 'react'
import {Text, View} from 'react-native'
import {render, waitFor} from '@testing-library/react-native'
import {Exchange} from '@yoroi/types'
import {QueryClient} from 'react-query'
import {queryClientFixture} from '@yoroi/common'

import {useCreateReferralLink} from './useCreateReferralLink'
import {wrapper as wrapperFixture} from '../../../fixtures/wrapper'

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
    const TestReferralLink = () => {
      const providerId = 'banxa'
      const queries: Exchange.ReferralUrlQueryStringParams = {
        orderType: 'buy',
        fiatType: 'USD',
        coinType: 'ADA',
        walletAddress: 'address',
      }

      const {referralLink} = useCreateReferralLink({
        providerId,
        queries,
        referralLinkCreate: jest
          .fn()
          .mockResolvedValue(new URL('https://example.com')),
      })

      return (
        <View>
          <Text testID="link">{JSON.stringify(referralLink)}</Text>
        </View>
      )
    }

    const wrapper = wrapperFixture({
      queryClient,
    })
    const {getByTestId} = render(<TestReferralLink />, {wrapper})

    await waitFor(() => {
      expect(getByTestId('link')).toBeDefined()
    })
    expect(getByTestId('link').props.children).toEqual(
      JSON.stringify('https://example.com/'),
    )
  })

  it('empty', async () => {
    const TestReferralLink = () => {
      const {referralLink} = useCreateReferralLink({
        providerId: 'banxa',
        queries: {} as any,
        referralLinkCreate: jest.fn().mockResolvedValue(null),
      })

      return (
        <View>
          <Text testID="link">{JSON.stringify(referralLink)}</Text>
        </View>
      )
    }

    const wrapper = wrapperFixture({
      queryClient,
    })
    const {getByTestId} = render(<TestReferralLink />, {wrapper})

    await waitFor(() => {
      expect(getByTestId('link')).toBeDefined()
    })
    expect(getByTestId('link').props.children).toEqual(JSON.stringify(''))
  })
})
